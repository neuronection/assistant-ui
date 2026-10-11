# ChatToolCard

Inline tool-call observation (study's `ToolCallCard` + health's tool chips,
generalized): name/title, status (running spinner with the `--as-ai`
edge / animated done check-draw / failed warning), duration, expandable
args and result panes behind an animated height reveal. A static row
when there is nothing to expand. Health's inspector/modal stays
app-side.

## import

```ts
import { ChatToolCard } from '@neuronection/assistant-ui/chat-tool-card'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Tool identifier (rendered mono beside the title). |
| `title` | `string` | Human title. |
| `status` | `'running' \| 'done' \| 'failed'` | `running` carries the `--as-ai` edge; the running → `done` transition crossfades into a stroke-drawn check. |
| `args` / `result` | `string` | Serialized payloads (preformatted, scrollable; JSON is pretty-printed 2-space across lines — see `prettyJson`). |
| `renderResult` | `(result: string) => ReactNode` | Custom result view; called even when `result` is empty (state-only tools). Absent → default `<pre>` pane. |
| `durationMs` | `number` | Formatted as ms / s. |
| `open` / `defaultOpen` / `onOpenChange` | | Expand state, controlled-first. The reveal animates via `.as-collapse` (`--as-duration-slow`), instant under reduced motion. |
| `labels` | `Partial<ChatToolCardLabels>` | running/done/failed/args/result. |
| `icon` | `LucideIcon` | Default `Wrench`. |

## accessibility

Expandable header is a real button (`aria-expanded` + `aria-controls`);
status carries `role="status"` while running and an `sr-only` label
otherwise; Enter/Space expand tested; static rows expose no dead
controls. Collapsed panes are `visibility: hidden` — out of the tab
order and the a11y tree after the reveal transition. `renderResult`
content is app markup — keep it text-legible and avoid nested
interactive elements inside the collapsible region.

## related

[`chat-message`](./chat-message.md), [`chat-turn-status`](./chat-turn-status.md),
[`chat-pending`](./chat-pending.md), [`FlowStatusCard`](./flow-status.md).
