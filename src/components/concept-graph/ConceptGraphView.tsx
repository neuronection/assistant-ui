import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  NodeToolbar,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  useStore,
  type Node,
  type Edge,
  type EdgeProps,
  type ReactFlowInstance,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import { forceSimulation, forceManyBody, forceLink, forceCollide, forceX, forceY } from 'd3-force'
import dagre from 'dagre'
import { toPng } from 'html-to-image'
import { Download, Search, ChevronDown, ChevronRight, Share2, ListTree } from 'lucide-react'
import { cn } from '../../lib/utils'
import { DynamicIcon } from './DynamicIcon'
import { getHierarchyEdgeDirection } from './hierarchyLayout'
import type {
  ConceptGraphEdgeData,
  ConceptGraphIcon,
  ConceptGraphIcons,
  ConceptGraphNode,
  ConceptGraphLabels,
  RenderContextMenu,
  RenderNodeDetail,
} from './types'

export type {
  ConceptGraphEdgeData,
  ConceptGraphIcon,
  ConceptGraphIcons,
  ConceptGraphNode,
  ConceptGraphLabels,
  GraphNodeSummary,
  RenderContextMenu,
  RenderNodeDetail,
} from './types'

export interface ConceptGraphViewProps {
  nodes: ConceptGraphNode[]
  edges: ConceptGraphEdgeData[]
  selectedNodeId?: string
  hiddenKinds?: string[]
  /** Node ids that render dimmed (low opacity, ``cursor: not-allowed``) and
   *  are ignored by ``onSelectNode`` clicks. Used by picker-style graphs to
   *  show non-selectable endpoints for relational context. Opt-in. */
  disabledNodeIds?: Set<string>
  /** Node ids that are already "picked" (in a picker's selection). Renders
   *  an accent border so the user sees what's already added. Opt-in. */
  pickedNodeIds?: Set<string>
  onSelectNode?: (id: string) => void
  onFocusNode?: (id: string) => void
  /** Called when the user clicks empty canvas or the detail card's close
   *  button. The parent should clear its ``selectedNodeId``. */
  onClearSelection?: () => void
  /** See RenderNodeDetail — floating detail card renderer. */
  renderNodeDetail?: RenderNodeDetail
  /** See RenderContextMenu — right-click context menu renderer. */
  renderContextMenu?: RenderContextMenu
  /** Show the bottom-right MiniMap overview. Defaults to true; small graph
   *  containers should disable it — it crowds a short viewport. */
  showMiniMap?: boolean
  /** Node fill color per kind key. Unkinded/unknown kinds fall back to the
   *  node's own ``color`` then a neutral gray. Also feeds the legend. */
  kindColors?: Record<string, string>
  /** Edge stroke color per relation key (feeds the legend too). */
  relationColors?: Record<string, string>
  /** Relations whose semantic hierarchy puts the TARGET above the source in
   *  the hierarchy layout (container-style edges). Defaults to the
   *  health-assistant vocabulary this module was promoted from. */
  hierarchyReversedRelations?: readonly string[]
  /** Relations rendered animated. Defaults to none. */
  animatedRelations?: readonly string[]
  /** Border color of the selected node. */
  selectedColor?: string
  /** Border color of a "picked" node (picker selection accent). */
  pickedColor?: string
  labels?: Partial<ConceptGraphLabels>
  icons?: Partial<ConceptGraphIcons>
  /** Default 'h-full' so the graph fills a height-defined parent (callers
   *  MUST give the parent a height — React Flow needs explicit dimensions). */
  className?: string
}

const DEFAULT_LABELS: ConceptGraphLabels = {
  legend: 'Legend',
  nodesHeader: 'Nodes',
  edgesHeader: 'Edges',
  findPlaceholder: 'Find…',
  png: 'PNG',
  empty: 'No concepts to visualize.',
  forceLayoutTitle: 'Force-directed layout',
  hierarchyLayoutTitle: 'Hierarchy layout (by relation direction)',
  relationsSuffix: 'rel.',
}

// Stable identities for prop defaults — fresh literals here would bust the
// layout useMemo on every render (its color/relation deps compare by
// identity) and loop the mount effects.
const NO_KINDS: string[] = []
const NO_KIND_COLORS: Record<string, string> = {}
const NO_RELATION_COLORS: Record<string, string> = {}
const NO_ANIMATED: readonly string[] = []

