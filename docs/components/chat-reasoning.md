# ChatReasoning

Collapsible thinking block for reasoning models (study's `ReasoningBubble`
generalized): streams live while the model reasons (`delta
kind="reasoning"`), collapses to a summary row when done. Controlled-first
open state; persistence of the preference stays app-side.

## import

```ts
import { ChatReasoning } from '@neuronection/assistant-ui/chat-reasoning'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Accumulated reasoning text. |
| `streaming` | `boolean` | Spinner + `sr-only` streaming announcement. |
| `open` / `defaultOpen` / `onOpenChange` | | Controlled-first. Default open. |
| `labels` | `Partial<{ title; streaming }>` | Defaults "Thinking" / "Thinking…". |
| `icon` | `LucideIcon` | Default `Brain`. |

## accessibility

Toggle button carries `aria-expanded` + `aria-controls` into the region;
Enter/Space toggle; streaming state announced via `role="status"` on the
header. Keyboard toggle tested.

## related

[`chat-message`](./chat-message.md), [`chat-core`](./chat-core.md).
