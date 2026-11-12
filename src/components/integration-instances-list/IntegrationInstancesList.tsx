import * as React from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { OriginChip, StatusBadge, TierBadge } from '../integration-atoms/IntegrationAtoms'
import { Skeleton } from '../skeleton/Skeleton'
import type {
  IntegrationConditionId,
  IntegrationExtensionGroupView,
  IntegrationInstanceView,
} from '../../contracts'

export interface IntegrationInstancesListLabels {
  emptyLabel?: string
  loadingLabel?: string
  enableAriaLabel?: string
  enableLabel?: string
  disableLabel?: string
  configureLabel?: string
  parkLabel?: string
  restoreLabel?: string
  removeLabel?: string
  tombstoneLabel?: string
  applyUpdateLabel?: string
  updateAvailableLabel?: string
  reconsentRequiredLabel?: string
  digestDriftLabel?: string
  gitopsLabel?: string
  parkedLabel?: string
  tombstonedLabel?: string
  conditionLabels?: Partial<Record<IntegrationConditionId, string>>
  statusLabels?: Partial<Record<string, string>>
  lastSuccessLabel?: string
  failuresLabel?: string
}

export interface IntegrationInstancesListProps {
  /** Instances grouped under their extension (extension → N instances). */
  groups: IntegrationExtensionGroupView[]
  labels?: IntegrationInstancesListLabels
  busy?: boolean
  loading?: boolean
  error?: string | null
  onToggleEnabled?: (instance: IntegrationInstanceView, enabled: boolean) => void
  onConfigure?: (instance: IntegrationInstanceView) => void
  onPark?: (instance: IntegrationInstanceView) => void
  onRestore?: (instance: IntegrationInstanceView) => void
  onTombstone?: (instance: IntegrationInstanceView) => void
  onApplyUpdate?: (instance: IntegrationInstanceView) => void
  /** Domain actions (probe/sync/…) rendered after the typed ones. */
  renderInstanceActions?: (instance: IntegrationInstanceView) => React.ReactNode
  /** Extension-level actions rendered in the group header. */
  renderExtensionActions?: (extension: IntegrationExtensionGroupView['extension']) => React.ReactNode
  className?: string
}

function shortDigest(digest: string | null | undefined): string {
  return digest ? `${digest.slice(0, 12)}…` : ''
}

/**
 * Presentational installed-instances list (ADR-0040 D19/D21): instance rows
 * grouped under their extension (extension ≠ instance — one extension, N
 * configured occurrences), status + conditions (needs-config / needs-secret)
 * + last_success_at / consecutive_failures, origin chips, update states and
 * typed per-instance action callbacks. Persistence and lifecycle are
 * app-side; the list renders and emits.
 */
export const IntegrationInstancesList = React.forwardRef<
  HTMLDivElement,
  IntegrationInstancesListProps
