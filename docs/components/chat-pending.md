# ChatPending

The first-token latency placeholder (plan 100 S2): the assistant-aligned
shimmer bubble rendered as the transcript's `live` tail between send and
the first delta. A narrated phase row (dots + optional elapsed timer via
`ChatTurnStatus`) plus placeholder lines shimmering in the `--as-ai`
accent — the family's "model at work" identity. Presentational; the turn
state lives in `useChatStream`.

## import

```ts
import { ChatPending } from '@neuronection/assistant-ui/chat-pending'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Phase narrated while the first token is awaited, e.g. "thinking". Default "thinking". |
| `startedAt` | `number` | Turn start (ms epoch). Presence enables the elapsed timer. |
| `lines` | `number` | Placeholder line count. Default 2, clamped 1–6. |
| `children` | `React.ReactNode` | Extra node under the placeholder (model badge, hints). |
| `className` | `string` | Merged onto the root. |

## examples

```tsx
// The live tail until the first delta arrives (career chatTransport).
<ChatTranscript
  items={messages}
  live={
    stream.live
      ? stream.text === null
        ? <ChatPending label={stream.nodes.at(-1)?.label ?? 'thinking'} startedAt={stream.startedAt ?? undefined} />
        : <ChatMessage role="assistant" status="streaming" content={<MarkdownSurface value={stream.text} streaming />} />
      : undefined
  }
/>
```

Swap `ChatPending` out on the first text delta — the caret in
`MarkdownSurface` takes over the "still streaming" narration from there.

## accessibility

Non-interactive. The phase row is the `role="status"` region (dots and
timer `aria-hidden`, no re-announcements); the shimmer placeholder is
`aria-hidden` entirely. The shimmer animation is disabled under
`prefers-reduced-motion: reduce` (lines render as static muted bars).
Asserted non-interactive and axe-clean while pending.

## related

[`chat-turn-status`](./chat-turn-status.md),
[`chat-transcript`](./chat-transcript.md),
[`chat-reasoning`](./chat-reasoning.md).
