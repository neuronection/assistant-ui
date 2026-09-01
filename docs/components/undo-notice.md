# UndoNotice

Undo toast for destructive-but-reversible actions: message + Undo button,
auto-dismiss via `duration`, `role="status"` live region. Rendering (when/
where) is app-side.

## import

```ts
import { UndoNotice } from '@neuronection/assistant-ui/undo-notice'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `message` | `string` | `'Item deleted'` | |
| `actionLabel` | `string` | `'Undo'` | |
| `onUndo` | `() => void` | — | |
| `undoing` | `boolean` | `false` | Undo shows spinner + disables |
| `duration` | `number` | `8000` | ms to auto-dismiss; `<= 0` disables the timer |
| `onDismiss` | `() => void` | — | timer callback (also call it when unmounting yourself) |
| `className` | `string` | — | merges |

## controlled contract

Visibility is app state; the component owns only the countdown —
`onDismiss` fires after `duration`. `onUndo` reports the click; the app
restores the item and unmounts the notice.

## labels & i18n

`message`/`actionLabel` are app strings.

## examples

minimal:

```tsx
<UndoNotice onUndo={restore} onDismiss={() => setVisible(false)} />
```

realistic (after an optimistic delete, study pattern):

```tsx
{deleted && (
  <UndoNotice
    message={t('notes.deleted', { name: deleted.name })}
    actionLabel={t('common.undo')}
    undoing={restoring}
    onUndo={() => restore.mutate(deleted.id)}
    onDismiss={() => setDeleted(null)}
  />
)}
```

## accessibility

See [accessibility.md](../accessibility.md#status--feedback) and
[#actions](../accessibility.md#actions): `role="status"` live region; Enter
on *Undo* fires `onUndo`; auto-dismiss via `duration`.

## related

[`ErrorBanner`](./error-banner.md), [`Button`](./button.md).
