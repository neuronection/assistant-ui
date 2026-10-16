# surface-renderer

The family **declarative-surface renderer** (plan 32 Phase 4 / ADR-0040
clause 16): renders an extension surface — a report or page — from the
charter's closed component vocabulary. Data and labels in; typed actions
out. The host binds the actions and resolves the labels; extensions never
contribute markup (D17: raw HTML/JS from extensions is never rendered at
any tier).

Promoted from desktop-assistant's `PackReportRenderer`; career- and
desktop-assistant are the two hosts, pinned by the shared fixture wall
(`dev/contracts/surface-renderer.fixtures.json` — implementations may
differ, outputs may not).

## Import

```ts
import { SurfaceRenderer } from '@neuronection/assistant-ui/surface-renderer'
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `surface` | `SurfaceView` | — | the schema + view: `nodes`, `rows`, dot-path `values`, group labels |
| `labels` | `SurfaceLabels` | `{}` | resolved manifest i18n (see the contract below) |
| `filters` | `SurfaceFilter[]` | `[]` | filter-bar facet definitions (the schema node only ids them) |
| `activeFilters` | `Record<string, string>` | `{}` | controlled facet selections (`facetId → value \| 'all'`) |
| `onFilterChange` | `(facetId, value: string \| null) => void` | — | facet chip / select change; `null` resets a facet |
| `onAction` | `(action: { id, rowId? }) => void` | — | the typed-action funnel (closed `run:*` / `item:*` ids only) |
| `truncatedLabel` | `string` | — | host-resolved truncation notice; renders `role=status` when set |
| `allLabel` | `string` | `'All'` | the filter reset chip label |
| `evidenceLabel` | `string` | `'Evidence'` | the disclosure summary prefix |
| `loadMoreLabel` | `string` | `'Load more'` | pagination label (50 rows per page) |
| `className` | `string` | — | merges onto the root |

Only `surface` is required — everything else is data the host resolved.

## The schema

```ts
interface SurfaceNode {
  id: string
  type: 'stat' | 'table' | 'cards' | 'filter-bar' | 'select' | 'badge' | 'progress' | 'actions' | 'evidence'
  bind?: string          // stat/badge/progress/select
  columns?: string[]     // table
  of?: 'items' | 'groups' // cards
  filters?: string[]     // filter-bar facet ids
  options?: string[]     // select
  actions?: SurfaceActionId[] // actions node
}
```

Nodes render in the canonical type order (`stat → badge → progress →
filter-bar → select → actions → table → cards`); within one type the
schema order holds. Unknown node types never render (closed vocabulary
at the render seam — the manifest validator rejects them, the renderer
ignores them). Unknown action ids never render. `evidence` has no visual
node: rows carrying `evidence` (+ the optional host-resolved
`evidenceSummary`) render a disclosure — evidence is mandatory wherever a
recommendation renders (ADR-0029; the manifest validator enforces it).

## The label contract

```ts
'report.<node-id>'                      // node label
'report.<table-node-id>.<column>'       // table column header
'filters.<facet-id>'                    // filter-bar facet label (via the filters def)
'action.<action-id>'                    // action button label
'status.<value>'                        // badge/group/option text fallbacks
```

Labels arrive RESOLVED — locale resolution rides the host (manifest i18n);
unresolved keys fall back to the id/value itself. HTML is never estimated
out of label data (plain text nodes only).

## Bind resolution

`stat`, `badge` and `progress` bind a dot path into `surface.values`:
`totals.scanned` → `values["totals"]["scanned"]`. A progress value may be
a `number` (percent) or `{ done, total }`. Missing binds degrade to
`'—'` / an empty bar — never an exception.

## Controlled contract

- **Facets** (filter-bar/select) are fully controlled through
  `activeFilters`/`onFilterChange` — the host owns filtering semantics and
  passes the filtered `rows`.
- **Actions** flow out as typed `{ id, rowId? }` events; the host binds
  semantics (e.g. `item:open → reveal file` on desktop, `packed as
  JSON download` on career). Pagination ("Load more", 50/page) is
  internal presentation state.

## Accessibility

See [accessibility.md](../accessibility.md#surface-renderer): facet chips
are `aria-pressed` buttons (All chip reset), selects carry explicit
labels, tables use `scope="col"` headers, evidence disclosures are
`details/summary` (keyboard reachable), truncation notices are
`role=status`, progressbars carry the node label with 0–100 value axes.
Verified per-case in the fixture suite with jest-axe.

## Example

```tsx
import { SurfaceRenderer, type SurfaceView } from '@neuronection/assistant-ui/surface-renderer'

const view: SurfaceView = {
  nodes: [
    { id: 'scanned', type: 'stat', bind: 'totals.scanned' },
    { id: 'decided', type: 'progress', bind: 'decided' },
    { id: 'filters', type: 'filter-bar', filters: ['verdict'] },
    { id: 'items', type: 'table', columns: ['path', 'verdict'] },
    { id: 'evidence', type: 'evidence' },
    { id: 'actions', type: 'actions', actions: ['run:export'] },
  ],
  values: { totals: { scanned: 120 }, decided: { done: 90, total: 120 } },
  rows: [{ id: 'r1', values: { path: 'a.ts', verdict: 'keep' }, badge: 'keep', badgeField: 'verdict' }],
}

<SurfaceRenderer
  surface={view}
  labels={{ 'report.scanned': 'Files scanned', 'report.items.path': 'Path', 'action.run:export': 'Export' }}
  filters={[{ id: 'verdict', options: [{ value: 'keep', label: 'Keep' }, { value: 'ask', label: 'Needs a look' }] }]}
  activeFilters={{ verdict: 'all' }}
  onFilterChange={(facet, value) => applyFilter(facet, value)}
  onAction={({ id, rowId }) => dispatch(id, rowId)}
/>
```

## Related

- [`extension-sources`](./extension-sources.md) — the ADR-0040 import/consent surface this renderer's mini-apps install through
- [`badge`](./badge.md) / [`button`](./button.md) — the primitives the renderer composes
