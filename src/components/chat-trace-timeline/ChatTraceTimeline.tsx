import * as React from 'react'
import { Brain, ChevronDown, ChevronRight, Timer } from 'lucide-react'

import { cn } from '../../lib/utils'
import { DetailValue } from '../detail-value/DetailValue'

export interface ChatTraceTimelineEntry {
  /** `phase` = model/flow round (primary bar); `tool` = tool call (warning bar). */
  kind: 'phase' | 'tool'
  /** Phase label or tool name (translated at the call site). */
  label: string
  /** Secondary detail, e.g. the tool arguments summary (title tooltip). */
  detail?: string | null
  startMs?: number | null
  durationMs?: number | null
  /** Outcome of a tool execution (`tool` rows); renders a status dot. */
  status?: 'ok' | 'error' | null
  /** Pretty-printed call arguments (expandable block on `tool` rows). */
  args?: string | null
  /** Tool response text (expandable block on `tool` rows). */
  response?: string | null
}

export interface ChatTraceTimelineTrace {
  model?: string | null
  /** Total turn latency the bars are proportional to. */
  latencyMs?: number | null
  inputTokens?: number | null
  outputTokens?: number | null
  /** Raw model reasoning, shown in a nested disclosure. */
  thinking?: string | null
}

export interface ChatTraceTimelineLabels {
  /** Accessible name of the toggle (summary is composed from data). */
  toggle: string
  /** Word appended to the tool count, e.g. `tools`. */
  tools: string
  /** Prefix of the expanded total row, e.g. `Total`. */
  total: string
  /** Suffix of the token count, e.g. `tokens`. */
  tokens: string
  reasoning: string
  /** Header of the expandable arguments block. */
  arguments: string
  /** Header of the expandable response block. */
  response: string
  /** Accessible name of a tool row's detail disclosure. */
  details: string
}

export interface ChatTraceTimelineProps {
  trace: ChatTraceTimelineTrace
  entries: ChatTraceTimelineEntry[]
  defaultOpen?: boolean
  labels?: Partial<ChatTraceTimelineLabels>
  className?: string
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  return `${(ms / 1000).toFixed(1)} s`
}

/**
 * Collapsible per-turn trace timeline (study's `TraceTimeline`,
 * generalized): collapsed summary (duration · N tools · model), expanded
 * duration-proportional bar rows for flow phases and tool calls plus a
 * raw-reasoning disclosure. Presentational — persisted or live trace data
 * is mapped to `entries` app-side.
 */