const FALLBACK_NODE_COLOR = '#6b7280'
const FALLBACK_EDGE_COLOR = '#94a3b8'

// Context bridge so the custom node type (registered via `nodeTypes`, which
// ReactFlow instantiates internally) can reach the parent's selection +
// detail-render callbacks without prop-drilling through NodeProps.
interface GraphNodeCtx {
  renderNodeDetail?: RenderNodeDetail
  clearSelection: () => void
  focusNode: (id: string) => void
}
const GraphNodeContext = createContext<GraphNodeCtx | null>(null)

// Extra fields we attach to each node's `data` for the custom renderer.
interface GraphItemNodeData {
  label?: React.ReactNode
  name?: string
  type?: string | null
  primary_kind?: string | null
  kinds?: string[]
  color?: string | null
  icon?: ConceptGraphIcon | null
  degree?: number
  isSelected?: boolean
}

/** Custom node: renders the standard label body, plus a floating
 *  `<NodeToolbar>` detail card (when a renderer is provided and the node is
 *  selected). NodeToolbar auto-tracks pan/zoom and avoids clipping.
 *
 *  Includes invisible `<Handle>` components on all 4 sides so ReactFlow can
 *  attach edges — custom node types don't get the default node's built-in
 *  handles, so without these edges won't render. */
const HIDDEN_HANDLE_STYLE = { opacity: 0 }

// ── Floating edges ──────────────────────────────────────────────────────────
// Standard ReactFlow technique for force-directed graphs: a custom edge type
// that computes the optimal connection point on each node's border (where the
// center-to-center line intersects the bounding box), so edges never make
// unnecessary curves — they exit/enter from the side closest to the other
// node. Re-computes on drag so it's always correct.

interface SizedNode {
  positionAbsolute?: { x: number; y: number }
  position: { x: number; y: number }
  width?: number | null
  height?: number | null
}

/** Intersection of the center-to-center line with a node's bounding box. */
function getNodeIntersection(node: SizedNode, otherNode: SizedNode): { x: number; y: number } {
  const nPos = node.positionAbsolute ?? node.position
  const oPos = otherNode.positionAbsolute ?? otherNode.position
  const nw = (node.width ?? 120) / 2
  const nh = (node.height ?? 40) / 2
  const ow = (otherNode.width ?? 120) / 2
  const oh = (otherNode.height ?? 40) / 2

  const cx = nPos.x + nw
  const cy = nPos.y + nh
  const ox = oPos.x + ow
  const oy = oPos.y + oh
  const dx = ox - cx
  const dy = oy - cy

  if (dx === 0 && dy === 0) return { x: cx, y: cy }

  const tX = Math.abs(dx) > 0 ? nw / Math.abs(dx) : Infinity
  const tY = Math.abs(dy) > 0 ? nh / Math.abs(dy) : Infinity
  const t = Math.min(tX, tY)
  return { x: cx + dx * t, y: cy + dy * t }
}

/** Which side of the node the intersection point is on (for bezier control). */
function getEdgeSide(node: SizedNode, point: { x: number; y: number }): Position {
  const nPos = node.positionAbsolute ?? node.position
  const w = node.width ?? 120
  const h = node.height ?? 40
  const rx = point.x - nPos.x
  const ry = point.y - nPos.y
  if (rx <= 1) return Position.Left
  if (rx >= w - 1) return Position.Right
  if (ry <= 1) return Position.Top
  if (ry >= h - 1) return Position.Bottom
  return Position.Top
}

const FloatingEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  markerEnd,
  style,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}) => {
  const sourceNode = useStore((s) => s.nodeInternals.get(source)) as SizedNode | undefined
  const targetNode = useStore((s) => s.nodeInternals.get(target)) as SizedNode | undefined
  if (!sourceNode || !targetNode) return null

  const sPt = getNodeIntersection(sourceNode, targetNode)
  const tPt = getNodeIntersection(targetNode, sourceNode)
  const sPos = getEdgeSide(sourceNode, sPt)
  const tPos = getEdgeSide(targetNode, tPt)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sPt.x,
    sourceY: sPt.y,
    sourcePosition: sPos,
    targetX: tPt.x,
    targetY: tPt.y,
    targetPosition: tPos,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      labelX={labelX}
      labelY={labelY}
      label={label}
      labelStyle={labelStyle}
      labelShowBg
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
      markerEnd={markerEnd}
      style={style}
    />
  )
}

