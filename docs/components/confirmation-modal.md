# ConfirmationModal

Ready-made destructive/confirm dialog on the [`Modal`](./modal.md) compound:
icon tile, title/description, cancel + confirm (loading-capable) buttons.

## import

```ts
import { ConfirmationModal } from '@neuronection/assistant-ui/confirmation-modal'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `open` | `boolean` | — | controlled |
| `onOpenChange` | `(open: boolean) => void` | — | Escape/× report `false` |
| `title` | `string` | — | |
| `description` | `string` | — | |
| `confirmLabel` | `string` | `'Confirm'` | |
| `cancelLabel` | `string` | `'Cancel'` | |
| `destructive` | `boolean` | `false` | danger icon tint + destructive confirm button |
| `busy` | `boolean` | `false` | confirm shows a spinner, both actions disable |
| `onConfirm` | `() => void` | — | |
| `icon` | `LucideIcon` | `AlertTriangle` | |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'` | |
| `closeLabel` | `string` | `'Close'` | |

## controlled contract

`open` + `onOpenChange` + `onConfirm`. Await your mutation, keep `busy` up
while it runs, close from the app when it resolves. Escape while busy
reports `onOpenChange(false)` — gate in the handler if you must block.

## labels & i18n

`title`/`description`/`confirmLabel`/`cancelLabel` are app strings.

## examples

minimal:

```tsx
<ConfirmationModal
  open={open}
  onOpenChange={setOpen}
  title="Delete note?"
  description="This cannot be undone."
  destructive
  onConfirm={remove}
/>
```

realistic (study pattern with a `useConfirm` hook):

```tsx
const ok = await confirm({
  title: t('settings.deleteProvider'),
  description: t('settings.confirmDeleteProvider'),
  confirmLabel: t('settings.deleteProvider'),
  cancelLabel: t('common.cancel'),
  destructive: true,
})
if (ok) remove.mutate(provider.id)
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): Enter on confirm fires
`onConfirm`, Escape reports `onOpenChange(false)`, busy disables both
actions; inherits `Modal`'s focus restoration.

## related

[`Modal`](./modal.md), [`FormModal`](./form-modal.md), [`Button`](./button.md).
