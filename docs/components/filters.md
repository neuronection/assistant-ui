# FilterBar / FacetChip / FilterSection / FilterRail

Faceted filtering as a view model. The host resolves the options and keeps the
state; the library renders the bar, the chips, the popover options, the
active-value pills, the collapsible rail sections and the rail/compact shell.
No data access, no global state, no i18n engine.

The four exports divide the work:

- `FilterBar` — the horizontal strip of facet chips, More/Fewer, clear-all and
  the host summary.
- `FacetChip` — one facet: a popover trigger, or (`variant="inline"`) an
  always-visible option row.
- `FilterSection` — one collapsible section of the vertical rail.
- `FilterRail` — the shell: a labelled `<aside>` (`layout="rail"`) or a compact
  toolbar plus filter sheet (`layout="compact"`).

## import

```ts
import {
  FilterBar,
  FacetChip,
  FilterPills,
  FilterRail,
  FilterSection,
  defaultFilterValue,
  isDefaultValue,
} from '@neuronection/assistant-ui/filters'
import type {
  FilterFacet,
  FilterOption,
  FilterOptionAction,
  FilterPillItem,
  FilterRailLabels,
  FilterRailLayout,
  FilterRailProps,
  FilterSectionLabels,
  FilterSectionProps,
  FilterValue,
} from '@neuronection/assistant-ui/filters'
```

## types

```ts
type FilterFacetKind = 'toggle' | 'single' | 'multi'
type FilterRailLayout = 'rail' | 'compact'

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
  countsState?: 'ready' | 'loading' | 'error'  // not `ready` = render no option count
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
| `activeCount` | `number` | — | number of facets away from their default (`isDefaultValue`), not the number of selected values |
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

The `inline` variant mirrors the popover's roles rather than inventing a
second contract: a labelled `role="group"` (`role="radiogroup"` for a `single`
facet) wraps `role="checkbox"` rows (`role="radio"` for `single`), each with
`aria-checked`.

## FilterSection props

Extends `React.ComponentPropsWithoutRef<'section'>` (`title` omitted). The
header is a real `<button>`; the section is labelled by its title and the
button's `aria-controls` points at the content element.

| prop | type | default | notes |
|---|---|---|---|
| `title` | `ReactNode` | — | the section heading and its accessible name |
| `active` | `boolean` | `false` | the facet is away from its default: the dot is `aria-hidden` and `labels.active` is announced in the header; never forces the section open |
| `count` | `number` | — | facet count; `0` renders, `undefined` renders no badge at all |
| `countAtLeast` | `boolean` | `false` | render the count as `≥N`; **ignored when `count` is `0`** — never `≥0` |
| `defaultOpen` | `boolean` | `false` | initial state of an uncontrolled section |
| `open` / `onOpenChange` | `boolean` / `(next) => void` | uncontrolled | controlled state; `aria-expanded` always follows the rendered state |
| `formatCount` | `(count: number, truncated?: boolean) => ReactNode` | runtime locale | `truncated` is `true` only for a non-zero `countAtLeast` count |
| `labels` | `FilterSectionLabels` | English defaults | `expand`, `collapse` (native header title), `noneMatch` (after a zero count), `active` (default *filtered*) |
| `className`, `...section props` | | | `aria-labelledby` is set by the component and wins over a host value |

## FilterRail props

| prop | type | default | notes |
|---|---|---|---|
| `layout` | `'rail' \| 'compact'` | **required** | `rail` is the vertical `<aside>`; `compact` is the toolbar + filter sheet |
| `title` | `ReactNode` | — | rail heading / sheet title |
| `labels` | `FilterRailLabels` | English defaults | `filters` (trigger noun and count name), `close`, `done`, `clearAll` |
| `activeCount` | `number` | — | facets away from their default; `undefined` omits the badge, `0` renders `0` (and hides clear-all) |
| `formatCount` | `(count: number) => ReactNode` | runtime locale | formats the rail's active-count badge; the compact trigger keeps the plain number |
| `onClear` | `() => void` | — | rail Clear all; also the compact sheet's default-footer clear action |
| `search` | `ReactNode` | — | host **page-level** search control, not facet-option search (see below) |
| `footer` | `ReactNode \| ((close: () => void) => ReactNode)` | — | replaces the compact sheet's default footer (the function form receives a `close` that closes the sheet); in the rail it renders below the body with a no-op `close` |
| `children` | `ReactNode` | — | the sections (or any host content) |
| `className` / `data-testid` | `string` | — | forwarded to the layout root |

## composition

The rail is a layout shell, not a second filter implementation. Compose it
from `FilterSection`s that each host `FacetChip variant="inline"`:

```tsx
<FilterRail layout="rail" title={t('filters.title')} activeCount={activeCount} onClear={clearAll}>
  <FilterSection title={t('filters.phase')} active={phaseActive} count={phaseCount} countAtLeast>
    <FacetChip
      facet={phaseFacet}
      value={values.phase ?? defaultFilterValue(phaseFacet)}
      onValueChange={(value) => setFacet('phase', value)}
      variant="inline"
    />
  </FilterSection>
