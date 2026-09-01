# ViewToggle

Two-button grid/list switch with `aria-pressed` state. Controlled — the
persisted view (e.g. `useStoredView`) stays app-side.

## import

```ts
import { ViewToggle, type ViewToggleView } from '@neuronection/assistant-ui/view-toggle'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `view` | `'grid' \| 'list'` | — | active view |
| `onChange` | `(view: ViewToggleView) => void` | — | |
| `gridLabel` | `string` | `'Grid view'` | `aria-label` + `title` |
| `listLabel` | `string` | `'List view'` | |
| `className` | `string` | — | merges |

## controlled contract

`view` in, `onChange('grid' | 'list')` out. Persistence is app-side.

## labels & i18n

`gridLabel`/`listLabel` are app strings (accessible names).

## examples

minimal:

```tsx
<ViewToggle view={view} onChange={setView} />
```

realistic (persisted view):

```tsx
const [view, setView] = useStoredView<ViewToggleView>('notes', 'grid')

<ViewToggle view={view} onChange={setView} gridLabel={t('common.gridView')} listLabel={t('common.listView')} />
{view === 'grid' ? <Grid /> : <List />}
```

## accessibility

See [accessibility.md](../accessibility.md#actions): buttons with
`aria-pressed`; Enter switches views.

## related

[`SelectionBar`](./selection-bar.md), [`Popover`](./popover.md).
