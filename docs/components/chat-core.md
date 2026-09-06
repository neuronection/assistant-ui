# chat-core

The chat layer's headless core: the normalized `ChatMessageView` contract,
the family streaming-event vocabulary, the pure `liveTurnReducer` turn
state machine, branch-tree utilities, and the transport-injected
`useChatStream` hook. Every `chat-*` renderer speaks these shapes; apps
keep transports, sessions and stores (ADR-006 tier 2).

## import

```ts
import {
  useChatStream,
  liveTurnReducer,
  buildBranchTree,
  walkActivePath,
  type ChatMessageView,
  type ChatStreamEvent,
} from '@neuronection/assistant-ui/chat-core'
```

## The view model

`ChatMessageView` is what renderers consume — apps map persisted rows onto
it (`id`, `role`, markdown `content`, optional `reasoning`, `status`:
`streaming | done | error | interrupted`, `error`, `parentId`, `variants`
(`{ index, count, siblingIds }`), `attachments`, `meta` extension bag).

## Events

`ChatStreamEvent` is the family vocabulary from
`ai-features.md` §5 — `flow_started` / `node_started` / `node_finished` /
`delta` (`kind: text | reasoning`) / `interrupt` / `flow_finished` /
`flow_failed` (`code`, `message`, `retryable`) — plus the `tool_call`
observation event (`id`, `name`, `status`, `args?`, `result?`,
`durationMs?`). Optional `run_id` fields scope events to a turn. Unknown
event names are ignored (additive contract), so app-specific extras can
flow through the same adapter.

## useChatStream

| Option | Type | Description |
| --- | --- | --- |
| `transport` | `ChatStreamTransport` | `send({ text })` · `subscribe({ onEvent }) => unsubscribe` · optional `stop()` closures over the app's WS/SSE client. |
| `flushMs` | `number` | Delta coalescing window. Default `33`. |
| `timeoutMs` | `number` | Watchdog for a turn that never terminates. Default `90 000`. |

Returns the live-turn state plus `{ live, send, stop, reset }`:

- `send(text)` rejects blank input and double-sends while a turn is
  pending/streaming (returns `false`); a rejected `transport.send`
  surfaces as a retryable `send_failed` error.
- `text` / `reasoning` are `null` until the first delta (the "nothing
  live yet" sentinel), then accumulate coalesced deltas.
- `interrupt` (HITL) pauses: status `interrupted`, payload in
  `interruptPayload`; the next delta resumes streaming.
- `stop()` flushes the partial text, marks `stopped` (late events are
  ignored), and calls `transport.stop()`.
- `reset()` returns to idle after the app refetched the persisted turn.

## liveTurnReducer

Pure `LiveTurnState` machine (fixture-testable, career-`chatFlow.ts`
role): actions `send` / `event` / `stop` / `reset`; terminal intake stops
on `done`, `error`, or user `stopped`.

## Branch-tree utilities

- `buildBranchTree({ activeRootId, nodes })` — index the server's
  `GET …/tree` projection; insertion order defines sibling order (last =
  newest).
- `linearTree(items)` — degenerate chain for linear backends.
- `walkActivePath(tree)` — pointer walk (`activeChildId`, newest-sibling
  fallback), cycle-safe.
- `variantInfo(tree, nodeId)` — `{ index, count, siblingIds }` for the
  `‹ n/N ›` switcher.

## example (realistic)

```tsx
const stream = useChatStream({
  transport: {
    send: ({ text }) => api.postChatMessage(sessionId, text),
    subscribe: ({ onEvent }) =>
      sse.subscribe(`chat:${sessionId}`, (e) => onEvent(mapToFamily(e))),
    stop: () => api.stopChatTurn(sessionId),
  },
})
```

## accessibility

Utility hook + pure functions — no rendered ARIA contract of their own;
render the live turn with the chat components (`chat-transcript` owns
`role="log"` announcements) and flow progress with
[`FlowStatusCard`](./flow-status.md#accessibility).

## related

[`chat-markdown`](./chat-markdown.md), [`chat-transcript`](./chat-transcript.md),
[`chat-branch-tree`](./chat-branch-tree.md), [`FlowStatusCard`](./flow-status.md),
[`useAiTextTransform`](./ai-text-transform.md).
