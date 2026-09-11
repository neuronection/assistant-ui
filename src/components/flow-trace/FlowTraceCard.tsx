import * as React from 'react'
import { CircleDot, ListChecks, PhoneCall } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface FlowTraceStage {
  /** Stage label, app-localized. */
  label: string
  /** Stage note, e.g. the progress step the runner reported. */
  note?: string | null
  /** ISO timestamp of the stage event. */
  at?: string | null
}

export interface FlowTraceCall {
  /** Stable id of the audited call. */
  id: string
  /** Canonical task key, e.g. `cv_draft` (visible; app-localizes). */
  task: string
  /** Optional display label overriding the raw task key. */
  label?: string | null
  /** Stage the call served, e.g. `cv_draft.draft`. */
  stage?: string | null
  status?: 'ok' | 'error' | null
  /** Provider id — apps badge `mock` rows as simulated. */
  provider?: string | null
  model?: string | null
  promptVersion?: string | null
  tokensIn?: number | null
  tokensOut?: number | null
  latencyMs?: number | null
}

export interface FlowTraceToolOp {
  /** Op label, app-localized. */
  label: string
  /** Whether the op applied (✓) or was rejected (✗). */
  ok: boolean
  detail?: string | null
}

/**
 * Library-owned trace schema (plan 65.4): the app maps its run ledger
 * onto this shape — the card performs zero app data joins.
 */
export interface FlowTrace {
  stages: FlowTraceStage[]
  llmCalls: FlowTraceCall[]
  toolOps?: FlowTraceToolOp[]
  /** Canonical outcome, e.g. `completed` | `cap` | `failed` | `cancelled`. */
  outcome?: string | null
  /** Outcome display label overriding the canonical value. */
  outcomeLabel?: string | null
  /** True while rows ride the mock provider — surfaces the simulated badge. */
  simulated?: boolean
}

export interface FlowTraceCardLabels {
  /** Card heading, e.g. "Run trace". */
  title: string
  stages: string
  calls: string
  ops: string
  outcome: string
  simulated: string
  tokens: string
  latency: string
  model: string
  status: string
  prompt: string
  task: string
}

export interface FlowTraceCardProps {
  trace: FlowTrace
  labels?: Partial<FlowTraceCardLabels>
  className?: string
}


export function formatFlowLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) {
    return '—'
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  return `${(ms / 1000).toFixed(1)} s`
}

