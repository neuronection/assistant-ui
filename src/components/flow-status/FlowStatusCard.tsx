import * as React from 'react'
import { Check, CircleDashed, PauseCircle, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Spinner } from '../spinner/Spinner'
import { Button } from '../button/Button'

export type FlowStepStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'failed'
  | 'interrupted'

export interface FlowStep {
  id: string
  label: string
  status: FlowStepStatus
}

export interface FlowError {
  code: string
  message: string
  retryable: boolean
}

export interface FlowStatusCardProps {
  /** Flow name, e.g. "Analyzing document". */
  title: string
  /** Ordered steps, one per graph node. */
  steps: FlowStep[]
  /** Overall run status. */
  status: FlowStepStatus
  /** Set when `status === 'failed'`. */
  error?: FlowError
  /** Rendered only when `error?.retryable`. */
  onRetry?: () => void
  /** Rendered while `status === 'running'`. */
  onCancel?: () => void
  /** Rendered when `status === 'interrupted'`. */
  onResume?: () => void
  /** Payload slot: HITL card, references, extra info. */
  detail?: React.ReactNode
  /** Plain strings, i18n at call sites. */
  labels?: Partial<Record<'retry' | 'cancel' | 'resume', string>>
  className?: string
}

const stepIcons: Record<
  FlowStepStatus,
  { icon: LucideIcon | null; tone: string }
> = {
  pending: { icon: CircleDashed, tone: 'text-[var(--as-muted-fg)]' },
  running: { icon: null, tone: 'text-[var(--as-primary)]' },
  done: { icon: Check, tone: 'text-[var(--as-success)]' },
  failed: { icon: TriangleAlert, tone: 'text-[var(--as-danger)]' },
  interrupted: { icon: PauseCircle, tone: 'text-[var(--as-warning)]' },
}

export const FlowStatusCard = React.forwardRef<
  HTMLDivElement,
  FlowStatusCardProps
>(function FlowStatusCard(
  {
    title,
    steps,
    status,
    error,
    onRetry,
    onCancel,
    onResume,
    detail,
    labels,
    className,
  },
  ref,
) {
  const completed = steps.filter((step) => step.status === 'done').length
  const current = steps.find((step) => step.status === 'running')
  const currentNumber = steps.findIndex((step) => step.id === current?.id) + 1
  const progress =
    steps.length > 0
      ? `${status === 'running' ? currentNumber : completed}/${steps.length}`
      : null
  const overall = stepIcons[status]

  const showRetry = Boolean(onRetry && error?.retryable)
  const showCancel = Boolean(onCancel && status === 'running')
  const showResume = Boolean(onResume && status === 'interrupted')

  return (
    <div
      ref={ref}
      data-as="flow-status-card"
      data-status={status}
      className={cn(
        'flex w-full flex-col gap-3 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--as-fg)]">{title}</p>
        <span
          role="status"
          className={cn(
            'flex shrink-0 items-center gap-1.5 text-xs',
            overall.tone,
          )}
        >
          {status === 'running' ? (
            <Spinner size="sm" className="text-[var(--as-primary)]" />
          ) : (
            overall.icon && <overall.icon className="size-3.5" aria-hidden />
          )}
          {progress ? <span className="tabular-nums">{progress}</span> : null}
        </span>
      </div>
      {status === 'running' && current ? (
        <p className="text-xs text-[var(--as-muted-fg)]">{current.label}</p>
      ) : null}
      {steps.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {steps.map((step) => {
            const stepIcon = stepIcons[step.status]
            return (
              <li
                key={step.id}
                data-status={step.status}
                aria-current={
                  step.status === 'running' && status === 'running'
                    ? 'step'
                    : undefined
                }
                className="flex items-center gap-2.5"
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center',
                    stepIcon.tone,
                  )}
                >
                  {step.status === 'running' ? (
                    <Spinner size="sm" className="text-[var(--as-primary)]" />
                  ) : (
                    stepIcon.icon && (
                      <stepIcon.icon className="size-4" aria-hidden />
                    )
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    step.status === 'running'
                      ? 'font-medium text-[var(--as-fg)]'
                      : 'text-[var(--as-muted-fg)]',
                  )}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}
      {status === 'failed' && error ? (
        <div
          role="alert"
          data-as="flow-status-card-error"
          className="flex flex-col gap-1 rounded-[var(--as-radius)] border border-[var(--as-danger)]/40 bg-[var(--as-danger)]/10 px-3 py-2 text-xs text-[var(--as-danger)]"
        >
          <span className="font-mono font-semibold uppercase tracking-wide">
            {error.code}
          </span>
          <span className="whitespace-pre-wrap break-words">
            {error.message}
          </span>
        </div>
      ) : null}
      {detail ? <div>{detail}</div> : null}
      {showRetry || showCancel || showResume ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showCancel ? (
            <Button variant="outline" size="sm" onClick={onCancel}>
              {labels?.cancel ?? 'Cancel'}
            </Button>
          ) : null}
          {showResume ? (
            <Button size="sm" onClick={onResume}>
              {labels?.resume ?? 'Resume'}
            </Button>
          ) : null}
          {showRetry ? (
            <Button size="sm" onClick={onRetry}>
              {labels?.retry ?? 'Retry'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})
