# ChatTraceTimeline

Collapsible per-turn trace timeline (study's `TraceTimeline`,
generalized): collapsed summary — total duration · tool count · model —
expanding to duration-proportional bar rows for flow phases (`phase`)
and tool calls (`tool`), a total/token row, and a raw-reasoning
disclosure. Presentational: persisted or live trace data is mapped to
`entries` app-side (labels are translated at the call site too).

## import

```ts
import { ChatTraceTimeline } from '@neuronection/assistant-ui/chat-trace-timeline'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `trace` | `ChatTraceTimelineTrace` | `model?`, `latencyMs?` (bar scale), `inputTokens?`, `outputTokens?`, `thinking?` (reasoning disclosure). |
| `entries` | `ChatTraceTimelineEntry[]` | `{ kind: 'phase' \| 'tool', label, detail?, startMs?, durationMs?, status?, args?, response? }` — sorted by `startMs` for rendering. `status` (`'ok' \| 'error'`) renders a status dot on the row; `args`/`response` (pretty-printed strings) feed the row's expandable detail blocks. |
| `defaultOpen` | `boolean` | Expand initially (default `false`). |
| `labels` | `Partial<ChatTraceTimelineLabels>` | toggle/tools/total/tokens/reasoning/arguments/response/details (English defaults). |
| `className` | `string` | Extra classes. |

## controlled contract

Uncontrolled: open state is local, seeded by `defaultOpen`; the nested
reasoning disclosure manages its own state. There is no `onOpenChange`
— apps needing a controlled trace view should compose their own from
the timeline row pattern instead.

## label / i18n contract

`labels` covers the static words (`toggle`, `tools`, `total`, `tokens`,
`reasoning`, `arguments`, `response`, `details`); the numeric summary
(`2.0 s · 3 tools`) is composed from data. Entry labels, argument and
response payloads are data — translate phases when building `entries`.

## tool observability

`tool` rows carry execution evidence: `status` renders a success/error
dot after the duration, and `args`/`response` (JSON strings —
`JSON.stringify(args, null, 2)` app-side) enable a per-row detail
region (`chat-trace-detail` with `data-open`) rendering modern
key-value rows — JSON objects are parsed into `key: value` pairs, JSON
arrays render as a pretty-printed 2-space indent block (`prettyJson`),
other content renders as plain text. The region opens by clicking **the tool
name** (the label becomes a labelled button) or the row chevron
(`chat-trace-detail-toggle`), accessible name
`"<tool label> <labels.details>"`. Rows without any of those fields
keep the plain layout.

## snippets

```tsx
import { ChatTraceTimeline } from '@neuronection/assistant-ui/chat-trace-timeline'
import type { ChatMessage } from './types'

function ReplyTrace({ message }: { message: ChatMessage }) {
  const meta = message.metadata_json
  if (!meta?.tools?.length && !meta?.nodes?.length) return null
  return (
    <ChatTraceTimeline
      trace={{ model: meta.model, latencyMs: meta.elapsed_ms, outputTokens: meta.tokens_out }}
      entries={[
        ...(meta.nodes ?? []).map((node) => ({
          kind: 'phase' as const, label: node.label ?? node.id,
          startMs: node.start_ms, durationMs: node.duration_ms,
        })),
        ...meta.tools.map((tool) => ({
          kind: 'tool' as const, label: tool.name, detail: tool.args_summary,
          startMs: tool.start_ms, durationMs: tool.duration_ms,
        })),
      ]}
    />
  )
}
```

```tsx
<ChatTraceTimeline trace={{ latencyMs: 640 }} entries={[]} />
```

## accessibility

Toggle and reasoning header are real buttons with `aria-expanded` (the
toggle also carries an accessible name); bars are decorative. Clean
under jest-axe collapsed and expanded.

## related

[`chat-tool-card`](./chat-tool-card.md) (per-call observation cards),
[`chat-trace-meta`](./chat-trace-meta.md) (always-on badges),
[`chat-turn-status`](./chat-turn-status.md) (live phase narration).
