# Table

Presentational data table: `headers` + `rows` of React nodes, opt-in empty
row. Native `<table>` semantics; row/cell interactivity is app-side (put
controls in cells).

## import

```ts
import { Table } from '@neuronection/assistant-ui/table'
```

## props

Extends `React.ComponentProps<'div'>` (scroll wrapper).

| prop | type | default | notes |
|---|---|---|---|
| `headers` | `string[]` | — | column captions |
| `rows` | `ReactNode[][]` | — | one array per row, aligned to `headers` |
| `emptyText` | `string` | — | full-width row when `rows` is empty; no default |
| `className` | `string` | — | merges onto the scroll wrapper |

## controlled contract

None — rendering only. Keys are positional (row/cell index); keep cell
controls keyed by stable ids inside your nodes when rows reorder.

## labels & i18n

`headers`/`emptyText` and cell content are app strings.

## examples

minimal:

```tsx
<Table headers={['Model', 'Caps']} rows={[['llama-3', 'text']]} />
```

realistic (empty state + rich cells):

```tsx
<Table
  headers={[t('settings.model'), t('settings.provider'), t('settings.cost')]}
  rows={rows.map((r) => [
    <span className="font-mono text-xs">{r.externalId}</span>,
    r.providerName,
    `$${r.costUsd.toFixed(3)}`,
  ])}
  emptyText={t('costs.empty')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): native
`<table>`/`<th scope="col">`/`<td>` semantics; presentational data view.

## related

[`EmptyState`](./empty-state.md), [`ChipList`](./chip-list.md).
