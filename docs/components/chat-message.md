# ChatMessage

The family chat bubble: role-aligned layout (user right / assistant left /
system centered), hover+focus action row (copy, edit, regenerate, app
extras), sibling-variant switcher, reasoning and below-content slots,
inline edit-and-resend, error and interrupted states. Presentational —
all state and callbacks stay app-side.

## import

```ts
import { ChatMessage, MessageVariantSwitcher, ChatMessageEditor } from '@neuronection/assistant-ui/chat-message'
```

## props (ChatMessage)

| Prop | Type | Description |
| --- | --- | --- |
| `role` | `'user' \| 'assistant' \| 'system'` | Alignment + bubble styling. |
| `content` | `ReactNode` | Usually a `MarkdownSurface`. |
| `reasoning` | `ReactNode` | Thinking slot — usually `ChatReasoning`. |
| `children` | `ReactNode` | Below-content slot — tool cards, HITL cards. |
| `status` | `'streaming' \| 'done' \| 'error' \| 'interrupted'` | Default `done`. |
| `error` | `ChatError` | Alert block with optional retry (when `retryable` + `actions.onRetry`). |
| `actions` | `ChatMessageActions` | `onCopy` / `onEdit` / `onRegenerate` / `onRetry` / `extras: ChatMessageAction[]`. |
| `editing` | `false \| { value; onValueChange; onSubmit; onCancel; submitDisabled? }` | Renders `ChatMessageEditor` (save & resend branches the tree). |
| `variants` | `ChatMessageVariants` | `{ index, count, siblingIds }` — shows `‹ n/N ›` when `count > 1`. |
| `onSelectVariant` | `(id) => void` | Drives the family `select` endpoint. |
| `meta` / `chips` / `attachments` | `ReactNode` | Badge row / deep-link chips / attachment rail. |
| `labels` | `Partial<…>` | All user-facing strings. |
| `compact` | `boolean` | Denser padding (sidebar/bubble surfaces). |

`ChatMessageEditor`: controlled textarea, Cmd/Ctrl+Enter saves & resends,
Escape cancels. `MessageVariantSwitcher`: keyboard-reachable prev/next,
disabled at the ends, `‹ n/N ›` readout.

## example (realistic)

```tsx
<ChatMessage
  role={message.role}
  content={<MarkdownSurface value={message.content} />}
  reasoning={message.reasoning ? <ChatReasoning text={message.reasoning} streaming={isLive} /> : null}
  actions={{ onCopy: () => copy(message.id), onEdit: () => setEditing(message.id), onRegenerate: () => regenerate(message.parentId) }}
  variants={message.variants}
  onSelectVariant={(id) => select(id)}
>
  {message.toolCalls.map((call) => <ChatToolCard key={call.id} {...call} />)}
</ChatMessage>
```

## accessibility

Action row reveals on hover AND `focus-within` (keyboard reachable);
action buttons carry `aria-label`s; variant switcher is a labelled
`role="group"` with labelled prev/next buttons; errors are `role="alert"`;
the editor labels its textarea and documents its shortcuts in the labels.

## related

[`chat-reasoning`](./chat-reasoning.md), [`chat-tool-card`](./chat-tool-card.md),
[`chat-markdown`](./chat-markdown.md), [`chat-core`](./chat-core.md),
[`chat-transcript`](./chat-transcript.md).
