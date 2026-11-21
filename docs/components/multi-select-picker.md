# MultiSelectPicker

Type-ahead + browse-modal picker for selecting one or many items from a
catalog — the "two discovery paths" pattern shared by career-assistant's
skill picker and health-assistant's catalog picker. **Data-agnostic**: it
never fetches; feed it a plain `options` list (client filtering) or an
`onSearch` callback (server search). Selections render as removable chips
below the input. `PickerBrowseModal` is the browse half, exported
separately for hosts that need it standalone.

## import

```ts
import {
  MultiSelectPicker,
  PickerBrowseModal,
  PickerBulkSelect,
  type PickerOption,
  type PickerSelection,
} from '@neuronection/assistant-ui/multi-select-picker'
```

## props — MultiSelectPicker

| prop | type | default | notes |
|---|---|---|---|
| `value` | `PickerSelection[]` | — | controlled selection (`{ value, label, category? }`); `single` mode holds 0 or 1 |
| `onChange` | `(next: PickerSelection[]) => void` | — | reports every add/remove; in `single` mode emits a one-element (or empty) array |
| `mode` | `'single' \| 'multi'` | `'multi'` | `single` replaces on pick |
| `options` | `PickerOption[]` | — | **client mode**: the full catalog; the picker filters locally |
| `onSearch` | `(query: string) => Promise<PickerOption[]>` | — | **server mode**: debounced type-ahead search (keep the callback referentially stable) |
| `onLoadMore` | `(query, category, offset) => Promise<PickerOption[]>` | — | browse-modal pagination in server mode; return `[]` when exhausted |
| `categories` | `string[]` | derived from `options` | browse-modal category filter (`<select>` hidden when empty) |
| `placeholder` | `string` | `'Search options…'` | input placeholder (also the accessible name unless `labels.inputLabel` is set) |
| `labels` | `PickerLabels` | — | every string is overridable (see below) |
| `disabled` | `boolean` | `false` | input, browse button and chip removes |
| `debounceMs` | `number` | `250` | debounce for `onSearch` calls (client filtering is synchronous) |
| `minQueryLength` | `number` | `1` | characters before the listbox opens |
| `maxResults` | `number` | `10` | type-ahead result cap (client mode) |
| `pageSize` | `number` | `50` | browse-modal page size (client mode) |
| `browseIcon` | `LucideIcon` | `LayoutGrid` | icon on the in-input browse button |
| `onBrowseOpenChange` | `(open: boolean) => void` | — | browse-modal open state reports |
| `renderChipExtra` | `(selection, index) => ReactNode` | — | extra **leading** content inside each chip (before the label) — e.g. a per-chip control like a relation select, or a type badge |
| `showChips` | `boolean` | `true` | `false` hides the chip list entirely (the host renders the selections itself, e.g. rich cards below the picker) |
| `browseModalProps` | `MultiSelectPickerBrowseProps` | — | forwarded to the internal [`PickerBrowseModal`](#props--pickerbrowsemodal) (its controlled `value`/`onChange`/`mode`/`open` stay wired to the picker; everything else — including the slots below — overrides the picker's own forwarding) |
| `id` | `string` | auto | on the input |
| `className` | `string` | — | root wrapper |

## props — PickerBrowseModal

Same controlled contract (`value` + `onChange` + `mode` + the data props
`options` / `onSearch` / `onLoadMore` / `categories` / `pageSize` /
`debounceMs` / `labels`), plus:

| prop | type | default | notes |
|---|---|---|---|
| `open` | `boolean` | — | controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Escape, overlay click, the × and *Done* all report `false`; `single` mode closes on pick |
| `title` | `string` | `labels.browseTitle` | dialog title |
| `category` | `string` | — | **controlled** category selection (`''` = *All*); without it the modal keeps the category internally (reset to `''` on open) |
| `onCategoryChange` | `(category: string) => void` | — | reports category changes (both controlled and uncontrolled) |
| `reloadKey` | `unknown` | — | when this value changes, the modal re-runs its current search — the trigger for host-side **server** filters (e.g. a scope switch) that affect results but aren't the query/category. Comparison is identity-based: pass a primitive or a referentially stable value |
| `selectAll` | `boolean` | `false` | **opt-in bulk select** (`multi` mode): one tri-state `role="checkbox"` control above the list that selects every option matching the active search/category/host filter, and deselects exactly those again. Off by default — turn it on only where "all" is a sensible action (a bounded curated catalog), never on an open-ended one (thousands of skills) |
| `hasMore` | `boolean` | optimistic | server mode: host-declared pagination state — when set, it (not the optimistic default) decides whether *Load more* shows, so an exhausted list never renders a dead button |
| `filterOption` | `(option: PickerOption) => boolean` | — | host predicate narrowing the **rendered** rows (e.g. client-side facet filters); pagination (*Load more*) stays driven by the raw pages |
| `renderRowContent` | `(option, selected, ctx) => ReactNode` | — | replaces the row's text block (label + category); `ctx` carries the live `{ search, category }` (e.g. for match highlighting). The built-in `Add/Added <label>` toggle and row chrome stay in place |
| `renderBody` | `(ctx: PickerBrowseBodyCtx) => ReactNode` | — | composes the modal body from the ctx nodes (see *slots* below); return a falsy value for the default body |
| `className` | `string` | — | on the `PanelModal` shell (tailwind-merged over the `size` defaults) |

The modal shell is [`PanelModal`](./modal.md) (Radix Dialog) — Escape and
click-outside close, focus is trapped and restored.

## props — PickerBulkSelect

The bulk control `selectAll` renders, exported so a host with its own
browsing body (a card gallery, a graph, a table) places the same semantics
instead of hand-rolling them:

| prop | type | default | notes |
|---|---|---|---|
| `count` | `number` | — | size of the host's matching scope; `0` renders nothing |
| `pickedCount` | `number` | — | how many of the scope are already picked — drives `aria-checked` (`mixed` when partial) |
| `label` | `string` | — | the check action's accessible name (host composes it, e.g. `Select all (12)`) |
| `clearLabel` | `string` | — | the uncheck action's name, used instead of `label` once everything matches |
| `onToggle` | `() => void` | — | one event; the host decides select-all vs clear depending on its own state |
| `disabled` | `boolean` | `false` | inert while a bulk action is in flight |
| `className` | `string` | — | on the button |

## controlled contract

- Value is fully controlled; all mutations report out via `onChange`.
  Internal state is limited to the query text, listbox open/active state and
  the modal's search/category/page state.
- **Client mode** (`options`): the type-ahead filters on `label`/`value`
  substrings (case-insensitive), excluding items already in `value`; the
  browse modal filters by search + category and paginates with *Load more*.
- **Server mode** (`onSearch`): the picker debounces the query and renders
  what the callback resolves (still excluding current selections). In the
  browse modal the callback also receives the selected category (`null` when
  *All*), and `onLoadMore(query, category, offset)` appends the next page —
  it hides the *Load more* button on an empty page.
- Results are always "what you can add": a selected item never appears in
  the type-ahead; in the browse modal its row flips to *Added*.

## slots (host chrome)

The interactive core (type-ahead, chips, `Add/Added` rows, pagination,
count footer) is the library's; **host chrome rides slots** (no fetching
inside the module):

