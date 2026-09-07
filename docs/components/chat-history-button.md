# ChatHistoryButton

Header entry point for a chat's session history (career's `HistoryButton`
+ study's ChatPanel history popover, generalized): a labelled popover
trigger wrapping the app's session list. The list itself (search, date
groups, rename/delete/export) stays app-side as
[`ChatSessionList`](./chat-session-list.md) glue — this owns the popover
sizing, open-refresh hook and the close-on-pick `closeSignal` wiring.

## import

```ts
import { ChatHistoryButton } from '@neuronection/assistant-ui/chat-history-button'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `(close: () => void) => ReactNode` | Popover content; call `close` after a pick to dismiss. |
| `icon` | `LucideIcon` | Trigger icon, default `History`. |
| `onOpen` | `() => void` | Called every time the popover opens — refresh sessions here. |
| `align` | `'start' \| 'center' \| 'end'` | Popover alignment (default `end`). |
| `panelClassName` | `string` | Extra panel classes (default panel is `h-96 w-72 p-2`). |
| `labels` | `Partial<ChatHistoryButtonLabels>` | `open` — trigger accessible name (default `Chat history`). |
| `className` | `string` | Wrapper classes. |

## controlled contract

Uncontrolled: open state lives in the underlying `PopoverButton`. The
render-prop `close` bumps an internal `closeSignal`; apps never manage
open state.

## label / i18n contract

`labels.open` is the trigger's accessible name; apps translate at the
call site.

## snippets

```tsx
import { ChatHistoryButton } from '@neuronection/assistant-ui/chat-history-button'
import { SessionList } from './components/chat/SessionList'

function ChatHeaderActions() {
  const loadSessions = useChatStore((state) => state.loadSessions)
  return (
    <ChatHistoryButton onOpen={() => void loadSessions()}>
      {(close) => <SessionList onPick={close} />}
    </ChatHistoryButton>
  )
}
```

```tsx
<ChatHistoryButton icon={Clock} panelClassName="h-64 w-64">
  {() => <CompactSessionList />}
</ChatHistoryButton>
```

## accessibility

Trigger is a labelled `role="button"` (Radix popover semantics: Escape
closes, focus returns to the trigger); content is app markup — keep the
session list keyboard-navigable (the `ChatSessionList` glue already is).
Clean under jest-axe open and closed.

## related

[`chat-session-list`](./chat-session-list.md),
[`chat-panel`](./chat-panel.md),
[`popover-button`](./popover-button.md).
