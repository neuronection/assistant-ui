# ExpandableSearch

Collapsing search box: a 36px icon trigger that expands to a 256px search
form (width transition), auto-focuses, and collapses on Escape/blur when
empty. First Escape clears a value, second collapses.

## import

```ts
import { ExpandableSearch } from '@neuronection/assistant-ui/expandable-search'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string` | — | controlled |
| `onChange` | `(value: string) => void` | — | also `''` from clear/Escape-clear |
| `onSubmit` | `(value: string) => void` | — | form submit (Enter) |
| `onClear` | `() => void` | — | reports any clear (×, Escape-clear) |
| `placeholder` | `string` | — | **required** |
| `ariaLabel` | `string` | — | **required** — input accessible name |
| `clearLabel` | `string` | `'Clear search'` | × button |
| `expandLabel` | `string` | `'Search'` | collapsed trigger accessible name |
| `className` | `string` | — | merges onto the form wrapper |

## controlled contract

`value` in, `onChange`/`onSubmit`/`onClear` out. Open state is internal —
seeded from `value !== ''` on mount, so a page loading with a query renders
expanded. Forwarded ref resolves to the inner input (for app-driven
focus()).

## labels & i18n

`placeholder`/`ariaLabel`/`clearLabel`/`expandLabel` are app strings.

## examples

minimal:

```tsx
<ExpandableSearch value={q} onChange={setQ} placeholder={t('common.search')} ariaLabel={t('common.search')} />
```

realistic (in a toolbar, with submit + clear side effects):

```tsx
<ExpandableSearch
  value={query}
  onChange={setQuery}
  onClear={() => resetFilters()}
  onSubmit={(value) => search.mutate(value)}
  placeholder={t('flashcards.searchPlaceholder')}
  ariaLabel={t('flashcards.search')}
  expandLabel={t('common.search')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): trigger reveals a
`role="search"` input; first Escape clears the value, second Escape
collapses (collapsed trigger `aria-hidden`, input `tabIndex={-1}` while
collapsed); collapsed trigger carries `expandLabel`.

## related

[`SearchInput`](./search-input.md), [`Combobox`](./combobox.md).
