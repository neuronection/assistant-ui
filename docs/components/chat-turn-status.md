# ChatTurnStatus

Live pre-text turn status (study's `TurnTraceStatus` + `ThinkingDots`,
generalized for family plan 12 L1): animated dots + the current phase
label, with an optional elapsed timer fed by the turn's start timestamp.
Presentational and controlled — the turn state lives in `useChatStream`;
this only narrates it. `variant="row"` is the inline pre-text line;
`variant="card"` is the soft surface block shown before any content
arrives.

## import

```ts
import { ChatTurnStatus } from '@neuronection/assistant-ui/chat-turn-status'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Current phase, e.g. "searching the catalog". |
| `startedAt` | `number` | Turn start (ms epoch). Presence enables the elapsed timer. |
| `variant` | `'row' \| 'card'` | Inline row (default) or soft surface block. |
| `tickMs` | `number` | Timer refresh interval, default `100`. |
| `labels` | `Partial<{ timer }>` | sr-only description for the elapsed readout. |
| `className` | `string` | Merged onto the root. |

## examples

```tsx
// Pre-text row while the turn grounds (label from stream.nodes).
<ChatTurnStatus
  label={stream.nodes.at(-1)?.label ?? 'thinking'}
  startedAt={stream.startedAt ?? undefined}
/>

// Soft block before any delta arrives.
{stream.text === null ? (
  <ChatTurnStatus label="thinking" variant="card" startedAt={stream.startedAt ?? undefined} />
) : null}
```

## accessibility

The root is a `role="status"` region named by the phase label; the dots
and the ticking readout are `aria-hidden` so the 100 ms updates never
re-announce. The optional `labels.timer` renders an sr-only description
of the elapsed readout. Dots are disabled under
`prefers-reduced-motion: reduce`.

## related

[`chat-tool-card`](./chat-tool-card.md), [`chat-core`](./chat-core.md),
[`chat-message`](./chat-message.md).
