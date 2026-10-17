import * as React from 'react'
import { cn } from '../../lib/utils'
import {
  EXTENSION_ORIGIN_CLASSES,
  EXTENSION_RISK_CLASSES,
  EXTENSION_STATUS_STATES,
  EXTENSION_TIERS,
  type ExtensionOriginClass,
  type ExtensionRiskClass,
  type ExtensionStatusState,
  type ExtensionTier,
} from '../../contracts'
import type { IntegrationCapabilityView } from '../../contracts'

export interface OriginChipProps extends React.ComponentProps<'span'> {
  originClass: ExtensionOriginClass
  label?: string
}

const ORIGIN_CLASS: Record<ExtensionOriginClass, string> = {
  bundled: 'bg-[var(--as-secondary)] text-[var(--as-muted-fg)]',
  imported: 'bg-[var(--as-warning)]/15 text-[var(--as-fg)]',
  listed: 'bg-[var(--as-muted)] text-[var(--as-muted-fg)]',
}

export const OriginChip = React.forwardRef<HTMLSpanElement, OriginChipProps>(
  function OriginChip({ originClass, label, title, className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-as="origin-chip"
        data-origin-class={originClass}
        title={title ?? originClass}
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
          ORIGIN_CLASS[originClass] ?? ORIGIN_CLASS.listed,
          className,
        )}
        {...rest}
      >
        {label ?? originClass}
      </span>
    )
  },
)

export interface StatusBadgeProps extends React.ComponentProps<'span'> {
  status: ExtensionStatusState
  label?: string
}

const STATUS_CLASS: Record<ExtensionStatusState, string> = {
  ok: 'bg-[var(--as-success)]/15 text-[var(--as-success)]',
  degraded: 'bg-[var(--as-warning)]/15 text-[var(--as-fg)]',
  failing: 'bg-[var(--as-danger)]/15 text-[var(--as-danger)]',
  stale: 'bg-[var(--as-muted)] text-[var(--as-muted-fg)]',
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge({ status, label, title, className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-as="status-badge"
        data-status={status}
        title={title ?? `status: ${status}`}
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
          STATUS_CLASS[status] ?? STATUS_CLASS.stale,
          className,
        )}
        {...rest}
      >
        {label ?? status}
      </span>
    )
  },
)

export interface TierBadgeProps extends React.ComponentProps<'span'> {
  tier: ExtensionTier
  label?: string
}

export const TierBadge = React.forwardRef<HTMLSpanElement, TierBadgeProps>(
  function TierBadge({ tier, label, title, className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-as="tier-badge"
        data-tier={tier}
        title={title ?? tier}
        className={cn(
          'inline-flex items-center rounded-full bg-[var(--as-muted)] px-2 py-0.5 font-mono text-[11px] text-[var(--as-muted-fg)]',
          className,
        )}
        {...rest}
      >
        {label ?? tier}
      </span>
    )
  },
)

export interface IntegrationCapabilityChipsProps {
  capabilities: IntegrationCapabilityView[]
  labels?: Partial<Record<ExtensionRiskClass, string>>
  capabilityTitle?: string | null
  className?: string
}

const RISK_CLASS: Record<ExtensionRiskClass, string> = {
  'read-only': 'border border-[var(--as-border)]',
  'state-changing': 'border border-[var(--as-warning)]/60',
  destructive: 'border border-[var(--as-danger)]/60 text-[var(--as-danger)]',
}

export const IntegrationCapabilityChips = React.forwardRef<
  HTMLDivElement,
  IntegrationCapabilityChipsProps
>(function IntegrationCapabilityChips(
  { capabilities, labels, capabilityTitle, className },
  ref,
) {
  return (
    <div
      ref={ref}
      data-as="integration-capability-chips"
      className={cn('flex flex-wrap items-center gap-1', className)}
    >
      {capabilities.map((capability) => {
        const risk =
          capability.riskClass && EXTENSION_RISK_CLASSES.includes(capability.riskClass)
            ? capability.riskClass
            : null
        return (
          <span
            key={capability.id}
            data-as-cap={capability.id}
            data-risk-class={risk ?? undefined}
            title={
              capabilityTitle
                ? risk
                  ? `${capabilityTitle}: ${capability.id} (${labels?.[risk] ?? risk})`
                  : `${capabilityTitle}: ${capability.id}`
                : undefined
            }
            className={cn(
              'inline-flex items-center rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]',
              risk ? RISK_CLASS[risk] : null,
            )}
          >
            {capability.id}
            {risk ? (
              <span className="ml-1 font-semibold uppercase tracking-wide opacity-75">
                {labels?.[risk] ?? risk}
              </span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
})

export function isExtensionOriginClass(value: string): value is ExtensionOriginClass {
  return (EXTENSION_ORIGIN_CLASSES as readonly string[]).includes(value)
}

export function isExtensionStatusState(value: string): value is ExtensionStatusState {
  return (EXTENSION_STATUS_STATES as readonly string[]).includes(value)
}

export function isExtensionTier(value: string): value is ExtensionTier {
  return (EXTENSION_TIERS as readonly string[]).includes(value)
}
