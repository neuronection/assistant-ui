import * as React from 'react'
import {
  Check,
  ClipboardCheck,
  Clock,
  TriangleAlert,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Spinner } from '../spinner/Spinner'
import { FieldDiff, type FieldDiffValue } from './FieldDiff'

export type HitlProposalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'conflict'
  | 'expired'

export interface HitlProposalCardLabels {
  approve: string
  reject: string
  /** Armed (second-click) label for destructive confirms. */
  confirm: string
  cancel: string
  /** Status words (chip + sr-only). */
  pending: string
  approved: string
  rejected: string
  conflict: string
  expired: string
  /** Hint under a conflict status. */
  conflictHint: string
}

const DEFAULT_LABELS: HitlProposalCardLabels = {
  approve: 'Approve',
  reject: 'Reject',
  confirm: 'Confirm delete',
  cancel: 'Cancel',
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  conflict: 'Changed since proposed',
  expired: 'Expired',
  conflictHint: 'The data changed — review the diff and ask again if still wanted.',
}

export interface HitlProposalCardProps {
  /** Card headline, e.g. "Update experience · Siemens internship". */
  title: string
  status: HitlProposalStatus
  /** Field-level before/after rows. */
  diff?: FieldDiffValue[]
  /** Destructive ops arm a two-step confirm before `onApprove` fires. */
  destructive?: boolean
  onApprove?: () => void
  onReject?: () => void
  /** Resolve in flight — disables the action buttons. */
  busy?: boolean
  /** Resolve error text (e.g. a failed apply). */
  error?: string
  labels?: Partial<HitlProposalCardLabels>
  icon?: LucideIcon
  className?: string
}

/**
 * Human-in-the-loop proposal card (family plan 77): a persisted mutation
 * the user resolves. Presentational + controlled — status is a prop,
 * approve/reject are events; the app owns transport and toasts.
 * Destructive ops require an armed second click (no modal dependency).
 */
export function HitlProposalCard({
  title,
  status,
  diff = [],
  destructive = false,
  onApprove,
  onReject,
  busy = false,
  error,
  labels,
  icon: Icon = ClipboardCheck,
  className,
}: HitlProposalCardProps) {
  const text = { ...DEFAULT_LABELS, ...labels }
  const [armed, setArmed] = React.useState(false)
  React.useEffect(() => {
    if (status !== 'pending') {
      setArmed(false)
    }
  }, [status])

  const approveLabel = destructive && armed ? text.confirm : text.approve
  const actionable = status === 'pending' && !busy

  const handleApprove = () => {
    if (destructive && !armed) {
      setArmed(true)
      return
    }
    onApprove?.()
  }

  const statusIcon =
    status === 'approved' ? (
      <Check className="size-3.5" aria-hidden />
    ) : status === 'rejected' ? (
      <X className="size-3.5" aria-hidden />
    ) : status === 'conflict' ? (
      <TriangleAlert className="size-3.5" aria-hidden />
    ) : status === 'expired' ? (
      <Clock className="size-3.5" aria-hidden />
    ) : null

  return (
    <div
      data-as="hitl-proposal-card"
      data-status={status}
      data-destructive={destructive || undefined}
      className={cn(
        'rounded-[var(--as-radius)] border bg-[var(--as-surface)] text-xs',
        status === 'conflict' || destructive
          ? 'border-[var(--as-warning)]'
          : 'border-[var(--as-border)]',
        className,
      )}
    >
      <div className="flex items-start gap-2 px-2.5 py-2">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[var(--as-fg)]">{title}</p>
          <p
            className={cn(
              'mt-0.5 flex items-center gap-1',
              status === 'approved' && 'text-[var(--as-success)]',
              status === 'rejected' && 'text-[var(--as-muted-fg)]',
              (status === 'conflict' || destructive) && status === 'pending' && 'text-[var(--as-warning)]',
              status === 'expired' && 'text-[var(--as-muted-fg)]',
              status === 'pending' && !destructive && 'text-[var(--as-muted-fg)]',
            )}
          >
            {statusIcon}
            <span>{text[status]}</span>
            {destructive && status === 'pending' ? (
              <TriangleAlert className="size-3" aria-hidden />
            ) : null}
          </p>
          {status === 'conflict' ? (
            <p className="mt-0.5 text-[var(--as-muted-fg)]">{text.conflictHint}</p>
          ) : null}
        </div>
      </div>

      {diff.length > 0 ? (
        <div className="flex flex-col gap-1.5 border-t border-[var(--as-border)] px-2.5 py-2">
          {diff.map((row) => (
            <FieldDiff key={row.field} row={row} />
          ))}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="border-t border-[var(--as-border)] px-2.5 py-1.5 text-[var(--as-danger)]">
          {error}
        </p>
      ) : null}

      {status === 'pending' ? (
        <div className="flex items-center gap-2 border-t border-[var(--as-border)] px-2.5 py-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={!actionable}
            data-hitl-action={armed ? 'confirm' : 'approve'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--as-radius)] px-2.5 py-1 font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
              destructive
                ? armed
                  ? 'bg-[var(--as-danger)] text-[var(--as-danger-fg)]'
                  : 'border border-[var(--as-danger)] text-[var(--as-danger)]'
                : 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]',
              !actionable && 'opacity-50',
            )}
          >
            {busy ? <Spinner size="sm" /> : null}
            {approveLabel}
          </button>
          {armed ? (
            <button
              type="button"
              onClick={() => setArmed(false)}
              disabled={!actionable}
              className="rounded-[var(--as-radius)] px-2.5 py-1 font-medium text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              {text.cancel}
            </button>
          ) : null}
          {onReject ? (
            <button
              type="button"
              onClick={() => onReject()}
              disabled={!actionable}
              className="ml-auto rounded-[var(--as-radius)] border border-[var(--as-border)] px-2.5 py-1 font-medium text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              {busy ? <Spinner size="sm" /> : null}
              {text.reject}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
