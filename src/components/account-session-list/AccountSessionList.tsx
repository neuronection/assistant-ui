import * as React from 'react'

import { cn } from '../../lib/utils'

export interface AccountSessionRow {
  id: string
  current?: boolean
  label: string
  details: string[]
  icon?: React.ReactNode
  badges?: React.ReactNode
  revoked?: boolean
  revocable?: boolean
}

export interface AccountSessionListLabels {
  current: string
  revoke: string
  revoking: string
  revoked?: string
  empty?: string
}

export interface AccountSessionListProps {
  rows: AccountSessionRow[]
  onRevoke: (id: string) => void
  busyId?: string
  labels: AccountSessionListLabels
  headerAction?: React.ReactNode
  className?: string
}

/**
 * Presentational account-session list (plan 60 D5): one row per active
 * session with a preformatted detail line, optional device icon and badge
 * slot, a current-session badge and a per-row revoke button whose accessible
 * name carries the row label (`<revoke label> — <row label>`) while the
 * visible text stays the label. A row can be marked `revoked` (library-owned
 * “Signed out” badge, no action) or `revocable: false` (kept visible without
 * an action); `revoked` wins over `revocable`. Session policies, date
 * formatting and the surrounding summary stay app-side.
 */
export const AccountSessionList = React.forwardRef<HTMLDivElement, AccountSessionListProps>(
  function AccountSessionList(
    { rows, onRevoke, busyId, labels, headerAction, className },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-as="account-session-list"
        className={cn('flex w-full flex-col gap-2', className)}
      >
        {headerAction ? (
          <div
            data-as="account-session-list-header"
            className="flex flex-wrap items-center justify-end gap-2"
          >
            {headerAction}
          </div>
        ) : null}
        {rows.length === 0 ? (
          <p
            data-as="account-session-list-empty"
            className="rounded-[var(--as-radius)] border border-dashed border-[var(--as-border)] px-3 py-4 text-center text-xs text-[var(--as-muted-fg)]"
          >
            {labels.empty ?? 'No active sessions'}
          </p>
        ) : (
          <ul data-as="account-session-rows" className="m-0 flex list-none flex-col gap-1.5 p-0">
            {rows.map((row) => {
              const isRevoked = row.revoked === true
              const canRevoke = !isRevoked && row.revocable !== false
              const isBusy = busyId === row.id
              return (
                <li
                  key={row.id}
                  data-as="account-session-row"
                  data-current={row.current || undefined}
                  data-revoked={isRevoked || undefined}
                  data-revocable={canRevoke ? undefined : 'false'}
                  aria-current={row.current ? 'true' : undefined}
                  className={cn(
                    'flex items-start gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] px-3 py-2',
                    row.current && 'border-[var(--as-primary)]',
                  )}
                >
                  {row.icon ? (
                    <span
                      data-as="account-session-icon"
                      className="mt-0.5 flex shrink-0 items-center text-[var(--as-muted-fg)]"
                    >
                      {row.icon}
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        data-as="account-session-label"
                        className="min-w-0 text-xs font-medium text-[var(--as-fg)]"
                      >
                        {row.label}
                      </span>
                      {row.current ? (
                        <span
                          data-as="account-session-current"
                          className="inline-flex items-center rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--as-secondary-fg)]"
                        >
                          {labels.current}
                        </span>
                      ) : null}
                      {isRevoked ? (
                        <span
                          data-as="account-session-revoked"
                          className="inline-flex items-center rounded-full bg-[var(--as-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--as-muted-fg)]"
                        >
                          {labels.revoked ?? 'Signed out'}
                        </span>
                      ) : null}
                      {row.badges ? (
                        <span
                          data-as="account-session-badges"
                          className="flex flex-wrap items-center gap-1"
                        >
                          {row.badges}
                        </span>
                      ) : null}
                    </div>
                    {row.details.length > 0 ? (
                      <ul
                        data-as="account-session-details"
                        className="m-0 mt-0.5 flex list-none flex-wrap gap-x-3 gap-y-0.5 p-0 text-[11px] text-[var(--as-muted-fg)]"
                      >
                        {row.details.map((detail, index) => (
                          <li key={`${row.id}-${index}`}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {canRevoke ? (
                    <button
                      type="button"
                      data-as="account-session-revoke"
                      data-revoking={isBusy || undefined}
                      disabled={isBusy}
                      aria-busy={isBusy || undefined}
                      aria-label={`${isBusy ? labels.revoking : labels.revoke} — ${row.label}`}
                      onClick={() => onRevoke(row.id)}
                      className="shrink-0 cursor-pointer rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2 py-1 text-xs font-medium text-[var(--as-fg)] transition-colors hover:border-[var(--as-danger)] hover:text-[var(--as-danger)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--as-border)] disabled:hover:text-[var(--as-fg)]"
                    >
                      {isBusy ? labels.revoking : labels.revoke}
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  },
)
