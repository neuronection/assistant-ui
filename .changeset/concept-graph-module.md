---
'@neuronection/assistant-ui': minor
---

New `concept-graph` module — the generic node-graph visualizer promoted
from health-assistant's catalog ontology graph (second consumer:
career-assistant's taxonomy graph). `ConceptGraphView` renders
nodes/edges on a React Flow canvas with two synchronous layouts —
force (d3-force) and hierarchy (dagre, relation-aware via
`hierarchyReversedRelations`) — plus search-to-dim with Enter-to-center,
hover quick-preview, collapsible legend, MiniMap, PNG export, and
consumer-rendered detail cards / context menus through render props.
Domain vocabularies stay app-side: node/edge colors arrive as
`kindColors`/`relationColors`, every chrome string is overridable
through `labels`, toolbar icons through `icons`; chrome colors come from
`--as-*` tokens and React Flow's stylesheet ships inside `dist/styles.css`.
`DynamicIcon` (lucide-by-name or DOMPurify-sanitized custom SVG) and the
hierarchy direction helper ride along.
