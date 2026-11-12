# CommandPalette

The modal command surface: a thin wrapper over the library
[`Modal`](./modal.md) that renders [`CommandList`](./command-list.md). It owns
the overlay, focus trap, focus restore and dialog labelling; it does **not**
implement a second overlay. The app owns open state, the catalog, async
results, ordering, routing and action execution.

## import

```ts
import { CommandPalette } from '@neuronection/assistant-ui/command-palette'
import type { CommandGroup, CommandItem } from '@neuronection/assistant-ui/command-list'
```

## props — CommandPalette

`CommandPalette` takes every [`CommandList`](./command-list.md) prop plus:

| prop | type | default | notes |
|---|---|---|---|
| `open` | `boolean` | — | controlled dialog state |
| `onOpenChange` | `(open: boolean) => void` | — | Escape, overlay click and the × report `false`; also fires after a selection |
| `query` | `string` | — | controlled search text |
| `onQueryChange` | `(query: string) => void` | — | |
| `groups` | `CommandGroup[]` | — | |
| `onSelect` | `(item, context) => void` | — | fires, then the palette closes |
| `labels` | `CommandListLabels` | — | |
| `activeId` | `string` | — | controlled active item |
| `onActiveIdChange` | `(id: string) => void` | — | |
| `tabBehavior` | `'select' \| 'focus'` | `'focus'` | the modal default keeps Tab inside the dialog instead of selecting |
| `ariaLabel` | `string` | `'Command palette'` | dialog accessible name (rendered as a visually hidden title) |
| `closeLabel` | `string` | `'Close'` | built-in × accessible name |
| `className` | `string` | — | merges on the palette wrapper inside the dialog |

## controlled contract

- `open` + `onOpenChange` are controlled; the app wires its `Ctrl/Cmd+K`
  shortcut and any permission filtering.
- `query` and `activeId` are controlled exactly as in `CommandList`; the
  palette does not reset them on close.
- Focus lands in the search field on open. Escape and the × close the dialog
  and restore focus to the element that was focused before opening (works
  for a `Ctrl/Cmd+K` open with no trigger button).
- Selecting an enabled item calls `onSelect` and then closes the palette.
  Disabled items never select.

## examples

```tsx
const [open, setOpen] = useState(false)
const [query, setQuery] = useState('')

useEffect(() => {
  const onKey = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      setOpen((value) => !value)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  query={query}
  onQueryChange={setQuery}
  groups={groups}
  onSelect={(item, context) => navigate(item.id, context.query)}
  labels={{ placeholder: t('commands.placeholder'), results: t('commands.count') }}
  ariaLabel={t('commands.title')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): `role="dialog"`
named by `ariaLabel`, focus trapped and restored, Escape closes, the inner
`CommandList` keeps the combobox/listbox contract. `tabBehavior` defaults to
`'focus'` in the modal.

## related

[`CommandList`](./command-list.md), [`Modal`](./modal.md),
[`ShortcutList`](./shortcut-list.md).
