import * as React from 'react'

import { cn } from '../../lib/utils'

export interface ChatTurnStatusLabels {
  timer: string
}

export interface ChatTurnStatusProps {
  /** Current turn phase, e.g. "searching the catalog". */
  label: string
  /** Turn start timestamp (ms). Presence enables the elapsed timer. */
  startedAt?: number
  /** `row` = inline pre-text line; `card` = soft surface block. */
  variant?: 'row' | 'card'
  /** Elapsed-timer refresh interval. Default 100 ms (study-proven). */
  tickMs?: number
  labels?: Partial<ChatTurnStatusLabels>
  className?: string
}

function formatElapsed(ms: number): string {
  if (ms < 1000) {
    return `${Math.max(0, Math.round(ms))} ms`
  }
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`
}

/**
 * Live pre-text turn status (study's `TurnTraceStatus` + `ThinkingDots`,
 * generalized for family plan 12 L1): animated dots + phase label, with
 * an optional elapsed timer. Presentational and controlled — the turn
 * state itself lives in `useChatStream`; this only narrates it.
 */
export const ChatTurnStatus = React.forwardRef<HTMLDivElement, ChatTurnStatusProps>(
  function ChatTurnStatus(
    { label, startedAt, variant = 'row', tickMs = 100, labels, className },
    ref,
  ) {
    const [now, setNow] = React.useState(() => Date.now())

    React.useEffect(() => {
      if (startedAt === undefined) {
        return
      }
      setNow(Date.now())
      const id = window.setInterval(() => setNow(Date.now()), tickMs)
      return () => window.clearInterval(id)
    }, [startedAt, tickMs])

    const elapsed = startedAt === undefined ? null : Math.max(0, now - startedAt)

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        data-as="chat-turn-status"
        data-variant={variant}
        className={cn(
          'flex items-center gap-2 text-[var(--as-muted-fg)]',
          variant === 'card' &&
            'rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] px-3 py-2.5',
          variant === 'row' && 'px-1 py-0.5',
          className,
        )}
      >
        <span aria-hidden className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="as-dot size-1.5 rounded-full bg-[var(--as-muted-fg)]"
              style={{ animationDelay: `${index * 0.16}s` }}
            />
          ))}
        </span>
        <span className="text-xs">{label}</span>
        {elapsed !== null ? (
          <span aria-hidden className="font-mono text-[10px] tabular-nums">
            {formatElapsed(elapsed)}
          </span>
        ) : null}
        {labels?.timer ? <span className="sr-only">{labels.timer}</span> : null}
      </div>
    )
  },
)
