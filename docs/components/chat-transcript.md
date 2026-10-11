# ChatTranscript

The conversation list: `role="log"` semantics, polite screen-reader
announcements on assistant turn completion (never per token),
stick-to-bottom auto-scroll with an unread-counting jump-to-latest pill,
optional consecutive-message grouping, a top fade mask while scrolled
into the thread, thin themed scrollbars, and optional virtualization for
thousand-message threads.

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
| `renderItem` | `(message, index, groupPos?) => ReactNode` | Default: `ChatMessage` + `MarkdownSurface`. The third argument is the row's group position when `groupConsecutive` is on — use it to show group-start avatars only. |
| `live` | `ReactNode` | The streaming tail bubble or `ChatPending` (app composes from `useChatStream`). |
| `emptyState` | `ReactNode` | Empty-chat slot (suggestion chips live here). |
| `autoScroll` | `boolean` | Stick to bottom while the user hasn't scrolled away; breaks on scroll-up intent (see the contract above). Default `true`. |
| `scrollThresholdPx` | `number` | "At the bottom" distance for the jump pill. Default `120`. |
| `virtualized` | `boolean` | Dynamic-measurement virtualization. Default `false`. |
| `groupConsecutive` | `boolean` | Tighten spacing between consecutive same-role messages and tag each row `data-group-pos` (`single \| start \| mid \| end`; system rows always `single`). Default `false`. |
| `design` | `'bubbles' \| 'flat'` | Visual design for the default renderer: paired bubbles (default) or flat assistant prose over the panel surface (user keeps its bubble). Custom `renderItem` apps pass `design` to `ChatMessage` themselves. |
| `search` | `{ query; onQueryChange }` | In-conversation search: renders `ChatSearchField` above the log, wraps case-insensitive matches in `<mark data-as="chat-search-match">` (default renderer; custom `renderItem` receives the query as its 4th arg), shows an `n/N` readout and jumps between matches — Enter/Shift+Enter in the field or the prev/next buttons scroll to the match with a one-shot flash (`data-search-flash`). Jump-scrolling needs a non-virtualized transcript; virtualized transcripts highlight visible rows only. Rows carry `data-message-id` for anchor queries. |
| `showDateSeparators` | `boolean` | Today/Yesterday/date chips between day groups, read from `ChatMessageView.createdAt` (rows without one join the previous group). Default `false`. |
| `formatDate` | `(date: Date) => string` | Custom formatter for older-day chips (default `MMM d, yyyy`); `labels.today` / `labels.yesterday` override the relative ones. |
| `focusMessageId` | `string \| null` | Scroll a message into view and flash it whenever this changes — branch-tree clicks, citations, deep links. |
| `onStop` | `() => void` | Renders a floating stop pill beside the jump pill while a live turn streams and the user scrolled away. |
| `labels` | `Partial<ChatTranscriptLabels>` | log / scrollToBottom / newMessages / empty / replied / search / searchPlaceholder / previousMatch / nextMatch / clearSearch / matches / today / yesterday / stop. |

`ChatSearchField` is exported from the same module for standalone use
(`query`, `onQueryChange`, `matchCount`, `activeIndex`, `onPrevious`,
`onNext` — Enter next, Shift+Enter previous, Escape clears).

The jump pill counts assistant replies that arrived while the user was
scrolled away (`— N new messages` in its label; a `9+` badge chip beyond
nine) and resets when the user returns to the bottom or clicks the pill.
The pill slides up in (`--as-duration-slow`); the transcript shows a top
fade mask (`data-fade-top`) once scrolled into the thread and uses thin
scrollbars themed by `--as-scrollbar-thumb` / `--as-scrollbar-track`
(both progressive enhancements).

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
region; jump pill is a labelled button whose accessible name carries the
unread count ("Scroll to latest — 3 new messages"; the badge chip itself
is `aria-hidden`). The search field is a labelled text input with
labelled prev/next/clear controls and an sr-labelled match readout;
match marks are standard `<mark>` semantics. Keyboard flows + unread
counting/reset + search navigation tested.

## related

[`chat-message`](./chat-message.md), [`chat-panel`](./chat-panel.md),
[`chat-core`](./chat-core.md).