- `renderChipExtra` — leading chip content (a relation select, a type
  badge). The chip's label and per-chip remove stay built-in.
- `showChips: false` — the host renders selections itself (rich cards,
  grouped lists) from the controlled `value`.
- `renderRowContent` — per-row text block replacement in the browse modal
  (descriptions, metadata, match highlighting via the `ctx.search` the row
  renderer receives). The `Add/Added <label>` toggle stays built-in.
- `filterOption` — host predicate over the rows (client-side facet
  filters). Load-more pagination keeps following the raw pages.
- `reloadKey` — re-runs the current search when a host-side server filter
  (not the query/category) changes.
- `selectAll` — the built-in bulk selector. Opt-in, and it never guesses:
  its scope is `matching` (every option passing the current search, the
  category and `filterOption`), so "select all" always means *all the rows
  this filter shows*, not the whole catalog. Partial matches render
  `aria-checked="mixed"`; clicking again removes only the matching options
  and leaves the rest of the selection untouched. In server mode the scope
  is what the loaded pages hold. The control is also exposed to hosts as
  `ctx.selectAll` (node) and `ctx.matching` / `ctx.toggleAll` (data +
  action), so a custom body places or re-labels it — `labels.selectAllLabel`
  / `labels.clearSelectionLabel` carry the strings.
- `renderBody` — full body composition. `PickerBrowseBodyCtx` exposes the
  current filter state (`search`, `onSearchChange`, `category`,
  `onCategoryChange`, `categories`, `value`), the matching set
  (`matching`), the default pieces as nodes (`filters` = the search +
  category row, `searchInput`, `categorySelect`, `selectAll`, `list` =
  rows + *Load more*) and the selection helpers (`isSelected`, `toggle`,
  `toggleAll`) so an alternate surface (a graph, a tree) feeds the same
  controlled selection. Return a falsy value for the default body.