const GraphItemNode: React.FC<{ id: string; data: GraphItemNodeData }> = ({ id, data }) => {
  const ctx = useContext(GraphNodeContext)
  const hasDetail = !!ctx?.renderNodeDetail
  return (
    <>
      {/* Handles exist so ReactFlow considers the node a valid edge endpoint.
          Their position is irrelevant — the floating edge type computes the
          actual connection point on the node's border dynamically. */}
      <Handle type="target" position={Position.Left} isConnectable={false} style={HIDDEN_HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} isConnectable={false} style={HIDDEN_HANDLE_STYLE} />

      {/* Always mounted so ReactFlow can track + position it; visibility
          toggled via ``isVisible`` (conditional mount breaks positioning). */}
      {hasDetail && (
        <NodeToolbar isVisible={data.isSelected} position={Position.Top} offset={8}>
          {/* Stop all interaction events from reaching the graph pane so
              scrolling/dragging inside the popup doesn't pan/zoom the graph. */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {ctx!.renderNodeDetail!({
              node: {
                id,
                name: data.name ?? '',
                type: data.type,
                primary_kind: data.primary_kind,
                color: data.color,
                icon: data.icon,
              },
              degree: data.degree ?? 0,
              onClose: () => ctx!.clearSelection(),
              onFocus: () => ctx!.focusNode(id),
            })}
          </div>
        </NodeToolbar>
      )}
      {data.label}
    </>
  )
}

const NODE_TYPES = { graphItem: GraphItemNode }
const EDGE_TYPES = { floating: FloatingEdge }

/** Collapsible color legend — maps node-kind and edge-relation colors to
 *  their labels. Renders as a compact expandable card (bottom-left Panel). */
const GraphLegend: React.FC<{
  kindColors: Record<string, string>
  relationColors: Record<string, string>
  labels: ConceptGraphLabels
  icons: ConceptGraphIcons
}> = ({ kindColors, relationColors, labels, icons }) => {
  const [open, setOpen] = useState(false)
  const ChevronDownIcon = icons.chevronDown
  const ChevronRightIcon = icons.chevronRight
  return (
    <div className="overflow-hidden rounded-[var(--as-radius-md)] border border-[var(--as-border)] bg-[var(--as-surface)] shadow-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[var(--as-muted-fg)] hover:bg-[var(--as-muted)]"
      >
        {open ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
        {labels.legend}
      </button>
      {open && (
        <div className="flex max-w-[420px] gap-3 px-2.5 pb-2 pt-1">
          <div className="space-y-0.5">
            <p className="mb-0.5 text-[9px] font-bold uppercase text-[var(--as-muted-fg)]">
              {labels.nodesHeader}
            </p>
            {Object.entries(kindColors)
              .slice(0, 8)
              .map(([k, c]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: c }} />
                  <span className="text-[10px] capitalize text-[var(--as-muted-fg)]">
                    {k.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
          </div>
          <div className="space-y-0.5">
            <p className="mb-0.5 text-[9px] font-bold uppercase text-[var(--as-muted-fg)]">
              {labels.edgesHeader}
            </p>
            {Object.entries(relationColors)
              .slice(0, 8)
              .map(([k, c]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="h-0.5 w-2.5 rounded-xs" style={{ backgroundColor: c }} />
                  <span className="text-[10px] capitalize text-[var(--as-muted-fg)]">
                    {k.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const ConceptGraphView = React.forwardRef<HTMLDivElement, ConceptGraphViewProps>(
  (
    {
      nodes,
      edges,
      selectedNodeId,
      hiddenKinds = NO_KINDS,
      disabledNodeIds,
      pickedNodeIds,
      onSelectNode,
      onFocusNode,
      onClearSelection,
      renderNodeDetail,
      renderContextMenu,
      showMiniMap = true,
      kindColors = NO_KIND_COLORS,
      relationColors = NO_RELATION_COLORS,
      hierarchyReversedRelations,
      animatedRelations = NO_ANIMATED,
      selectedColor = '#1d4ed8',
      pickedColor = '#16a34a',
      labels: labelOverrides,
      icons,
      // Default 'h-full' so the graph fills a height-defined parent (callers
      // MUST give the parent a height — React Flow needs explicit dimensions).
      // A caller can pass its own height class (e.g. 'h-[500px]') without
      // conflicting.
      className,
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_LABELS, ...labelOverrides }
    const resolvedIcons = {
      search: icons?.search ?? Search,
      download: icons?.download ?? Download,
      chevronDown: icons?.chevronDown ?? ChevronDown,
      chevronRight: icons?.chevronRight ?? ChevronRight,
      forceLayout: icons?.forceLayout ?? Share2,
      hierarchyLayout: icons?.hierarchyLayout ?? ListTree,
    }
    const hiddenSet = useMemo(() => new Set(hiddenKinds), [hiddenKinds])
    const disabledSet = useMemo(
      () => (disabledNodeIds ? new Set(disabledNodeIds) : null),
      [disabledNodeIds],
    )
    const pickedSet = useMemo(
      () => (pickedNodeIds ? new Set(pickedNodeIds) : null),
      [pickedNodeIds],
    )

    // Search-to-find + hover state.
    const [searchTerm, setSearchTerm] = useState('')
    const lowerSearch = searchTerm.trim().toLowerCase()
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

    // Layout mode: 'force' (d3-force organic) or 'hierarchy' (dagre layered,
    // relation-aware — e.g. AFFECTS puts target below source, MEMBER_OF puts
    // the group above the member).
    const [layoutMode, setLayoutMode] = useState<'force' | 'hierarchy'>('force')

    // ── 1. Compute layout ONLY when raw graph data or layout mode changes ──
    const { layoutNodes, layoutEdges } = useMemo(() => {
      const nodeMap = new Map(nodes.map((n) => [n.id, n]))
      const connectedIds = new Set<string>()
      // Degree = number of edges touching a node (either direction).
      const degree = new Map<string, number>()
      for (const e of edges) {
        connectedIds.add(e.source)
        connectedIds.add(e.target)
        degree.set(e.source, (degree.get(e.source) ?? 0) + 1)
        degree.set(e.target, (degree.get(e.target) ?? 0) + 1)
      }

      const visibleNodes = nodes

      // ── Compute positions ──
      const positions = new Map<string, { x: number; y: number }>()

      if (layoutMode === 'hierarchy') {
        // Dagre hierarchical layout — relation-aware: edges flow
        // top-to-bottom with direction determined by relation semantics
        // (e.g. AFFECTS keeps source above target; MEMBER_OF reverses so
        // the group is on top).
        const NODE_W = 150
        const NODE_H = 44
        const g = new dagre.graphlib.Graph()
        g.setGraph({ rankdir: 'TB', ranksep: 70, nodesep: 30, marginx: 40, marginy: 40 })
        g.setDefaultEdgeLabel(() => ({}))
        for (const n of nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H })
        for (const e of edges) {
          if (!connectedIds.has(e.source) || !connectedIds.has(e.target)) continue
          const { from, to } = getHierarchyEdgeDirection(
            e.source,
            e.target,
            e.relation,
            hierarchyReversedRelations,
          )
          g.setEdge(from, to)
        }
        dagre.layout(g)
        for (const id of g.nodes()) {
          const nd = g.node(id)
          if (nd) positions.set(id, { x: nd.x - NODE_W / 2, y: nd.y - NODE_H / 2 })
        }
      } else {
        // d3-force layout (organic, spread-out)
        interface SimNode {
          id: string
          x: number
          y: number
          vx: number
          vy: number
        }
        interface SimLink {
          source: string
          target: string
        }

        const simNodes: SimNode[] = visibleNodes.map((n) => ({ id: n.id, x: 0, y: 0, vx: 0, vy: 0 }))
        const simLinks: SimLink[] = edges
          .filter((e) => connectedIds.has(e.source) && connectedIds.has(e.target))
          .map((e) => ({ source: e.source, target: e.target }))

        const simulation = forceSimulation<SimNode>(simNodes)
          .force('charge', forceManyBody().strength(-180))
          .force(
            'link',
            forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(100).strength(0.6),
          )
          .force('collide', forceCollide(85))
          .force('x', forceX(0).strength(0.04))
          .force('y', forceY(0).strength(0.04))
          .stop()

        for (let i = 0; i < 500; i++) simulation.tick()
        for (const n of simNodes) positions.set(n.id, { x: n.x, y: n.y })
      }

      const animatedSet = new Set(animatedRelations)
      const fnodes: Node[] = nodes
        .filter((n) => positions.has(n.id))
        .map((n) => {
          const pos = positions.get(n.id)!
          const bg = n.color || kindColors[n.primary_kind || ''] || FALLBACK_NODE_COLOR
          const labelKind = n.primary_kind || (n.kinds?.[0] ?? '')
          return {
            id: n.id,
            data: {
              label: (
                <div className="flex max-w-[160px] items-center gap-1.5 leading-tight">
                  {n.icon ? (
                    <DynamicIcon icon={n.icon} className="h-3 w-3 shrink-0 opacity-90" />
                  ) : null}
                  <div className="flex min-w-0 flex-col items-start">
                    <span className="truncate">{n.name}</span>
                    <span className="text-[8px] uppercase tracking-wide opacity-60">
                      {labelKind.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ),
              name: n.name,
              primary_kind: n.primary_kind,
              kinds: n.kinds,
              type: n.type,
              icon: n.icon,
              color: n.color,
              degree: degree.get(n.id) ?? 0,
            },
            type: 'graphItem',
            position: pos,
            style: {
              color: '#fff',
              borderRadius: '10px',
              background: bg,
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: '11px',
              fontWeight: 500,
              padding: '5px 10px',
              cursor: 'pointer',
              opacity: 1,
              textAlign: 'left' as const,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            },
          }
        })

      const fedges: Edge[] = edges
        .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'floating',
          label: e.relation.replace(/_/g, ' '),
          labelStyle: { fontSize: 9, fill: 'var(--as-muted-fg)' },
          labelBgStyle: { fill: 'var(--as-surface)' },
          labelBgPadding: [4, 2] as [number, number],
          style: {
            stroke: relationColors[e.relation] || FALLBACK_EDGE_COLOR,
            strokeWidth: 1.5,
          },
          animated: animatedSet.has(e.relation),
        }))

      return { layoutNodes: fnodes, layoutEdges: fedges }
    }, [nodes, edges, layoutMode, kindColors, relationColors, hierarchyReversedRelations, animatedRelations])

    // ── 2. ReactFlow internal state — gives it control over drag positions ──
    const [rfNodes, setRfNodes, onNodesChange] = useNodesState(layoutNodes)
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(layoutEdges)

    // ── 3. When raw data changes, reset positions from layout ──
    useEffect(() => {
      setRfNodes(layoutNodes)
    }, [layoutNodes, setRfNodes])
    useEffect(() => {
      setRfEdges(layoutEdges)
    }, [layoutEdges, setRfEdges])

    // ── 3b. After layout recomputes (e.g. depth/filter changed), fit the
    //    view. Runs ONLY on layoutNodes change — NOT on selection change, so
    //    deselecting a node doesn't move/resize the viewport. ──
    const rfInstance = useRef<ReactFlowInstance | null>(null)
    useEffect(() => {
      if (!rfInstance.current) return
      const inst = rfInstance.current
      const t = setTimeout(() => {
        inst.fitView({ padding: 0.25, duration: 400 })
      }, 50)
      return () => clearTimeout(t)
    }, [layoutNodes])

    // ── 3c. Center on a node when it's selected (but don't touch the
    //    viewport when deselecting — leave the camera where the user left
    //    it). ──
    useEffect(() => {
      if (!rfInstance.current || !selectedNodeId) return
      const inst = rfInstance.current
      const node = layoutNodes.find((n) => n.id === selectedNodeId)
      if (!node) return
      const t = setTimeout(() => {
        inst.setCenter(node.position.x, node.position.y, { zoom: 1, duration: 400 })
      }, 50)
      return () => clearTimeout(t)
    }, [selectedNodeId, layoutNodes])

    // ── 4. Style updates (selection / hidden / search) — preserves drag ──
    // NOTE: ``hoveredNodeId`` is intentionally NOT in the deps — rebuilding
    // all node objects on every mouse enter/leave kills performance with
    // large graphs. Hover styling is CSS-driven via the [data-as] block.
    useEffect(() => {
      setRfNodes((prev) =>
        prev.map((n) => {
          const data = (n.data as GraphItemNodeData) ?? {}
          const nodeKinds: string[] =
            Array.isArray(data.kinds) && data.kinds.length
              ? data.kinds
              : data.primary_kind
                ? [data.primary_kind]
                : []
          const isSelected = n.id === selectedNodeId
          const isDisabled = disabledSet ? disabledSet.has(n.id) : false
          const isPicked = !isDisabled && pickedSet ? pickedSet.has(n.id) : false
          // Multi-kind: a node is dimmed only when ALL of its kinds are hidden.
          const dimmed = nodeKinds.length > 0 && nodeKinds.every((k) => hiddenSet.has(k))
          const name = typeof data.name === 'string' ? data.name.toLowerCase() : ''
          const searchMiss = lowerSearch.length > 0 && !name.includes(lowerSearch)
          const baseOpacity = isDisabled ? 0.3 : dimmed ? 0.15 : searchMiss ? 0.2 : 1
          return {
            ...n,
            data: { ...data, isSelected, isDisabled, isPicked },
            style: {
              ...n.style,
              opacity: baseOpacity,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              border: isSelected
                ? `3px solid ${selectedColor}`
                : isPicked
                  ? `2px solid ${pickedColor}`
                  : '1px solid rgba(255,255,255,0.3)',
              fontWeight: isSelected || isPicked ? 'bold' : 'normal',
              boxShadow: isSelected
                ? '0 0 0 4px rgba(37,99,235,0.25)'
                : isPicked
                  ? '0 0 0 3px rgba(22,163,74,0.2)'
                  : '0 1px 3px rgba(0,0,0,0.15)',
            },
          }
        }),
      )
    }, [selectedNodeId, hiddenSet, disabledSet, pickedSet, setRfNodes, lowerSearch, selectedColor, pickedColor])

    // ── Right-click context menu state (declared early so click/drag
    //    handlers below can reference closeContextMenu). ──
    const [contextMenu, setContextMenu] = useState<{
      x: number
      y: number
      id: string
      data: GraphItemNodeData
    } | null>(null)
    const closeContextMenu = useCallback(() => setContextMenu(null), [])

    // Distinguish click from drag: ReactFlow fires onNodeClick after a drag
    // if the mouse-up is on the node. We suppress the click if a drag just
    // ended.
    const didDragRef = useRef(false)
    const onNodeDragStart = useCallback(() => {
      didDragRef.current = false
    }, [])
    const onNodeDrag = useCallback(() => {
      didDragRef.current = true
    }, [])
    const onNodeDragStop = useCallback(() => {
      // Reset after a tick so the click handler (fires synchronously after
      // drag-stop) can still read the flag.
      setTimeout(() => {
        didDragRef.current = false
      }, 50)
    }, [])

    const onNodeClick = useCallback(
      (_e: React.MouseEvent, node: Node) => {
        if (didDragRef.current) return // ignore click right after a drag
        closeContextMenu()
        if (disabledSet && disabledSet.has(node.id)) return
        onSelectNode?.(node.id)
      },
      [onSelectNode, closeContextMenu, disabledSet],
    )

    const onNodeDoubleClick = useCallback(
      (_e: React.MouseEvent, node: Node) => onFocusNode?.(node.id),
      [onFocusNode],
    )

    // Search: Enter centers the graph on the first matching node.
    const onSearchSubmit = useCallback(() => {
      if (!lowerSearch || !rfInstance.current) return
      const match = rfNodes.find((n) => {
        const name = (n.data as GraphItemNodeData)?.name
        return typeof name === 'string' && name.toLowerCase().includes(lowerSearch)
      })
      if (match) {
        rfInstance.current.setCenter(match.position.x, match.position.y, {
          zoom: 1,
          duration: 400,
        })
      }
    }, [lowerSearch, rfNodes])

    // Hover handlers (quick preview without selecting).
    const onNodeMouseEnter = useCallback((_e: React.MouseEvent, node: Node) => setHoveredNodeId(node.id), [])
    const onNodeMouseLeave = useCallback(() => setHoveredNodeId(null), [])

    // Center the graph on a node (used by the detail card's Focus button).
    const focusNode = useCallback(
      (id: string) => {
        if (!rfInstance.current) return
        const node = rfNodes.find((n) => n.id === id)
        if (node) {
          rfInstance.current.setCenter(node.position.x, node.position.y, {
            zoom: 1,
            duration: 400,
          })
        }
      },
      [rfNodes],
    )

    // Bridge the parent's selection-clear into the custom-node context.
    const clearSelection = useCallback(() => onClearSelection?.(), [onClearSelection])

    const ctxValue = useMemo<GraphNodeCtx>(
      () => ({ renderNodeDetail, clearSelection, focusNode }),
      [renderNodeDetail, clearSelection, focusNode],
    )

    // Clicking empty canvas closes the detail card (deselects) AND the
    // right-click context menu.
    const onPaneClick = useCallback(() => {
      onClearSelection?.()
      closeContextMenu()
    }, [onClearSelection, closeContextMenu])

    const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
      e.preventDefault()
      const data = (node.data as GraphItemNodeData) ?? {}
      setContextMenu({ x: e.clientX, y: e.clientY, id: node.id, data })
    }, [])

    // ── Download as PNG — captures the FULL graph, tightly cropped ──
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    // Merge the internal PNG-capture ref with the consumer's forwarded ref.
    const setWrapper = useCallback(
      (el: HTMLDivElement | null) => {
        wrapperRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      },
      [ref],
    )
    const handleDownload = useCallback(async () => {
      const el = wrapperRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null
      if (!el || rfNodes.length === 0) return

      // Compute bounding box from current node positions
      const NODE_W = 170
      const NODE_H = 56
      const PAD = 60
      const xs = rfNodes.map((n) => n.position.x)
      const ys = rfNodes.map((n) => n.position.y)
      const minX = Math.min(...xs) - PAD
      const minY = Math.min(...ys) - PAD
      const maxX = Math.max(...xs) + NODE_W + PAD
      const maxY = Math.max(...ys) + NODE_H + PAD
      const width = maxX - minX
      const height = maxY - minY

      try {
        const dataUrl = await toPng(el, {
          backgroundColor: '#f8fafc',
          pixelRatio: 2,
          width,
          height,
          style: {
            transform: `translate(${-minX}px, ${-minY}px)`,
            width: `${width}px`,
            height: `${height}px`,
          },
          filter: (node) => {
            if (node instanceof HTMLElement) {
              return (
                !node.classList.contains('react-flow__minimap') &&
                !node.classList.contains('react-flow__controls') &&
                !node.classList.contains('react-flow__panel')
              )
            }
            return true
          },
        })
        const link = document.createElement('a')
        link.download = 'concept-graph.png'
        link.href = dataUrl
        link.click()
      } catch {
        /* best-effort */
      }
    }, [rfNodes])

    if (nodes.length === 0) {
      return (
        <div
          ref={setWrapper}
          data-as="concept-graph"
          className={cn('flex w-full items-center justify-center', className)}
        >
          <p className="text-sm text-[var(--as-muted-fg)]">{labels.empty}</p>
        </div>
      )
    }

    const SearchIcon = resolvedIcons.search
    const DownloadIcon = resolvedIcons.download
    const ForceIcon = resolvedIcons.forceLayout
    const HierarchyIcon = resolvedIcons.hierarchyLayout

    return (
      <div ref={setWrapper} data-as="concept-graph" className={cn('w-full', className)}>
        <GraphNodeContext.Provider value={ctxValue}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={(inst) => {
              rfInstance.current = inst
            }}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 1.4 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            minZoom={0.15}
            maxZoom={2.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="var(--as-border)" />
            <Controls showInteractive={false} />
            {showMiniMap && (
              <MiniMap
                nodeColor={(node) => {
                  const bg = node.style?.background as string
                  return typeof bg === 'string' ? bg : FALLBACK_EDGE_COLOR
                }}
                pannable
                zoomable
              />
            )}
            <Panel position="top-right">
              <div className="flex items-center gap-1.5">
                {/* Layout mode toggle: force vs hierarchy */}
                <div className="flex overflow-hidden rounded-[var(--as-radius-md)] border border-[var(--as-border)] bg-[var(--as-surface)] shadow-xs">
                  <button
                    onClick={() => setLayoutMode('force')}
                    title={labels.forceLayoutTitle}
                    aria-label={labels.forceLayoutTitle}
                    aria-pressed={layoutMode === 'force'}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors',
                      layoutMode === 'force'
                        ? 'bg-[var(--as-accent)]'
                        : 'text-[var(--as-muted-fg)] hover:bg-[var(--as-muted)]',
                    )}
                    style={layoutMode === 'force' ? { color: 'var(--as-accent-fg, #fff)' } : undefined}
                  >
                    <ForceIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('hierarchy')}
                    title={labels.hierarchyLayoutTitle}
                    aria-label={labels.hierarchyLayoutTitle}
                    aria-pressed={layoutMode === 'hierarchy'}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors',
                      layoutMode === 'hierarchy'
                        ? 'bg-[var(--as-accent)]'
                        : 'text-[var(--as-muted-fg)] hover:bg-[var(--as-muted)]',
                    )}
                    style={layoutMode === 'hierarchy' ? { color: 'var(--as-accent-fg, #fff)' } : undefined}
                  >
                    <HierarchyIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* PNG export */}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-[var(--as-radius-md)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-1.5 text-xs font-medium text-[var(--as-fg)] shadow-xs transition-colors hover:bg-[var(--as-muted)]"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  {labels.png}
                </button>
              </div>
            </Panel>
            {/* Search-to-find (top-left) */}
            <Panel position="top-left">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 rounded-[var(--as-radius-md)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1 shadow-xs">
                  <SearchIcon className="h-3.5 w-3.5 text-[var(--as-muted-fg)]" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSearchSubmit()
                      if (e.key === 'Escape') setSearchTerm('')
                    }}
                    placeholder={labels.findPlaceholder}
                    aria-label={labels.findPlaceholder}
                    className="w-24 bg-transparent text-xs text-[var(--as-fg)] outline-hidden placeholder:text-[var(--as-muted-fg)]"
                  />
                  {lowerSearch && (
                    <span className="text-[10px] text-[var(--as-muted-fg)]">
                      {rfNodes.filter((n) => {
                        const name = (n.data as GraphItemNodeData)?.name
                        return typeof name === 'string' && name.toLowerCase().includes(lowerSearch)
                      }).length}
                    </span>
                  )}
                </div>
                {/* Hover quick-preview */}
                {hoveredNodeId &&
                  (() => {
                    const hn = rfNodes.find((n) => n.id === hoveredNodeId)
                    const hd = (hn?.data as GraphItemNodeData) ?? {}
                    return (
                      <div className="max-w-[200px] truncate rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1 text-[10px] text-[var(--as-muted-fg)] shadow-xs">
                        <span className="font-medium">{hd.name}</span>
                        {hd.type && <span className="opacity-60"> · {hd.type}</span>}
                        <span className="opacity-60">
                          {' '}
                          · {hd.degree ?? 0} {labels.relationsSuffix}
                        </span>
                      </div>
                    )
                  })()}
              </div>
            </Panel>
            {/* Collapsible legend (bottom-left) */}
            <Panel position="bottom-left">
              <GraphLegend
                kindColors={kindColors}
                relationColors={relationColors}
                labels={labels}
                icons={resolvedIcons}
              />
            </Panel>
          </ReactFlow>
        </GraphNodeContext.Provider>
        {contextMenu && renderContextMenu && (
          renderContextMenu({
            x: contextMenu.x,
            y: contextMenu.y,
            node: {
              id: contextMenu.id,
              name: contextMenu.data.name ?? '',
              type: contextMenu.data.type,
              primary_kind: contextMenu.data.primary_kind,
              color: contextMenu.data.color,
              icon: contextMenu.data.icon,
            },
            onClose: closeContextMenu,
            onFocus: () => focusNode(contextMenu.id),
          })
        )}
      </div>
    )
  },
)

ConceptGraphView.displayName = 'ConceptGraphView'