export const ChatTraceTimeline = React.forwardRef<HTMLDivElement, ChatTraceTimelineProps>(
  function ChatTraceTimeline(
    { trace, entries, defaultOpen = false, labels, className },
    ref,
  ) {
    const [open, setOpen] = React.useState(defaultOpen)
    const totalMs = Math.max(1, trace.latencyMs ?? 0)
    const duration = formatDuration(trace.latencyMs ?? 0)
    const toolsLabel = labels?.tools ?? 'tools'
    const toolCount = entries.filter((entry) => entry.kind === 'tool').length
    const items = [...entries].sort(
      (a, b) => (a.startMs ?? 0) - (b.startMs ?? 0),
    )

    return (
      <div
        ref={ref}
        data-as="chat-trace-timeline"
        className={cn('w-full max-w-[92%]', className)}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={labels?.toggle ?? 'Show response trace'}
          className="flex items-center gap-1.5 text-[11px] text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <Timer className="size-3.5 shrink-0" aria-hidden />
          <span>
            {`${duration} · ${toolCount} ${toolsLabel}`}
          </span>
          {trace.model ? (
            <span className="font-mono text-[10px]">· {trace.model}</span>
          ) : null}
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 transition-transform duration-150',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
        {open ? (
          <div className="mt-2 flex flex-col gap-1.5 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-[var(--as-muted-fg)]">
              <span>{`${labels?.total ?? 'Total'} ${duration}`}</span>
              <span>
                {`${trace.outputTokens ?? 0} ${labels?.tokens ?? 'tokens'}`}
              </span>
            </div>
            {items.map((item, index) => (
              <TraceRow key={`${item.kind}-${index}`} item={item} totalMs={totalMs} labels={labels} />
            ))}
            {trace.thinking ? (
              <ThinkingDisclosure
                thinking={trace.thinking}
                label={labels?.reasoning ?? 'Reasoning'}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    )
  },
)

function TraceRow({
  item,
  totalMs,
  labels,
}: {
  item: ChatTraceTimelineEntry
  totalMs: number
  labels?: Partial<ChatTraceTimelineLabels>
}) {
  const [open, setOpen] = React.useState(false)
  const regionId = React.useId()
  const expandable = Boolean(item.args || item.response)
  const width = Math.max(2, Math.min(100, ((item.durationMs ?? 0) / totalMs) * 100))
  return (
    <div data-kind={item.kind} data-status={item.status ?? undefined}>
      <div className="flex items-center gap-2 text-[11px]">
        {expandable ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={regionId}
            title={item.detail ?? undefined}
            className="w-24 shrink-0 truncate text-left text-[11px] text-[var(--as-fg)] transition-colors hover:text-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            onClick={() => setOpen((value) => !value)}
          >
            {item.label}
          </button>
        ) : (
          <span
            className="w-24 shrink-0 truncate text-[var(--as-muted-fg)]"
            title={item.detail ?? undefined}
          >
            {item.label}
          </span>
        )}
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--as-surface-raised)]">
          <div
            className={cn(
              'h-full rounded-full',
              item.kind === 'phase'
                ? 'bg-[var(--as-primary)]'
                : 'bg-[var(--as-warning)]',
            )}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="w-12 shrink-0 text-right font-mono text-[10px] text-[var(--as-muted-fg)]">
          {formatDuration(item.durationMs ?? 0)}
        </span>
        {item.status ? (
          <span
            data-as="chat-trace-status"
            title={item.status}
            className={cn(
              'size-2 shrink-0 rounded-full',
              item.status === 'error'
                ? 'bg-[var(--as-danger)]'
                : 'bg-[var(--as-success)]',
            )}
          />
        ) : (
          <span className="size-2 shrink-0" />
        )}
        {expandable ? (
          <button
            type="button"
            data-as="chat-trace-detail-toggle"
            aria-expanded={open}
            aria-controls={regionId}
            aria-label={`${item.label} ${labels?.details ?? 'details'}`}
            onClick={() => setOpen((value) => !value)}
            className="flex size-5 shrink-0 items-center justify-center rounded text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
          >
            {open ? (
              <ChevronDown className="size-3" aria-hidden />
            ) : (
              <ChevronRight className="size-3" aria-hidden />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
      </div>
      {expandable && open ? (
        <div
          id={regionId}
          data-as="chat-trace-detail"
          data-open="true"
          className="mb-1.5 ml-[6.5rem] border-l border-[var(--as-border)] pl-2"
        >
          {item.args ? (
            <DetailBlock label={labels?.arguments ?? 'Arguments'} text={item.args} />
          ) : null}
          {item.response ? (
            <DetailBlock label={labels?.response ?? 'Response'} text={item.response} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function DetailBlock({
  label,
  text,
}: {
  label: string
  text: string
}) {
  return (
    <div className="pt-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
        {label}
      </p>
      <DetailValue text={text} />
    </div>
  )
}

function ThinkingDisclosure({
  thinking,
  label,
}: {
  thinking: string
  label: string
}) {
  const [open, setOpen] = React.useState(false)
  const regionId = React.useId()
  return (
    <div className="rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={regionId}
        className="flex w-full items-center gap-1.5 rounded-[var(--as-radius)] px-2 py-1.5 text-left text-[11px] text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
      >
        <Brain className="size-3.5 shrink-0" aria-hidden />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 transition-transform duration-150',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <p
          id={regionId}
          className="whitespace-pre-wrap px-2.5 pb-2 text-[11px] text-[var(--as-muted-fg)]"
        >
          {thinking}
        </p>
      ) : null}
    </div>
  )
}