- `category` + `onCategoryChange` — lift the category filter into host
  state when host chrome (custom category controls, facet registries) needs
  it; without them the modal manages it internally.

Rich per-item content can ride the option objects — the module never strips
fields it doesn't know, so host data round-trips through `value`/`onChange`
and back out of the slot callbacks (cast to the host's option subtype).

## labels & i18n

All strings are props on `labels: PickerLabels` with English defaults:
`placeholder`, `inputLabel`, `searchPlaceholder`, `browseLabel`,
`browseTitle`, `removeLabel`, `addLabel`, `addedLabel`, `loadMoreLabel`,
`doneLabel`, `closeLabel`, `emptyLabel`, `searchingLabel`, `categoryLabel`,
`allCategoriesLabel`, `selectedCountLabel(count)`, `selectAllLabel`
(composed as `Select all (N)`) and `clearSelectionLabel`. Pass translated
labels at the call site (tests query by accessible name — keep them unique
per surface).

## minimal

```tsx
const [value, setValue] = useState<PickerSelection[]>([])

<MultiSelectPicker options={catalog} value={value} onChange={setValue} />
```

## realistic

```tsx
// career-style: app fetches the ontology once, picker filters locally
<MultiSelectPicker
  options={skills.map((s) => ({ value: s.key, label: s.label, category: s.category }))}
  value={selected.map((key) => ({ value: key, label: labelFor(key) }))}
  onChange={(next) => setSelected(next.map((entry) => entry.value))}
  placeholder={t('filters.skillsPlaceholder')}
  labels={{ browseLabel: t('filters.browseCatalog'), addLabel: t('filters.add') }}
/>

// health-style: debounced cross-catalog server search
<MultiSelectPicker
  value={selection}
  onChange={setSelection}
  onSearch={(query) => searchCatalogs(query, { types: allowed })}
  onLoadMore={(query, category, offset) => listPage(query, category, offset)}
  categories={typeNames}
  mode="single"
/>

// host chrome: per-chip control + rich rows + custom body composition
<MultiSelectPicker
  value={selection}
  onChange={setSelection}
  onSearch={search}
  renderChipExtra={(entry, idx) => (
    <RelationSelect value={entry} onChange={(next) => updateAt(idx, next)} />
  )}
  showChips={display === 'chips'}
  browseModalProps={{
    selectAll: true,
    category,
    onCategoryChange: setCategory,
    filterOption: (option) => facetFilter.passes(option),
    renderRowContent: (option, selected) => <RichRow option={option} selected={selected} />,
    renderBody: (ctx) =>
      graphMode ? (
        <GraphSurface onPick={ctx.toggle} isPicked={ctx.isSelected} />
      ) : (
        <>
          {ctx.filters}
          <FacetBar />
          {ctx.selectAll}
          {ctx.list}
        </>
      ),
  }}
/>
```

## host with its own browsing body

When the host is itself a modal (a gallery, a full-page catalog) the browse
modal is useless — take the bulk control alone and keep your own body:

```tsx
const matching = visible; // the host's filtered, unpaginated set
const pickedHere = matching.filter((entry) => selected.has(entry.id)).length

<PickerBulkSelect
  count={matching.length}
  pickedCount={pickedHere}
  label={t('catalog.selectAll', { count: matching.length })}
  clearLabel={t('catalog.clearSelection')}
  onToggle={() =>
    setSelected((current) =>
      pickedHere === matching.length
        ? new Set([...current].filter((id) => !matching.some((entry) => entry.id === id)))
        : new Set([...current, ...matching.map((entry) => entry.id)]),
    )
  }
/>
```

## accessibility

See the [accessibility matrix](../accessibility.md#multi-select-picker): the
input is a full combobox (`role="combobox"` + `role="listbox"` +
`role="option"`, `aria-activedescendant`, Arrow/Home/End/Enter/Escape);
chips and row toggles carry per-item accessible names; the browse modal is
a titled modal dialog. Host slots (`renderRowContent`, `renderBody`) keep
the built-in named `Add/Added <label>` toggles, so slotted surfaces retain
the tested accessible names. Note: the type-ahead listbox portals to
`document.body` (like [`Combobox`](./combobox.md)) so scroll containers
never clip it.

## related modules

- [`combobox`](./combobox.md) — popover select with built-in option list;
  use it when the host owns the list and no browse modal is wanted.
- [`chip-list`](./chip-list.md) / [`chip-input`](./chip-input.md) — plain
  pill rows and free-text chip entry.
- [`modal`](./modal.md) — `PanelModal` shell used by the browse modal.
