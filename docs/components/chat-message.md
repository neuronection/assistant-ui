# ChatMessage

The family chat bubble: role-aligned layout (user right / assistant left /
system centered), hover+focus action row (copy with copied-feedback morph,
edit, regenerate, app extras), sibling-variant switcher with automatic
content crossfade, reasoning and below-content slots, inline
edit-and-resend, error and interrupted states — each with its entrance
animation (mount `message-in`, slide-up error/interrupted/editor states).
Presentational — all state and callbacks stay app-side.

## import

```ts
import { ChatMessage, MessageVariantSwitcher, ChatMessageEditor } from '@neuronection/assistant-ui/chat-message'
```

## props (ChatMessage)

| Prop | Type | Description |
| --- | --- | --- |
| `role` | `'user' \| 'assistant' \| 'system'` | Alignment + bubble styling. |
| `content` | `ReactNode` | Usually a `MarkdownSurface`. Remounts (crossfades) when `variants.index` changes on a branched message. |
| `reasoning` | `ReactNode` | Thinking slot — usually `ChatReasoning`. |
| `children` | `ReactNode` | Below-content slot — tool cards, HITL cards. |
| `status` | `'streaming' \| 'done' \| 'error' \| 'interrupted'` | Default `done`. `error` slides in the alert card; `interrupted` slides in the "Stopped" chip with a single amber pulse. |
| `error` | `ChatError` | Alert block with optional retry (when `retryable` + `actions.onRetry`). |
| `actions` | `ChatMessageActions` | `onCopy` / `copied` / `onEdit` / `onRegenerate` / `onRetry` / `extras: ChatMessageAction[]` / `errorExtra?: ReactNode` (rendered inside the error card — next to Retry when retryable, alone otherwise). |
| `editing` | `false \| { value; onValueChange; onSubmit; onCancel; submitDisabled? }` | Renders `ChatMessageEditor` (save & resend branches the tree). |
| `variants` | `ChatMessageVariants` | `{ index, count, siblingIds }` — shows `‹ n/N ›` when `count > 1`. |
| `onSelectVariant` | `(id) => void` | Drives the family `select` endpoint. |
| `meta` / `chips` / `attachments` | `ReactNode` | Badge row / deep-link chips / attachment rail. |
| `avatar` | `ReactNode` | Identity node beside the bubble — leading for assistants, trailing for users (`data-as="chat-message-avatar"`). With `ChatTranscript groupConsecutive`, render it only for group starts via `renderItem`'s third argument. |
| `design` | `'bubbles' \| 'flat'` | `bubbles` (default): paired role bubbles. `flat`: assistant content renders as prose on the panel surface (`data-design` styling hook) — user keeps its bubble; reasoning/tool cards unaffected. |
| `labels` | `Partial<…>` | All user-facing strings, incl. `copied` (default "Copied"). |
| `compact` | `boolean` | Denser padding (sidebar/bubble surfaces). |

`actions.copied` is the controlled copied-feedback flag; uncontrolled,
the library morphs the copy icon into a success check for 1.5 s after
each copy click (`aria-label` follows: "Copy" → "Copied").

`ChatMessageEditor`: controlled textarea (autofocused, slide-up reveal),
Cmd/Ctrl+Enter saves & resends, Escape cancels. `MessageVariantSwitcher`:
keyboard-reachable prev/next, disabled at the ends, `‹ n/N ›` readout.

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

Action row (`data-as="chat-message-actions"`) reveals on hover AND
`focus-within` (keyboard reachable — reveal owned by `tokens.css`,
token-timed, disabled under reduced motion); action buttons carry
`aria-label`s that track the copied state; variant switcher is a labelled
`role="group"` with labelled prev/next buttons; errors are `role="alert"`;
the editor labels its textarea, autofocuses it on mount, and documents
its shortcuts in the labels.

## related

[`chat-reasoning`](./chat-reasoning.md), [`chat-tool-card`](./chat-tool-card.md),
[`chat-markdown`](./chat-markdown.md), [`chat-core`](./chat-core.md),
[`chat-transcript`](./chat-transcript.md).