</FilterRail>
```

There is **no `FacetList`** component. The inline row is the existing
`FacetChip`; do not build a parallel list — counts, the exclude menu, the null
bucket, focus rules and the aria roles all come from that one implementation.
The rail adds no sticky, width or scroll CSS; the app owns that.

## semantics worth getting right

- **`activeCount`** counts facets away from their default, using
  `isDefaultValue` — not selected values. One facet with two included values
  is `1`.
- **`countAtLeast`** marks a truncated bucket. It applies only to a non-zero
  count: a zero count always renders `0`, because “≥0” is always true and
  useless.
- **`formatCount`** is scoped per surface: `FacetChip` takes `(count)`, while
  `FilterSection` takes `(count, truncated?)` so a host can render `~N` for a
  truncated bucket. The rail badge takes `(count)`. Digits are isolated in
  `<bdi dir="ltr">` so `≥N` and grouped numbers do not reorder in RTL.
- **`search` is page-level.** In `compact` it renders in the toolbar *above*
  the modal; it is intentionally not duplicated inside the sheet, because an
  open modal makes the page inert and a facet search there would be unusable.
  The sheet is filter-only. The popover's own option search inside `FacetChip`
  is a different control. In `rail` the host search renders under the rail
  header.
- **`footer`.** In `compact`, a host `footer` replaces the default footer
  entirely (the default is Clear all — while active — plus a *Done* button
  that closes the sheet). In `rail`, `footer` renders after the body. Both
  forms are allowed: a node, or a function `(close) => node` so a host can
  render its own way out of the sheet — the classic *Show 128 results* button.
  `close` closes the compact sheet and is a no-op in the rail.
- **`countsState`.** `ready` (default) renders counts as before. `loading` and
  `error` withhold every option count — no number, no `0`, and no count in the
  option's accessible name — because a stale number is worse than none; a
  zero-count option then reads as a plain value with no *none match now*.
  `loading` also marks the chip `aria-busy`. The state is per facet, so one
  slow field never blanks the rest of the bar. `FacetChip` also accepts its
  own `options`, which is the usual place to drop counts for a single facet.
- **Include-only facets.** With `allowExclude={false}` a plain click (or
  Space) cycles include → clear instead of include → exclude; the row menu is
  not rendered and Shift+Enter does nothing. Any stale exclusion the host
  still holds stays removable from its pill.
- **Uncontrolled sections reset when the compact sheet closes.** `PanelModal`
  unmounts its content, so a `FilterSection` using `defaultOpen` returns to
  that initial state on the next open. Control `open` / `onOpenChange` (or
  lift the state) when the section state must survive the sheet.

## labels & i18n

Every user-visible string is a prop with an English default; apps translate at
the call site (health: `labels={{ noOptions: t('common.no_options'), … }}`).
`selectedCount`, `remove` and `optionMenu` are functions so plural rules and
per-item accessible names stay app-side. `FilterSection` adds `expand`,
`collapse`, `noneMatch` and `active`; `FilterRail` adds `filters`, `close`,
`done` and `clearAll`.

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

compact (page search in the toolbar, filter sheet behind the trigger):

```tsx
<FilterRail
  layout="compact"
  title={t('filters.title')}
  activeCount={activeCount}
  onClear={clearAll}
  search={<SearchInput ariaLabel={t('filters.search_page')} value={query} onChange={setQuery} />}
  labels={{ filters: t('filters.filters'), done: t('common.done'), clearAll: t('filters.clear_all') }}
>
  {sections}
</FilterRail>
```

compact with a host footer that applies and closes (the `close` callback is
what the default *Done* button uses):

```tsx
<FilterRail
  layout="compact"
  title={t('filters.title')}
  activeCount={activeCount}
  footer={(close) => (
    <Button type="button" onClick={close} className="min-h-[44px]">
      {t('filters.show_results', { count: resultCount })}
    </Button>
  )}
>
  {sections}
