# SearchInput

Controlled search box in a `role="search"` form: icon, clear button (when
non-empty), Enter submits. `placeholder` and `ariaLabel` are required — the
library never guesses accessible names.

## import

```ts
import { SearchInput } from '@neuronection/assistant-ui/search-input'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string` | — | controlled |
| `onChange` | `(value: string) => void` | — | also `''` from the clear button |
| `onSubmit` | `(value: string) => void` | — | form submit (Enter) |
| `placeholder` | `string` | — | **required** |
| `ariaLabel` | `string` | — | **required** — input accessible name |
| `autoFocus` | `boolean` | `false` | |
| `clearLabel` | `string` | `'Clear search'` | |
| `className` | `string` | — | merges onto the form wrapper |

## controlled contract

`value` in, `onChange`/`onSubmit` out. Internal state: none.

## labels & i18n

`placeholder`/`ariaLabel`/`clearLabel` are app strings (no English defaults
for the first two by design).

## examples

minimal:

```tsx
<SearchInput value={q} onChange={setQ} placeholder={t('common.search')} ariaLabel={t('common.search')} />
```

realistic (with submit, study pattern):

```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  onSubmit={(value) => search.mutate(value)}
  placeholder={t('notes.searchPlaceholder')}
  ariaLabel={t('notes.search')}
  clearLabel={t('common.clear')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): `role="search"` wrapper +
textbox + clear button; Enter submits (`onSubmit`); clear button empties.
Stays `type="text"` (a `type="search"` would change the ARIA role).

## related

[`ExpandableSearch`](./expandable-search.md), [`Combobox`](./combobox.md).
