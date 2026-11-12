import * as React from 'react'
import { EllipsisVertical } from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  ActionMenu,
  type ActionMenuItem,
} from '../menu/Menu'
import {
  ConnectionTestRow,
  type ConnectionTestStatus,
} from '../connection-test-row/ConnectionTestRow'
import { ProviderLogo } from '../provider-logo/ProviderLogo'

export interface ProviderCardBadge {
  /** Stable badge id (also the React key). */
  key: string
  label: string
  /** Tooltip on the badge (e.g. the country's name behind its flag). */
  title?: string
  /** Danger tone (the "inactive" marker). */
  danger?: boolean
  /** Apps target badges in tests (`data-testid`). */
  testId?: string
}

/** Same shape as the overflow menu's items — management actions
 * ("Set up automatically", "Edit", "Delete"), not the inline test. */
export type ProviderCardAction = ActionMenuItem

export interface ProviderCardProps
  extends Omit<React.ComponentProps<'div'>, 'children'> {
  name: string
  /** Preset key for the provider mark — unknown keys fall back to the
   * monogram. */
  logoPreset?: string
  /** Tooltip on the name (the card keeps this line status-forward). */
  nameTitle?: string
  /** Muted, truncated second line under the name — discrete always-on
   * context (e.g. the endpoint URL); the full text rides its tooltip. */
  subtitle?: string
  badges?: ProviderCardBadge[]
  status?: ConnectionTestStatus
  /** Accessible label for the connection row. */
  connectionLabel?: string
  okLabel?: string
  failLabel?: string
  /** Text for the never-tested state ("Not tested") — shown when the
   * connection has never been tested. */
  idleLabel?: string
  latencyLabel?: string
  latencyMs?: number | null
  errorMessage?: string | null
  /** Context after the status — model count. */
  meta?: React.ReactNode
  actions?: ProviderCardAction[]
  /** Accessible label for the actions menu. */
  actionsLabel?: string
}

/** One provider summary card: mark + name + identity badges, a muted
 * subtitle for discrete always-on context (the endpoint URL), the
 * connection result as the status line (display only — the test action
 * lives in the `⋯` overflow menu alongside the other management
 * actions). Presentational and controlled: data in via props, events
 * out. */
export const ProviderCard = React.forwardRef<HTMLDivElement, ProviderCardProps>(
  function ProviderCard(
    {
      name,
      logoPreset,
      nameTitle,
      subtitle,
      badges,
      status = 'idle',
      connectionLabel,
      okLabel,
      failLabel,
      idleLabel,
      latencyLabel,
      latencyMs,
      errorMessage,
      meta,
      actions,
      actionsLabel,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-as="provider-card"
        className={cn(
          'flex items-start justify-between gap-2 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-4',
          className,
        )}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-medium text-[var(--as-fg)]">
            <ProviderLogo preset={logoPreset ?? ''} className="shrink-0" />
            <span className="truncate" title={nameTitle}>
              {name}
            </span>
            {(badges ?? []).map((badge) => (
              <span
                key={badge.key}
                title={badge.title}
                data-testid={badge.testId}
                className={cn(
                  'shrink-0 rounded bg-[var(--as-secondary)] px-1.5 py-0.5 text-xs text-[var(--as-secondary-fg)]',
                  badge.danger && 'bg-transparent text-[var(--as-danger)]',
                )}
              >
                {badge.label}
              </span>
            ))}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-[var(--as-muted-fg)]" title={subtitle}>
              {subtitle}
            </p>
          ) : null}
          <ConnectionTestRow
            variant="inline"
            className="mt-1.5"
            label={connectionLabel}
            status={status}
            latencyMs={latencyMs}
            latencyLabel={latencyLabel}
            idleLabel={idleLabel}
            errorMessage={errorMessage}
            meta={meta}
            okLabel={okLabel}
            failLabel={failLabel}
          />
        </div>
        {actions && actions.length > 0 ? (
          <ActionMenu
            label={actionsLabel ?? name}
            align="end"
            trigger={<EllipsisVertical className="size-4" aria-hidden />}
            items={actions}
          />
        ) : null}
      </div>
    )
  },
)
