# ChatTranscript

The conversation list: `role="log"` semantics, polite screen-reader
announcements on assistant turn completion (never per token),
stick-to-bottom auto-scroll with a jump-to-latest pill, optional
virtualization for thousand-message threads.

## import

```ts
import { ChatTranscript } from '@neuronection/assistant-ui/chat-transcript'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `ChatMessageView[]` | The persisted (active-path) messages. |
| `renderItem` | `(message, index) => ReactNode` | Default: `ChatMessage` + `MarkdownSurface`. |
| `live` | `ReactNode` | The streaming tail bubble (app composes from `useChatStream`). |
| `emptyState` | `ReactNode` | Empty-chat slot (suggestion chips live here). |
| `autoScroll` | `boolean` | Stick to bottom while the user hasn't scrolled away. Default `true`. |
| `scrollThresholdPx` | `number` | "At the bottom" distance for the jump pill. Default `120`. |
| `virtualized` | `boolean` | Dynamic-measurement virtualization. Default `false`. |
| `labels` | `Partial<ChatTranscriptLabels>` | log / scrollToBottom / empty / replied. |

## example (realistic)

```tsx
<ChatTranscript
  items={messages}
  live={
    stream.live ? (
      <ChatMessage role="assistant" status="streaming"
        content={<MarkdownSurface value={stream.text ?? ''} streaming />}
        reasoning={stream.reasoning !== null ? <ChatReasoning text={stream.reasoning} streaming /> : null}
      />
    ) : null
  }
  emptyState={<EmptyState title="Ask anything" />}
/>
```

## accessibility

`role="log"` with `aria-label`; `aria-busy` while a live turn renders;
turn completion announced through a visually-hidden `aria-live="polite"`
region; jump pill is a labelled button. Keyboard flows tested.

## related

[`chat-message`](./chat-message.md), [`chat-panel`](./chat-panel.md),
[`chat-core`](./chat-core.md).
