# ChatTranscript

The conversation list: `role="log"` semantics, polite screen-reader
announcements on assistant turn completion (never per token),
stick-to-bottom auto-scroll with a jump-to-latest pill, optional
virtualization for thousand-message threads.

## stick-to-bottom contract

The transcript follows the stream only while the user is at the bottom.
Fast streams re-pin the bottom on every render, which used to erase a
partial upward scroll before it crossed `scrollThresholdPx` — so the
follow now breaks on the FIRST sign of scroll-up intent, and only a
deliberate return to the bottom re-arms it:

- wheel-up, upward touch drag, and scroll-up keys (ArrowUp, PageUp,
  Home, Shift+Space) cancel the follow synchronously, before the
  browser applies the scroll;
- any upward scroll event that still has distance to the bottom
  (e.g. scrollbar drags) also breaks it — direction-gated, so
  clamp-to-bottom content swaps do not;
- scrolling back to within `scrollThresholdPx` of the bottom (or the
  jump pill) re-arms the follow.

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
| `autoScroll` | `boolean` | Stick to bottom while the user hasn't scrolled away; breaks on scroll-up intent (see the contract above). Default `true`. |
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
