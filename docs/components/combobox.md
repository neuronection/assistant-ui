# Combobox

Popover-backed select with a search field, fuzzy filtering (via
[`searchScore`](../guides/utilities.md#fuzzy-search-searchscore-fuzzyscore)),
grouping, per-option badges and full keyboard navigation. Two flavors:
`Combobox` (single) and `ComboboxMulti` (multi-select). Async mode: pass
`onSearchChange` and own the filtering/fetching app-side.

## import

```ts
import { Combobox, ComboboxMulti, type ComboboxOption } from '@neuronection/assistant-ui/combobox'
```

## props — Combobox

| prop | type | default | notes |
|---|---|---|---|
| `options` | `ComboboxOption[]` | — | `{ value, label, description?, group?, badge?, disabled? }` |
| `value` | `string` | — | selected option value |
| `onChange` | `(value: string) => void` | — | also fires `''` from the clear button |
| `placeholder` | `string` | `'Select an option…'` | trigger text when empty |
| `searchPlaceholder` | `string` | `'Search…'` | panel search field |
| `searchLabel` | `string` | — | accessible name of the search field |
| `emptyLabel` | `string` | — | "no matches" text |
| `loadingLabel` | `string` | — | text next to the spinner |
| `loading` | `boolean` | `false` | swaps the list for a spinner row |
| `disabled` | `boolean` | `false` | |
| `clearable` | `boolean` | `false` | shows the × clear button when a value is set |
| `clearLabel` | `string` | `'Clear'` | clear button accessible name |
| `onSearchChange` | `(term: string) => void` | — | **async mode**: disables internal filtering, you filter `options` |
| `onOpenChange` | `(open: boolean) => void` | — | panel open state reports |
| `label` | `string` | — | visible field label wired to the trigger |
| `hideLabel` | `boolean` | `false` | keep `label` as the accessible name but don't render it visibly (the surrounding component titles the row) |
| `error` | `string` | — | `role="alert"` line + `aria-invalid` |
| `id` | `string` | auto | on the trigger button |
| `className` / `panelClassName` | `string` | — | wrapper / popover panel |

## props — ComboboxMulti

Same as `Combobox` except `value: string[]`, `onChange(value: string[])`,
plus `maxTriggerLabels?: number` (default `3` — beyond that the trigger
summarizes `N selected`). Selecting an option does not close the panel.

## controlled contract

- Value is fully controlled; selection reports out via `onChange`. Single
  mode closes the panel after pick, multi mode stays open.
- Internal search text + active option live in the component. In sync mode
  the library filters with `searchScore`; in async mode (`onSearchChange`)
  you own the list — debounce/fetch app-side and keep `loading` honest.
- `group` renders group headers for consecutive equal values (sort by group
  yourself if you need ordered sections).

## labels & i18n

All strings are props; defaults are English. Pass translated labels at the
call site (see the accessibility note: tests query by accessible name).

## examples

minimal:

```tsx
<Combobox
  options={[
    { value: 'a', label: 'Alpha', group: 'Letters' },
    { value: 'b', label: 'Beta', group: 'Letters' },
  ]}
  value={value}
  onChange={setValue}
  label="Letter"
/>
```

realistic — async search against an app endpoint:

```tsx
<Combobox
  options={fetchedOptions}
  value={value}
  onChange={setValue}
  onSearchChange={(term) => setQuery(term)}
  loading={isFetching}
  clearable
  clearLabel={t('common.clear')}
  searchLabel={t('common.search')}
  emptyLabel={t('common.noMatches')}
  label={t('tags.label')}
  error={error ?? undefined}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): combobox +
listbox + `option` roles, `aria-selected`, `aria-activedescendant`, groups,
ArrowUp/Down/Home/End/Enter/Escape contract, disabled options skipped,
Escape restores focus to the trigger, clear button empties. `ComboboxMulti`
keeps the listbox open on Enter and announces the option count via a live
region.

## related

[`ModelPicker`](./model-picker.md) (grouped provider→model preset),
[`TaskAssignmentPicker`](./task-assignment-picker.md),
[`SearchInput`](./search-input.md).
