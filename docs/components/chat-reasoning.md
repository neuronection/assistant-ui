# ChatReasoning

Collapsible thinking block for reasoning models (study's `ReasoningBubble`
generalized): streams live while the model reasons (`delta
kind="reasoning"`), with a `--as-ai` accent edge while streaming, and
collapses to a summary row when the stream ends — through an animated
height reveal (`prefers-reduced-motion` safe). Controlled-first open
state; persistence of the preference stays app-side.

## import

```ts
import { ChatReasoning } from '@neuronection/assistant-ui/chat-reasoning'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Accumulated reasoning text. |
| `streaming` | `boolean` | Spinner + `sr-only` streaming announcement + `--as-ai` edge. |
| `open` / `defaultOpen` / `onOpenChange` | | Controlled-first. Default open. |
| `autoCollapse` | `boolean` | Collapse when `streaming` turns true → false. Uncontrolled mode only; default `true`. A controlled `open` is never auto-collapsed. |
| `labels` | `Partial<{ title; streaming }>` | Defaults "Thinking" / "Thinking…". |
| `icon` | `LucideIcon` | Default `Brain`. |

The expand/collapse animates via the shared `.as-collapse` grid reveal
(`--as-duration-slow`, `--as-ease-out`); collapsed content leaves the
accessibility tree after the transition. Both are disabled under
`prefers-reduced-motion: reduce` (state stays instant and legible).

## examples

```tsx
// Live turn: streams with the accent edge, folds itself when done.
<ChatReasoning text={stream.reasoning ?? ''} streaming={stream.reasoning !== null} />

// Persisted message: stays open unless the user folds it.
<ChatReasoning text={message.reasoning} defaultOpen={false} />
```

## accessibility

Toggle button carries `aria-expanded` + `aria-controls` into the region;
Enter/Space toggle; streaming state announced via `role="status"` on the
header. Collapsed content is `visibility: hidden` — out of the tab order
and the a11y tree. Keyboard toggle, auto-collapse and the hidden-when-
closed contract are tested; axe clean open, closed and streaming.

## related

[`chat-message`](./chat-message.md), [`chat-core`](./chat-core.md),
[`chat-pending`](./chat-pending.md).