export const FlowTraceCard = React.forwardRef<HTMLDivElement, FlowTraceCardProps>(
  function FlowTraceCard({ trace, labels, className }, ref) {
    const title = labels?.title ?? 'Run trace'
    const hasStages = trace.stages.length > 0
    const hasCalls = trace.llmCalls.length > 0
    const hasOps = Boolean(trace.toolOps && trace.toolOps.length > 0)
    if (!hasStages && !hasCalls && !hasOps) {
      return null
    }
    return (
      <div
        ref={ref}
        data-as="flow-trace-card"
        data-outcome={trace.outcome ?? undefined}
        data-simulated={trace.simulated ? 'true' : undefined}
        className={cn(
          'flex w-full flex-col gap-3 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-4 text-xs',
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--as-fg)]">{title}</p>
          <div className="flex items-center gap-1.5" data-as="flow-trace-outcome">
            {trace.outcomeLabel ?? trace.outcome ? (
              <span
                data-as="flow-trace-outcome-badge"
                data-outcome={trace.outcome ?? undefined}
                className="rounded-full bg-[var(--as-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--as-muted-fg)]"
              >
                {trace.outcomeLabel ?? trace.outcome}
              </span>
            ) : null}
            {trace.simulated ? (
              <span
                data-as="flow-trace-simulated-badge"
                title={labels?.simulated ?? 'Simulated'}
                className="rounded-full bg-[var(--as-warning)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--as-warning)]"
              >
                {labels?.simulated ?? 'Simulated'}
              </span>
            ) : null}
          </div>
        </div>
        {hasStages ? (
          <section data-as="flow-trace-stages">
            <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
              <CircleDot className="size-3" aria-hidden />
              {labels?.stages ?? 'Stages'}
            </h4>
            <ol className="flex flex-col gap-0.5">
              {trace.stages.map((stage, index) => (
                <li
                  key={`${stage.label}-${index}`}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-[var(--as-fg)]">
                    {stage.label}
                  </span>
                  {stage.note ? (
                    <span
                      className="min-w-0 flex-1 truncate text-[var(--as-muted-fg)]"
                      title={stage.note}
                    >
                      {stage.note}
                    </span>
                  ) : null}
                  {stage.at ? (
                    <time
                      dateTime={stage.at}
                      className="ml-auto shrink-0 font-mono text-[10px] text-[var(--as-muted-fg)]"
                    >
                      {new Date(stage.at).toLocaleTimeString()}
                    </time>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {hasCalls ? (
          <section data-as="flow-trace-calls">
            <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
              <PhoneCall className="size-3" aria-hidden />
              {labels?.calls ?? 'LLM calls'}
            </h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-[var(--as-muted-fg)]">
                  <th scope="col" className="py-0.5 font-semibold">
                    {labels?.task ?? 'Task'}
                  </th>
                  <th scope="col" className="py-0.5 font-semibold">
                    {labels?.model ?? 'Model'}
                  </th>
                  <th scope="col" className="py-0.5 text-right font-semibold">
                    {labels?.tokens ?? 'Tokens'}
                  </th>
                  <th scope="col" className="py-0.5 text-right font-semibold">
                    {labels?.latency ?? 'Latency'}
                  </th>
                  <th scope="col" className="px-1 py-0.5 text-center font-semibold">
                    {labels?.status ?? 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {trace.llmCalls.map((call) => (
                  <tr
                    key={call.id}
                    data-status={call.status ?? 'ok'}
                    data-simulated={call.provider === 'mock' ? 'true' : undefined}
                    className="border-t border-[var(--as-border)] text-[var(--as-fg)]"
                  >
                    <td className="py-1 pr-2">
                      <span>{call.label ?? call.task}</span>
                      {call.provider === 'mock' ? (
                        <span className="ml-1 rounded bg-[var(--as-muted)] px-1 py-px font-mono text-[9px] text-[var(--as-muted-fg)]">
                          mock
                        </span>
                      ) : null}
                    </td>
                    <td className="py-1 pr-2 font-mono text-[10px] text-[var(--as-muted-fg)]">
                      {call.model ?? '—'}
                      {call.promptVersion ? (
                        <span className="ml-1 text-[9px]">{call.promptVersion}</span>
                      ) : null}
                    </td>
                    <td className="py-1 text-right tabular-nums text-[var(--as-muted-fg)]">
                      {(call.tokensIn ?? 0)}/{(call.tokensOut ?? 0)}
                    </td>
                    <td className="py-1 text-right tabular-nums text-[var(--as-muted-fg)]">
                      {formatFlowLatency(call.latencyMs)}
                    </td>
                    <td className="px-1 py-1 text-center">
                      <span
                        data-as="flow-trace-status"
                        title={call.status ?? 'ok'}
                        className={cn(
                          'inline-block size-2 rounded-full',
                          call.status === 'error'
                            ? 'bg-[var(--as-danger)]'
                            : 'bg-[var(--as-success)]',
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
        {trace.toolOps && trace.toolOps.length > 0 ? (
          <section data-as="flow-trace-ops">
            <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
              <ListChecks className="size-3" aria-hidden />
              {labels?.ops ?? 'Operations'}
            </h4>
            <ul className="flex flex-col gap-0.5">
              {trace.toolOps.map((op, index) => (
                <li key={`${op.label}-${index}`} data-ok={op.ok} className="flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0 font-mono',
                      op.ok
                        ? 'text-[var(--as-success)]'
                        : 'text-[var(--as-danger)]',
                    )}
                  >
                    {op.ok ? '✓' : '✗'}
                  </span>
                  <span className="text-[var(--as-fg)]">{op.label}</span>
                  {op.detail ? (
                    <span
                      className="min-w-0 flex-1 truncate text-[var(--as-muted-fg)]"
                      title={op.detail}
                      aria-label={`${op.label}: ${op.detail}`}
                    >
                      {op.detail}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    )
  },
)

export interface FlowTelemetryStripProps {
  /** Calls made so far in the run. */
  calls?: number | null
  /** Input tokens so far. */
  tokensIn?: number | null
  /** Output tokens so far. */
  tokensOut?: number | null
  /** Applied edits so far. */
  edits?: number | null
  /** Token/simulated badge visibility (mock rows stay honest). */
  simulated?: boolean
  labels?: Partial<
    Record<'calls' | 'tokensIn' | 'tokensOut' | 'edits' | 'simulated', string>
  >
  className?: string
}

export const FlowTelemetryStrip = React.forwardRef<
  HTMLDivElement,
  FlowTelemetryStripProps
>(function FlowTelemetryStrip(
  { calls, tokensIn, tokensOut, edits, simulated, labels, className },
  ref,
) {
  const parts: string[] = []
  if (calls !== null && calls !== undefined) {
    parts.push(`${calls} ${labels?.calls ?? 'call(s)'}`)
  }
  if (tokensIn !== null && tokensIn !== undefined) {
    parts.push(`${tokensIn} ${labels?.tokensIn ?? 'tokens in'}`)
  }
  if (tokensOut !== null && tokensOut !== undefined) {
    parts.push(`${tokensOut} ${labels?.tokensOut ?? 'tokens out'}`)
  }
  if (edits !== null && edits !== undefined) {
    parts.push(`${edits} ${labels?.edits ?? 'edits'}`)
  }
  if (parts.length === 0 && !simulated) {
    return null
  }
  return (
    <div
      ref={ref}
      data-as="flow-telemetry-strip"
      data-simulated={simulated ? 'true' : undefined}
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tabular-nums text-[var(--as-muted-fg)]',
        className,
      )}
    >
      {parts.map((part) => (
        <span key={part}>{part}</span>
      ))}
      {simulated ? (
        <span
          data-as="flow-telemetry-simulated"
          title={labels?.simulated ?? 'Simulated — no real spend'}
          className="rounded bg-[var(--as-warning)]/15 px-1 py-px font-sans font-medium text-[var(--as-warning)]"
        >
          {labels?.simulated ?? 'Simulated'}
        </span>
      ) : null}
    </div>
  )
})
