import type React from 'react'

/** Optional lucide icon config a node may carry (resolved by the consumer). */
export interface ConceptGraphIcon {
  type: 'lucide' | 'custom_svg'
  value: string
}

export interface ConceptGraphNode {
  id: string
  name: string
  /** Used for the node color + label badge. String (not an enum) so the
   *  graph can render any domain's kind vocabulary. */
  primary_kind?: string | null
  /** All kind tags — a node stays visible if ANY of its kinds is not hidden. */
  kinds?: string[]
  color?: string | null
  /** The consumer's entity type for this node (drives app-side navigation
   *  from a detail-card or context-menu renderer). */
  type?: string | null
  icon?: ConceptGraphIcon | null
}

export interface ConceptGraphEdgeData {
  id: string
  source: string
  target: string
  relation: string
}

/** The identity fields a detail-card renderer needs. Mirrors the relevant
 *  subset of ConceptGraphNode. */
export interface GraphNodeSummary {
  id: string
  name: string
  type?: string | null
  primary_kind?: string | null
  color?: string | null
  icon?: ConceptGraphIcon | null
}

/** Renderer for the floating detail card shown when a node is selected.
 *  Provided by the consumer so this generic renderer stays free of domain
 *  imports. Omit → no card (selection only highlights the node). */
export type RenderNodeDetail = (args: {
  node: GraphNodeSummary
  degree: number
  onClose: () => void
  onFocus: () => void
}) => React.ReactNode

/** Renderer for the right-click context menu. Receives the cursor position
 *  + node identity; the consumer renders a portalled menu. Omit → no menu. */
export type RenderContextMenu = (args: {
  x: number
  y: number
  node: GraphNodeSummary
  onClose: () => void
  onFocus: () => void
}) => React.ReactNode

export interface ConceptGraphLabels {
  /** Collapsible legend toggle. */
  legend: string
  /** Legend column header for node kinds. */
  nodesHeader: string
  /** Legend column header for edge relations. */
  edgesHeader: string
  /** Search input placeholder. */
  findPlaceholder: string
  /** PNG export button. */
  png: string
  /** Empty-graph message. */
  empty: string
  /** Layout toggle tooltip, force-directed mode. */
  forceLayoutTitle: string
  /** Layout toggle tooltip, hierarchy mode. */
  hierarchyLayoutTitle: string
  /** Hover-preview suffix after the relation count (e.g. "rel."). */
  relationsSuffix: string
}

export interface ConceptGraphIcons {
  search: React.ComponentType<{ className?: string }>
  download: React.ComponentType<{ className?: string }>
  chevronDown: React.ComponentType<{ className?: string }>
  chevronRight: React.ComponentType<{ className?: string }>
  forceLayout: React.ComponentType<{ className?: string }>
  hierarchyLayout: React.ComponentType<{ className?: string }>
}
