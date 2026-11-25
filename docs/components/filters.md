# FilterBar / FacetChip

Faceted filtering as a view model: the host resolves the options and keeps the
state, the library renders the bar, the chips, the popover options and the
active-value pills. No data access, no global state, no i18n engine.

## import

```ts
import {
  FilterBar,
  FacetChip,
  FilterPills,
  defaultFilterValue,
  isDefaultValue,
} from '@neuronection/assistant-ui/filters'
import type {
  FilterFacet,
  FilterOption,
  FilterOptionAction,
  FilterPillItem,
  FilterValue,
} from '@neuronection/assistant-ui/filters'
```

## types

```ts
type FilterFacetKind = 'toggle' | 'single' | 'multi'

interface FilterOption {
  value: string | null    // null = the “not recorded” bucket
  label: string
  icon?: ReactNode        // any node — the host picks its icon set
  count?: number          // rendered as a small badge
  countAtLeast?: boolean  // render the count as ≥N (the bucket is truncated)
  hint?: string           // secondary hint beside the label
}

interface FilterFacet {
  id: string
  label: string
  kind: FilterFacetKind
  icon?: ReactNode
  allowExclude?: boolean     // include/exclude/clear rows; default true for multi
  options?: FilterOption[]   // omit for `toggle`
  hidden?: boolean           // folded behind the bar's More/Fewer
}

type FilterValue =
  | { kind: 'toggle'; on: boolean }
  | { kind: 'single'; value: string | null }   // '' = unset; null = not recorded
  | { kind: 'multi'; include: (string | null)[]; exclude: (string | null)[] }

type FilterOptionAction = 'include' | 'exclude' | 'clear'
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
| `showActivePills` | `boolean` | `true` | passed to every chip |
| `formatCount` | `(count) => ReactNode` | runtime locale | passed to every chip |
| `showHidden` / `onShowHiddenChange` | `boolean` / `(next) => void` | uncontrolled | control the More/Fewer disclosure — e.g. auto-reveal a facet restored with an active value |
| `labels` | `FilterBarLabels` | English defaults | `more`, `fewer`, `clearAll` + every `FacetChipLabels` key |

## FacetChip props

Extends `React.ComponentPropsWithoutRef<'div'>` (`onChange`/`defaultValue`
omitted).

| prop | type | default | notes |
|---|---|---|---|
| `facet` | `FilterFacet` | — | one facet |
| `value` | `FilterValue` | — | current value |
| `onValueChange` | `(value: FilterValue) => void` | — | replacement value; the chip computes it (add/remove/toggle/clear) |
| `onToggleOption` | `(optionValue: string \| null, action: FilterOptionAction) => void` | — | **preferred** intent seam, burst-safe; reports include/exclude/clear; facet id for `toggle` facets |
| `options` | `FilterOption[]` | `facet.options` | lets the host supply filtered/derived options |
| `showActivePills` | `boolean` | `true` | removable row of the current selection |
| `searchThreshold` | `number` | `8` | option count that turns on the popover search |
| `formatCount` | `(count: number) => ReactNode` | runtime locale | count badge text, for an app-locale formatter |
| `variant` | `'popover' \| 'inline'` | `'popover'` | `inline` renders the options as an always-visible pill row (compact filter strips, no popover) |
| `testId` | `string` | — | `data-testid` of the root |
| `optionTestId` | `(value) => string` | — | `data-testid` of one option (inline pill or popover row) |
| `labels` | `FacetChipLabels` | English defaults | `noOptions`, `noMatches`, `searchPlaceholder`, `searchAriaLabel`, `selectedCount(count)`, `remove(label)`, `optionWithCount(label, count)`, `excluded`, `noneMatch`, `notRecorded`, `include`, `exclude`, `clear`, `optionMenu(label)` |

Active-value pills render for `multi` facets only, in both the `popover` and
`inline` variants; a `single` facet already shows its value on the trigger.
Pills are derived from `include`, `exclude` and the options, so a selected
value absent from an empty option list still renders a removable pill with no
fabricated count.

## FilterPills props

Extends `React.ComponentPropsWithoutRef<'div'>` (`onRemove` omitted). Renders
`null` when `items` is empty.

| prop | type | default | notes |
|---|---|---|---|
| `items` | `FilterPillItem[]` (`{ key, label }`) | — | applied filters, host-labelled |
| `onRemove` | `(key) => void` | — | removal reports the key |
| `removeLabel` | `(label) => string` | `Remove <label>` | per-pill accessible name |
| `testId` | `string` | — | `data-testid` of the row |
| `itemTestId` | `(key) => string` | — | `data-testid` of one pill |

## controlled contract

`values` in, `onChange` out. The host owns the facet set, the option list
(resolved however it likes — the popover *search* itself is client-side over the
options you pass, so a server-driven list must be resolved before render), the
counts, and the active-facet count.

`FacetChip` computes the next value from the current one. For hosts whose state
lives in a store or reducer, pass **`onToggleOption(optionValue, action)`**
instead: it reports the tri-state intent (`include`, `exclude` or `clear`), so
two activations made before the next render both survive (the replacement form
would compute both from the same stale value). `optionValue` is the option's
value (`null` for the not-recorded bucket), or the facet id for a `toggle`
facet.

The two seams are **exclusive** (`FacetChipProps` is a union): pass either
`onToggleOption` or `onValueChange`, never both.

Exported helpers mirror the neutral value: `defaultFilterValue(facet)`
(`toggle → false`, `single → ''`, `multi → { include: [], exclude: [] }`) and
`isDefaultValue(value)` — use them for `activeCount` rather than duplicating the
rule. `filterValueKey(value)` is the stable key for a `string | null` option
value, so `null` and the string `'null'` never collide.

## labels & i18n

Every user-visible string is a prop with an English default; apps translate at
the call site (health: `labels={{ noOptions: t('common.no_options'), … }}`).
`selectedCount`, `remove` and `optionMenu` are functions so plural rules and
per-item accessible names stay app-side.

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
    remove: (name) => t('common.remove_named', { name }),
    clearAll: t('filters.clear_all'),
    more: t('filters.more'),
    fewer: t('filters.fewer'),
  }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): the trigger is a
`<button aria-expanded>`; the popover is a named `role="dialog"` (labelled with
the facet name) holding a labelled `role="group"` (`role="radiogroup"` for a
`single` facet) of `role="checkbox"` rows (`role="radio"` for `single`) with
`aria-checked` — no roving-menu contract. The excluded state keeps
`aria-checked="true"` and suffixes the accessible name with `(excluded)`; a
zero count stays in the name (`0, none match now`) and stays selectable. The
keyboard surface is tri-state: Enter includes, Shift+Enter excludes, Delete
clears, Shift+F10 opens the row menu, and Tab + Enter/Space also work. The
`inline` variant renders the same rows (plus the count badges) without the
popover. Keyboard (Enter to open, Tab to the first option, Escape to close and
return focus) and axe-closed / **axe-open** / **axe-inline** are asserted in
`tests/filters.test.tsx`. Active pills expose their remove button with an
app-provided accessible name; removing one moves focus to the next pill, or to
the facet trigger (popover) / first option (inline) after the last.

## related

`chip-list` (the pill look the active filters share) · `search-input` (the
popover search) · `popover` (the shell) · `segmented-tabs` / `view-toggle`
(choosing *which* filters apply) · `selection-bar` (bulk actions on the
result).
