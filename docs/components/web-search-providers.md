# WebSearchProvidersPanel

The family's web-search settings surface (ADR-0035 / plan 28): an ordered
multi-provider list — enable, reorder, test with probe status, edit,
delete — plus a catalog-driven add/edit form. The panel is presentational
and controlled: providers and the provider catalog come in as data, every
mutation goes out as an event. Persistence, key sealing and the actual
probe calls are app-side; the first *enabled* provider that answers wins
is the family's fallback semantics, surfaced by row order.

## import

```ts
import { WebSearchProvidersPanel } from '@neuronection/assistant-ui/web-search-providers'
```

## data contracts

- `WebSearchProviderView` — one configured provider row: `id, name, type,
  enabled, baseUrl, googleCx, keyHint, keySet` (mirrors the family
  `providers[]` preference shape).
- `WebSearchProviderCatalog` — `{ order, entries }` from the vendored
  `search-providers.json`: per type, `label`, `requiresKey`, `baseUrl` +
  `baseUrlRequired`/`baseUrlHint`, optional extra `fields` (e.g. google-pse's
  engine id) and `notes`. The add/edit form renders entirely from this.
- `WebSearchProviderProbeView` — `{ status, latencyMs, error }` with
  `status ∈ ok | unreachable | auth | rate_limit | json_disabled | error`.

## props

| prop | type | notes |
|---|---|---|
| `providers` | `WebSearchProviderView[]` | ordered list; order = fallback priority |
| `catalog` | `WebSearchProviderCatalog` | provider catalog (vendored contract) |
| `probes` | `Record<id, WebSearchProviderProbeView>` | latest probe per provider; renders the inline connection-test row |
| `testingId` | `string \| null` | provider mid-test (spinner state) |
| `busy` | `boolean` | disables all row actions |
| `labels` | `WebSearchProvidersPanelLabels` | English defaults; apps translate (title, hint, buttons, probe labels, aria labels) |
| `onSave` | `(input: WebSearchProviderSaveInput) => void` | create (`id` absent) or update; `apiKey: null` keeps the stored key |
| `onDelete` | `(id: string) => void` | app owns confirmation |
| `onMove` | `(id, 'up' \| 'down') => void` | boundary moves are disabled |
| `onToggle` | `(id, enabled) => void` | row enable switch |
| `onTest` | `(id: string) => void` | triggers the app-side probe |
| `className` | `string` | merged onto the root |

## a11y

See the [accessibility matrix](../accessibility.md): the enabled switch,
move/edit/delete buttons and the probe row are all reachable and
labelled; the form gates save on the catalog's required fields.
