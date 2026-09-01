# SelectionBar

Floating bulk-select bar: "N selected", app-supplied bulk actions, and a
clear button. Renders **nothing** at `count === 0`.

## import

```ts
import { SelectionBar } from '@neuronection/assistant-ui/selection-bar'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `count` | `number` | — | 0 renders nothing |
| `onClear` | `() => void` | — | clear button |
| `countLabel` | `ReactNode` | `` `${count} selected` `` | override for translations |
| `clearLabel` | `string` | `'Clear selection'` | clear button accessible name |
| `children` | `ReactNode` | — | bulk actions (buttons, menus) |
| `className` | `string` | — | merges |

## controlled contract

`count` is derived from the app's selection set; clearing reports via
`onClear`. Bulk actions are app-rendered children.

## labels & i18n

`countLabel`/`clearLabel` are app strings — the English default of
`countLabel` is a formatting shortcut only.

## examples

minimal:

```tsx
<SelectionBar count={selected.size} onClear={() => setSelected(new Set())} />
```

realistic (with bulk actions):

```tsx
<SelectionBar
  count={selected.size}
  onClear={() => setSelected(new Set())}
  countLabel={t('notes.selectedCount', { count: selected.size })}
  clearLabel={t('common.clearSelection')}
>
  <Button variant="ghost" size="sm" onClick={archive}>{t('common.archive')}</Button>
  <Button variant="ghost" size="sm" onClick={remove}>{t('common.delete')}</Button>
</SelectionBar>
```

## accessibility

See [accessibility.md](../accessibility.md#actions): Enter on the clear
button clears; renders nothing at `count={0}`.

## related

[`CheckIndicator`](./check-indicator.md), [`Marquee`](./marquee.md).
