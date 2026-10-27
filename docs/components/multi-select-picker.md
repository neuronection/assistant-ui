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

The modal shell is [`PanelModal`](./modal.md) (Radix Dialog) — Escape and
click-outside close, focus is trapped and restored.

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

## labels & i18n

All strings are props on `labels: PickerLabels` with English defaults:
`placeholder`, `inputLabel`, `searchPlaceholder`, `browseLabel`,
`browseTitle`, `removeLabel`, `addLabel`, `addedLabel`, `loadMoreLabel`,
`doneLabel`, `closeLabel`, `emptyLabel`, `searchingLabel`, `categoryLabel`,
`allCategoriesLabel`, `selectedCountLabel(count)`. Pass translated labels at
the call site (tests query by accessible name — keep them unique per
surface).

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
```

## accessibility

See the [accessibility matrix](../accessibility.md#multi-select-picker): the
input is a full combobox (`role="combobox"` + `role="listbox"` +
`role="option"`, `aria-activedescendant`, Arrow/Home/End/Enter/Escape);
chips and row toggles carry per-item accessible names; the browse modal is
a titled modal dialog. Note: the type-ahead listbox portals to `document.body`
(like [`Combobox`](./combobox.md)) so scroll containers never clip it.

## related modules

- [`combobox`](./combobox.md) — popover select with built-in option list;
  use it when the host owns the list and no browse modal is wanted.
- [`chip-list`](./chip-list.md) / [`chip-input`](./chip-input.md) — plain
  pill rows and free-text chip entry.
- [`modal`](./modal.md) — `PanelModal` shell used by the browse modal.
