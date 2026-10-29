# ConceptGraphView

The generic node-graph visualizer promoted from health-assistant's
catalog ontology graph: one presentational React Flow canvas over
`nodes`/`edges` data, with two synchronous layouts — **force**
(d3-force, organic) and **hierarchy** (dagre TB, relation-aware:
container-style edges put the group above the member). Search-to-dim
with Enter-to-center, hover quick-preview, collapsible color legend,
MiniMap, PNG export, and consumer-rendered detail cards / context menus
via render props — no domain knowledge inside.

Second consumer: career-assistant's taxonomy graph (skills + approved
relations). Data in, events out; nothing is fetched here.

## import

```ts
import { ConceptGraphView } from '@neuronection/assistant-ui/concept-graph'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `nodes` | `ConceptGraphNode[]` | `{ id, name, primary_kind?, kinds?, color?, type?, icon? }`. The kind drives the fill color + label badge. |
| `edges` | `ConceptGraphEdgeData[]` | `{ id, source, target, relation }` — relation drives the stroke color + edge label. |
| `selectedNodeId` | `string` | Highlights + centers the node (deselecting never moves the viewport). |
| `hiddenKinds` / `disabledNodeIds` / `pickedNodeIds` | | Kind-level dimming; non-selectable ids (picker context); already-picked accent. |
| `onSelectNode` / `onFocusNode` / `onClearSelection` | | Click (drag-safe), double-click/enter, canvas-click callbacks. |
| `renderNodeDetail` | `RenderNodeDetail` | Floating detail card renderer (NodeToolbar). Omit → selection only. |
| `renderContextMenu` | `RenderContextMenu` | Right-click menu renderer (portalled by the consumer). Omit → none. |
| `showMiniMap` | `boolean` | Default `true`; disable in short containers. |
| `kindColors` / `relationColors` | `Record<string, string>` | Data-visualization palettes; also feed the legend. Default empty → neutral fallbacks. |
| `hierarchyReversedRelations` | `readonly string[]` | Relations whose target ranks ABOVE the source in the hierarchy layout. Defaults to health's vocabulary (`MEMBER_OF`, `PART_OF`, …); pass your own (career: `['is_a', 'part_of']`). |
| `animatedRelations` | `readonly string[]` | Relations rendered animated. Default none. |
| `selectedColor` / `pickedColor` | `string` | Selection / picked border accents (`#1d4ed8` / `#16a34a`). |
| `labels` / `icons` | `Partial<…>` | See the label/i18n contract. |
| `className` | `string` | Default `h-full` — the parent MUST define a height (React Flow needs dimensions). |

The consumer must mount the graph inside a height-defined container
(`h-full` parent or an explicit `h-[420px]`-style class on `className`).

## label / i18n contract

Every user-visible string defaults to English and is overridable through
`labels` (apps translate at call sites — the library ships no i18n
engine):

```ts
labels={{
  legend: 'Legend',          // legend toggle
  nodesHeader: 'Nodes',      // legend column headers
  edgesHeader: 'Edges',
  findPlaceholder: 'Find…',  // search input (also its aria-label)
  png: 'PNG',                // export button
  empty: 'No concepts to visualize.',
  forceLayoutTitle: 'Force-directed layout',        // toggle tooltip + aria-label
  hierarchyLayoutTitle: 'Hierarchy layout (by relation direction)',
  relationsSuffix: 'rel.',   // hover-preview count suffix
}}
```

Toolbar icons are overridable through `icons` (`search`, `download`,
`chevronDown`, `chevronRight`, `forceLayout`, `hierarchyLayout`;
lucide defaults).

## example (realistic)

```tsx
<ConceptGraphView
  className="h-[480px]"
  nodes={skills.map((s) => ({ id: s.id, name: s.label, primary_kind: s.status }))}
  edges={approvedRelations.map((r) => ({
    id: r.id, source: r.from_skill.id, target: r.to_skill.id, relation: r.relation,
  }))}
  kindColors={{ active: '#059669', proposed: '#0284c7', deprecated: '#d97706' }}
  relationColors={{ is_a: '#2563eb', synonym: '#059669', part_of: '#7c3aed', related_to: '#64748b' }}
  hierarchyReversedRelations={['is_a', 'part_of']}
  labels={graphLabels}
/>
```

## styling

Chrome colors come from `--as-*` tokens (surface, border, muted, accent);
node fills and edge strokes are **data colors** the app passes
(`kindColors` / `relationColors` / `color`). React Flow's stylesheet is
bundled into `dist/styles.css` (imported next to katex) and its controls
/ minimap / hover chrome are restyled under `[data-as='concept-graph']`.

## accessibility

The search input is a labelled textbox (Enter centers the first match,
Escape clears); layout toggles are `aria-pressed` buttons with
accessible names from `labels`; the legend is a named disclosure button.
The canvas itself is pointer-first (pan/zoom/drag) — provide keyboard
alternatives app-side (e.g. the search box) when the graph is the
primary navigation surface. See `docs/accessibility.md`.