</FilterRail>
```

loading facet (counts withheld until the facet query answers):

```tsx
<FilterSection title={t('filters.phase')} active={phaseActive}>
  <FacetChip
    facet={{ ...phaseFacet, countsState: countsPending ? 'loading' : 'ready' }}
    value={values.phase ?? defaultFilterValue(phaseFacet)}
    onValueChange={(value) => setFacet('phase', value)}
    variant="inline"
  />
</FilterSection>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs).

- **Rail:** `layout="rail"` is a `<aside>` landmark (complementary), named by
  its `title`; the active count badge carries a visually hidden
  “Filters:” prefix and a `<bdi dir="ltr">` number, is wrapped in
  `aria-live="polite"` so a change is announced, and is omitted entirely
  when `activeCount` is `undefined`.
- **Sections:** the header is a real `<button>` with `aria-expanded` and
  `aria-controls` pointing at the existing content element (which is
  `hidden` while closed); the active dot is decorative, while the word
  *filtered* (`labels.active`) is announced in the header's accessible name.
  Counts render `0` / `≥N` / no badge at all; a zero count adds
  `none match now` (`labels.noneMatch`) to the accessible name and stays
  selectable. On a facet whose `countsState` is not `ready`, the section count
  is the host's to withhold too — pass `count` only when it is trustworthy.
- **Compact sheet:** the trigger is a `<button>` with
  `aria-haspopup="dialog"` and `aria-expanded`; its label (including the
  count) sits in a polite live region so a filter change is announced while
  the sheet is closed. `PanelModal` supplies the labelled dialog, the focus
  trap and Escape handling, and focus returns to the trigger on close. The
  close button is named by `labels.close`. The default *Done* footer closes
  the sheet; a host `footer` replaces it, and the function form receives the
  same `close` — so a *Show N results* button is a plain `<button>` inside
  the host footer.
- **Option counts:** counts are `aria-hidden` badges; the row's accessible
  name carries the count (and *none match now* at zero) instead. When
  `countsState` is `loading` the chip is `aria-busy="true"` and no count is
  rendered or named; `error` renders no count either, without `aria-busy`.
- **Target size:** the section header, the compact trigger, the rail clear
  action and the inline option row (with its per-row menu trigger) are 44px
  tall. The inline row's 44px treatment applies at `max-sm` (390px); popover
  rows are unchanged.
- **RTL:** count numerals are wrapped in `<bdi dir="ltr">` in both
  `FilterSection` and `FilterRail`, and the collapsed chevron flips with
  `rtl:rotate-180`.
- **Reduced motion:** the section chevron uses
  `motion-reduce:transition-none`. That guard is asserted by the class test
  in `tests/filters.test.tsx`; no screenshot is evidence for a media query.

The popover keeps the A1 contract: the trigger is a `<button aria-expanded>`;
the popover is a named `role="dialog"` holding a labelled `role="group"`
(`role="radiogroup"` for a `single` facet) of `role="checkbox"` rows
(`role="radio"` for `single`) with `aria-checked` — no roving-menu contract.
The excluded state keeps `aria-checked="true"` and suffixes the accessible
name with `(excluded)`; a zero count stays in the name (`0, none match now`)
and stays selectable. The keyboard surface is tri-state: Enter includes,
Shift+Enter excludes, Delete clears, Shift+F10 opens the row menu, and Tab +
Enter/Space also work. Keyboard (Enter to open, Tab to the first option,
Escape to close and return focus) and axe-closed / **axe-open** /
**axe-inline** / axe-rail / axe-compact (closed and open) are asserted in
`tests/filters.test.tsx`. Active pills expose their remove button with an
app-provided accessible name; removing one moves focus to the next pill, or to
the facet trigger (popover) / first option (inline) after the last.

### story evidence

The `FiltersRailWide` / `FiltersCompactWide` stories set a 1024px frame inside
the Ladle gallery, so the browser viewport caps what is visible locally — a
local screenshot there is not 1024-wide evidence. Each story records the
intended CI frame (1280×900) in `parameters.frame`; the visual suite can use
that in CI. The reduced-motion story is illustrative only (see above).
`FiltersFunctionFooter` opens the compact sheet on mount so the host
*Show N results* footer is in the capture; `FiltersCountsLoading` shows a
facet with `countsState="loading"`, i.e. the same options with no counts.

## related

`chip-list` (the pill look the active filters share) · `search-input` (the
popover search and the page search) · `popover` (the shell) · `segmented-tabs`
/ `view-toggle` (choosing *which* filters apply) · `selection-bar` (bulk
actions on the result).
