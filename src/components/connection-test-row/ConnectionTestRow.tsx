import * as React from 'react'
import { Check, TriangleAlert, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Spinner } from '../spinner/Spinner'

export type ConnectionTestStatus = 'idle' | 'testing' | 'ok' | 'fail'

export interface ConnectionTestRowProps {
  status: ConnectionTestStatus
  latencyMs?: number | null
  label?: string
  testLabel?: string
  okLabel?: string
  failLabel?: string
  latencyLabel?: string
  errorMessage?: string | null
  onTest?: () => void
  disabled?: boolean
  className?: string
}

/**
 * Presentational connection-test row (idle/testing/ok/fail + latency).
 * The actual ping is app-side: flip `status` from the test handler.
 */
export const ConnectionTestRow = React.forwardRef<
  HTMLDivElement,
  ConnectionTestRowProps
>(function ConnectionTestRow(
  {
    status,
    latencyMs,
    label = 'Connection',
    testLabel = 'Test',
    okLabel = 'Connected',
    failLabel = 'Failed',
    latencyLabel = 'ms',
    errorMessage,
    onTest,
    disabled = false,
    className,
  },
  ref,
) {
  const state =
    status === 'ok'
      ? { text: okLabel, icon: <Check className="size-3.5" aria-hidden />, tone: 'text-[var(--as-success)]' }
      : status === 'fail'
        ? {
            text: failLabel,
            icon: <TriangleAlert className="size-3.5" aria-hidden />,
            tone: 'text-[var(--as-danger)]',
          }
        : null

  return (
    <div
      ref={ref}
      data-as="connection-test-row"
      data-status={status}
      className={cn(
        'flex items-center justify-between gap-3 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="font-medium text-[var(--as-fg)]">{label}</span>
        {status === 'testing' ? (
          <span className="flex items-center gap-1.5 text-[var(--as-muted-fg)]" role="status">
            <Spinner size="sm" />
            {testLabel}…
          </span>
        ) : state ? (
          <span className={cn('flex items-center gap-1 font-medium', state.tone)}>
            {state.icon}
            {state.text}
            {status === 'ok' && latencyMs != null ? (
              <span className="font-normal text-[var(--as-muted-fg)]">
                · {latencyMs}
                {latencyLabel}
              </span>
            ) : null}
          </span>
        ) : null}
        {status === 'fail' && errorMessage ? (
          <span className="truncate text-xs text-[var(--as-danger)]">
            {errorMessage}
          </span>
        ) : null}
      </div>
      {onTest ? (
        <button
          type="button"
          onClick={onTest}
          disabled={disabled || status === 'testing'}
          className="shrink-0 cursor-pointer rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2.5 py-1 text-xs font-medium text-[var(--as-fg)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50"
        >
          {status === 'fail' ? <X className="mr-1 inline size-3" aria-hidden /> : null}
          {testLabel}
        </button>
      ) : null}
    </div>
  )
})