>(function IntegrationInstancesList(
  {
    groups,
    labels,
    busy = false,
    loading = false,
    error = null,
    onToggleEnabled,
    onConfigure,
    onPark,
    onRestore,
    onTombstone,
    onApplyUpdate,
    renderInstanceActions,
    renderExtensionActions,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      emptyLabel: labels?.emptyLabel ?? 'Nothing configured yet.',
      loadingLabel: labels?.loadingLabel ?? 'Loading…',
      enableAriaLabel: labels?.enableAriaLabel ?? 'Enable',
      enableLabel: labels?.enableLabel ?? 'Enable',
      disableLabel: labels?.disableLabel ?? 'Disable',
      configureLabel: labels?.configureLabel ?? 'Configure',
      parkLabel: labels?.parkLabel ?? 'Park',
      restoreLabel: labels?.restoreLabel ?? 'Restore',
      removeLabel: labels?.removeLabel ?? 'Remove',
      tombstoneLabel: labels?.tombstoneLabel ?? 'Tombstone',
      applyUpdateLabel: labels?.applyUpdateLabel ?? 'Apply update',
      updateAvailableLabel: labels?.updateAvailableLabel ?? 'Update available',
      reconsentRequiredLabel: labels?.reconsentRequiredLabel ?? 're-consent required',
      digestDriftLabel: labels?.digestDriftLabel ?? 'digest drift — refused',
      gitopsLabel: labels?.gitopsLabel ?? 'gitops',
      parkedLabel: labels?.parkedLabel ?? 'parked',
      tombstonedLabel: labels?.tombstonedLabel ?? 'tombstoned',
      conditionLabels: {
        'needs-config': labels?.conditionLabels?.['needs-config'] ?? 'needs config',
        'needs-secret': labels?.conditionLabels?.['needs-secret'] ?? 'needs secret',
      },
      statusLabels: labels?.statusLabels ?? {},
      lastSuccessLabel: labels?.lastSuccessLabel ?? 'last success',
      failuresLabel: labels?.failuresLabel ?? 'consecutive failures',
    }),
    [labels],
  )

  const totalCount = groups.reduce((sum, group) => sum + group.instances.length, 0)

  if (loading) {
    return (
      <div
        ref={ref}
        data-as="integration-instances-list"
        data-state="loading"
        aria-busy="true"
        aria-label={t.loadingLabel}
        className={cn('space-y-2', className)}
      >
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-as="integration-instances-list"
      data-state={error ? 'error' : totalCount === 0 ? 'empty' : 'ready'}
      className={cn('space-y-3', className)}
    >
      {error ? (
        <p role="alert" className="text-sm text-[var(--as-danger)]" data-testid="integration-instances-error">
          {error}
        </p>
      ) : null}

      {totalCount === 0 && !error ? (
        <p
          className="py-4 text-center text-sm text-[var(--as-muted-fg)]"
          data-testid="integration-instances-empty"
        >
          {t.emptyLabel}
        </p>
      ) : null}

      {groups.map((group) =>
        group.instances.length === 0 ? null : (
          <section
            key={group.extension.id}
            data-testid={`integration-group-${group.extension.id}`}
            aria-label={group.extension.name}
            className="space-y-1.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
                {group.extension.name}
              </span>
              {renderExtensionActions ? renderExtensionActions(group.extension) : null}
            </div>
            {group.instances.map((instance) => {
              const update = instance.update ?? null
              const status = instance.status ?? null
              return (
                <div
                  key={instance.id}
                  data-testid={`integration-instance-${instance.id}`}
                  className="flex flex-wrap items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-2 text-sm text-[var(--as-fg)]"
                >
                  {onToggleEnabled ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={instance.enabled}
                      aria-label={`${t.enableAriaLabel}: ${instance.name}`}
                      title={`${t.enableAriaLabel}: ${instance.name}`}
                      disabled={busy}
                      data-state={instance.enabled ? "checked" : "unchecked"}
                      data-testid={`integration-instance-toggle-${instance.id}`}
                      onClick={() => onToggleEnabled(instance, !instance.enabled)}
                      className="flex cursor-pointer items-center gap-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50"
                    >
                      {instance.name}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150",
                          instance.enabled ? "bg-[var(--as-primary)]" : "bg-[var(--as-border)]",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-[var(--as-surface-raised)] shadow transition-all duration-150",
                            instance.enabled ? "left-[1.125rem]" : "left-0.5",
                          )}
                        />
                      </span>
                    </button>
                  ) : (
                    <span className="font-medium">{instance.name}</span>
                  )}
                  {instance.originClass ? <OriginChip originClass={instance.originClass} /> : null}
                  {instance.tier ? <TierBadge tier={instance.tier} /> : null}
                  {status ? (
                    <StatusBadge
                      status={status}
                      label={t.statusLabels[status] ?? status}
                    />
                  ) : null}
                  {instance.conditions?.map((condition) => (
                    <span
                      key={condition}
                      data-testid={`integration-condition-${instance.id}-${condition}`}
                      className="rounded-full bg-[var(--as-warning)]/15 px-2 py-0.5 text-[11px] text-[var(--as-fg)]"
                    >
                      {t.conditionLabels[condition] ?? condition}
                    </span>
                  ))}
                  {instance.managedBy === 'gitops' ? (
                    <span className="rounded-full bg-[var(--as-primary)]/10 px-2 py-0.5 text-[11px] text-[var(--as-primary)]">
                      {t.gitopsLabel}
                    </span>
                  ) : null}
                  {instance.parked ? (
                    <span className="rounded-full bg-[var(--as-warning)]/15 px-2 py-0.5 text-[11px] text-[var(--as-fg)]">
                      {t.parkedLabel}
                    </span>
                  ) : null}
                  {instance.lifecycle === 'removed' ? (
                    <span className="rounded-full bg-[var(--as-muted)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]">
                      {t.tombstonedLabel}
                    </span>
                  ) : null}
                  {instance.lastSuccessAt ? (
                    <span className="text-xs text-[var(--as-muted-fg)]">
                      {t.lastSuccessLabel}: {instance.lastSuccessAt}
                    </span>
                  ) : null}
                  {instance.consecutiveFailures ? (
                    <span className="text-xs text-[var(--as-danger)]">
                      {t.failuresLabel}: {instance.consecutiveFailures}
                    </span>
                  ) : null}
                  <span className="font-mono text-xs text-[var(--as-muted-fg)]">
                    {shortDigest(instance.digest)}
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-1.5">
                    {update?.state === 'available' ? (
                      <span className="text-xs text-[var(--as-fg)]" data-testid={`integration-update-${instance.id}`}>
                        {t.updateAvailableLabel}
                        {update.version ? ` — ${update.version}` : ''}
                        {update.requiresReconsent ? ` — ${t.reconsentRequiredLabel}` : ''}
                      </span>
                    ) : null}
                    {update?.state === 'digest-drift' ? (
                      <span
                        className="text-xs text-[var(--as-danger)]"
                        data-testid={`integration-drift-${instance.id}`}
                        role="alert"
                      >
                        {t.digestDriftLabel}
                        {update.detail ? ` — ${update.detail}` : ''}
                      </span>
                    ) : null}
                    {update?.state === 'available' && onApplyUpdate ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => onApplyUpdate(instance)}
                      >
                        {t.applyUpdateLabel}
                      </Button>
                    ) : null}
                    {onConfigure ? (
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => onConfigure(instance)}>
                        {t.configureLabel}
                      </Button>
                    ) : null}
                    {onPark && !instance.parked ? (
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => onPark(instance)}>
                        {t.parkLabel}
                      </Button>
                    ) : null}
                    {onRestore && (instance.parked || instance.enabled === false) ? (
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => onRestore(instance)}>
                        {t.restoreLabel}
                      </Button>
                    ) : null}
                    {onTombstone ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`${t.tombstoneLabel}: ${instance.name}`}
                        disabled={busy}
                        onClick={() => onTombstone(instance)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    ) : null}
                    {renderInstanceActions ? renderInstanceActions(instance) : null}
                  </div>
                </div>
              )
            })}
          </section>
        ),
      )}
    </div>
  )
})
