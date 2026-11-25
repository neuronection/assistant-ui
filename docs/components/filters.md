# FilterBar / FacetChip

Faceted filtering as a view model: the host resolves the options and keeps the
state, the library renders the bar, the chips, the popover options and the
active-value pills. No data access, no global state, no i18n engine.

## import

```ts
import { FilterBar, FacetChip } from '@neuronection/assistant-ui/filters'
import type { FilterFacet, FilterOption, FilterValue } from '@neuronection/assistant-ui/filters'
```

## types

```ts
type FilterFacetKind = 'toggle' | 'single' | 'multi'

interface FilterOption {
  value: string
  label: string
  icon?: ReactNode      // any node — the host picks its icon set
  count?: number        // rendered as a small badge
}

interface FilterFacet {
  id: string
  label: string
  kind: FilterFacetKind
  icon?: ReactNode
  options?: FilterOption[]   // omit for `toggle`
  hidden?: boolean           // folded behind the bar's More/Fewer
}

type FilterValue =
  | { kind: 'toggle'; on: boolean }
  | { kind: 'single'; value: string }      // '' = unset
  | { kind: 'multi'; values: string[] }
```

## FilterBar props

Extends `React.ComponentPropsWithoutRef<'div'>` (`onChange`/`defaultValue`
omitted).

| prop | type | default | notes |
|---|---|---|---|
| `facets` | `FilterFacet[]` | — | visible facets first, `hidden` ones behind More/Fewer |
| `values` | `Record<string, FilterValue \| undefined>` | — | missing entry = the facet's default |
| `onChange` | `(facetId, value) => void` | — | whole next value per facet |
| `onClearAll` | `() => void` | — | renders the clear action while `activeCount > 0` |
| `activeCount` | `number` | — | number of facets away from their default |
| `summary` | `ReactNode` | — | host-formatted, end-aligned (e.g. “12 of 300”) |
| `searchThreshold` | `number` | `8` | options above this get a search box |
| `labels` | `FilterBarLabels` | English defaults | `more`, `fewer`, `clearAll` + every `FacetChipLabels` key |

## FacetChip props

| prop | type | default | notes |
|---|---|---|---|
| `facet` | `FilterFacet` | — | one facet |
| `value` | `FilterValue` | — | current value |
| `onValueChange` | `(value: FilterValue) => void` | — | the chip computes the next value (add/remove/toggle/clear) |
| `options` | `FilterOption[]` | `facet.options` | lets the host supply filtered/derived options |
| `showActivePills` | `boolean` | `true` | removable row of the current selection |
| `searchThreshold` | `number` | `8` | option count that turns on the popover search |
| `labels` | `FacetChipLabels` | English defaults | `noOptions`, `noMatches`, `searchPlaceholder`, `searchAriaLabel`, `selectedCount(count)`, `removeNamed(label)` |

## controlled contract

`values` in, `onChange` out. The host owns the facet set, option resolution
(client or server), counts, and the active-facet count. `FacetChip` computes
the *next* value itself — the host never has to know whether a facet is
single- or multi-select. `defaultFor(facet)` (used by the bar when a facet has
no entry) is the neutral value: `toggle → false`, `single → ''`,
`multi → []`.

## labels & i18n

Every user-visible string is a prop with an English default; apps translate at
the call site (health: `labels={{ noOptions: t('common.no_options'), … }}`).
`selectedCount` and `removeNamed` are functions so plural rules and per-item
accessible names stay app-side.

## examples

minimal:

```tsx
const facets: FilterFacet[] = [
  { id: 'status', label: 'Status', kind: 'single', options: [{ value: 'active', label: 'Active' }] },
  { id: 'telemetry', label: 'Telemetry only', kind: 'toggle' },
]

<FilterBar
  facets={facets}
  values={{ telemetry: { kind: 'toggle', on: true } }}
  onChange={(id, value) => set(next => ({ ...next, [id]: value }))}
  onClearAll={() => set({})}
  activeCount={1}
/>
```

realistic (host-resolved counts + a folded facet + a summary):

```tsx
<FilterBar
  facets={facets}
  values={values}
  onChange={(id, value) => applyFacet(id, value)}
  onClearAll={clearFacets}
  activeCount={active.length}
  summary={t('filters.result_count', { shown, total })}
  searchThreshold={6}
  labels={{
    noOptions: t('common.no_options'),
    noMatches: t('filters.no_matches'),
    searchPlaceholder: t('filters.search_placeholder'),
    searchAriaLabel: t('filters.search_options'),
    selectedCount: (count) => t('filters.selected_count', { count }),
    removeNamed: (name) => t('common.remove_named', { name }),
    clearAll: t('filters.clear_all'),
    more: t('filters.more'),
    fewer: t('filters.fewer'),
  }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): the trigger is a
`<button aria-expanded>`; the popover is a labelled `role="group"` of native
`<button aria-pressed>` options (no roving-menu contract); active pills expose
their remove button with an app-provided accessible name.

## related

`chip-list` (the pill look the active filters share) · `search-input` (the
popover search) · `popover` (the shell) · `segmented-tabs` / `view-toggle`
(choosing *which* filters apply) · `selection-bar` (bulk actions on the
result).
