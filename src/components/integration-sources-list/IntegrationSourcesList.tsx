import * as React from 'react'
import { Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { IntegrationInstancesList } from '../integration-instances-list/IntegrationInstancesList'
import type { IntegrationInstancesListLabels } from '../integration-instances-list/IntegrationInstancesList'
import { StatusBadge } from '../integration-atoms/IntegrationAtoms'
import { Skeleton } from '../skeleton/Skeleton'
import type {
  IntegrationDiscoveredView,
  IntegrationSourceRowView,
} from '../../contracts'

export interface IntegrationSourcesListLabels extends IntegrationInstancesListLabels {
  emptyLabel?: string
  loadingLabel?: string
  checkLabel?: string
  removeSourceLabel?: string
  editSourceLabel?: string
  checkAriaLabel?: string
  removeSourceAriaLabel?: string
  editSourceAriaLabel?: string
  gitopsSourceLabel?: string
  candidateLabel?: string
  installLabel?: string
  incompatibleLabel?: string
  kindLabels?: Partial<Record<IntegrationSourceRowView['kind'], string>>
}

export interface IntegrationSourcesListProps {
  sources: IntegrationSourceRowView[]
  labels?: IntegrationSourcesListLabels
  busy?: boolean
  loading?: boolean
  error?: string | null
  checkingId?: string | null
  onCheck?: (sourceId: string) => void
  onRemoveSource?: (sourceId: string) => void
  /** Edit the source descriptor; the host opens the prefill dialog. */
  onEditSource?: (sourceId: string) => void
  /** Emits the discovered candidate; the host opens ConsentDialog for it. */
  onInstallCandidate?: (sourceId: string, candidate: IntegrationDiscoveredView) => void
  onToggleEnabled?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
    enabled: boolean,
  ) => void
  onConfigure?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
  ) => void
  onPark?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
  ) => void
  onRestore?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
  ) => void
  onTombstone?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
  ) => void
  onApplyUpdate?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
  ) => void
  renderInstanceActions?: (
    sourceId: string,
    instance: IntegrationSourceRowView['groups'][number]['instances'][number],
  ) => React.ReactNode
  className?: string
}

function shortDigest(digest: string): string {
  return digest ? `${digest.slice(0, 12)}…` : ''
}

type InstanceOf = IntegrationSourceRowView['groups'][number]['instances'][number]

/**
 * Presentational extension-source list (ADR-0040 D13+D22): sources with
 * family status, check/remove affordances, pinned-ref short forms, gitops
 * desired-state indicators, discovered candidates (install hands off to the
 * host's consent flow) and the installed instances grouped under their
 * extensions. Removal semantics (park + tombstone) are the host's; the list
 * only emits explicit user acts.
 */
export const IntegrationSourcesList = React.forwardRef<
  HTMLDivElement,
  IntegrationSourcesListProps
>(function IntegrationSourcesList(
  {
    sources,
    labels,
    busy = false,
    loading = false,
    error = null,
    checkingId = null,
    onCheck,
    onRemoveSource,
    onEditSource,
    onInstallCandidate,
    onToggleEnabled,
    onConfigure,
    onPark,
    onRestore,
    onTombstone,
    onApplyUpdate,
    renderInstanceActions,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      emptyLabel: labels?.emptyLabel ?? 'No extension sources yet.',
      loadingLabel: labels?.loadingLabel ?? 'Loading…',
      checkLabel: labels?.checkLabel ?? 'Check',
      removeSourceLabel: labels?.removeSourceLabel ?? 'Remove source',
      editSourceLabel: labels?.editSourceLabel ?? 'Edit',
      checkAriaLabel: labels?.checkAriaLabel ?? 'Check source',
      removeSourceAriaLabel: labels?.removeSourceAriaLabel ?? 'Remove source',
      editSourceAriaLabel: labels?.editSourceAriaLabel ?? 'Edit source',
      gitopsSourceLabel: labels?.gitopsSourceLabel ?? 'gitops',
      candidateLabel: labels?.candidateLabel ?? 'listed',
      installLabel: labels?.installLabel ?? 'Install with consent…',
      incompatibleLabel: labels?.incompatibleLabel ?? 'incompatible',
      kindLabels: labels?.kindLabels ?? {},
      statusLabels: labels?.statusLabels ?? {},
    }),
    [labels],
  )

  if (loading) {
    return (
      <div
        ref={ref}
        data-as="integration-sources-list"
        data-state="loading"
        aria-busy="true"
        aria-label={t.loadingLabel}
        className={cn('space-y-2', className)}
      >
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-as="integration-sources-list"
      data-state={error ? 'error' : sources.length === 0 ? 'empty' : 'ready'}
      className={cn('space-y-3', className)}
    >
      {error ? (
        <p role="alert" className="text-sm text-[var(--as-danger)]" data-testid="integration-sources-error">
          {error}
        </p>
      ) : null}

      {sources.length === 0 && !error ? (
        <p
          className="py-4 text-center text-sm text-[var(--as-muted-fg)]"
          data-testid="integration-sources-empty"
        >
          {t.emptyLabel}
        </p>
      ) : null}

      {sources.map((source) => (
        <section
          key={source.id}
          data-testid={`integration-source-${source.id}`}
          aria-label={source.origin}
          className="space-y-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 truncate text-sm font-medium text-[var(--as-fg)]">
              {source.origin}
            </span>
            <span className="rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]">
              {t.kindLabels[source.kind] ?? source.kind}
            </span>
            {source.status ? (
              <StatusBadge
                status={source.status}
                label={t.statusLabels[source.status] ?? source.status}
                data-testid={`integration-source-status-${source.id}`}
              />
            ) : null}
            {source.gitops ? (
              <span className="rounded-full bg-[var(--as-primary)]/10 px-2 py-0.5 text-[11px] text-[var(--as-primary)]">
                {t.gitopsSourceLabel}
              </span>
            ) : null}
            {source.refStrategy ? (
              <span className="font-mono text-xs text-[var(--as-muted-fg)]">
                {source.refStrategy}
                {source.refValue ? `@${source.refValue}` : ''}
              </span>
            ) : null}
            <div className="ml-auto flex items-center gap-1.5">
              {onEditSource ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  aria-label={`${t.editSourceAriaLabel}: ${source.origin}`}
                  onClick={() => onEditSource(source.id)}
                >
                  <Pencil className="size-4" aria-hidden />
                  {t.editSourceLabel}
                </Button>
              ) : null}
              {onCheck ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || checkingId === source.id}
                  aria-label={`${t.checkAriaLabel}: ${source.origin}`}
                  onClick={() => onCheck(source.id)}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  {t.checkLabel}
                </Button>
              ) : null}
              {onRemoveSource ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t.removeSourceAriaLabel}: ${source.origin}`}
                  disabled={busy}
                  onClick={() => onRemoveSource(source.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>

          {source.error ? (
            <p
              role="alert"
              className="text-xs text-[var(--as-danger)]"
              data-testid={`integration-source-error-${source.id}`}
            >
              {source.error}
            </p>
          ) : null}

          {source.candidates.map((candidate) => (
            <div
              key={`${candidate.extensionId}-${candidate.digest}`}
              data-testid={`integration-candidate-${candidate.extensionId}`}
              className="flex flex-wrap items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-2 text-sm text-[var(--as-fg)]"
            >
              <span className="font-medium">{candidate.name ?? candidate.extensionId}</span>
              <span className="rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]">
                {t.candidateLabel}
              </span>
              <span className="font-mono text-xs text-[var(--as-muted-fg)]">
                {shortDigest(candidate.digest)}
              </span>
              {!candidate.compatible ? (
                <span className="rounded-full bg-[var(--as-danger)]/15 px-2 py-0.5 text-[11px] text-[var(--as-danger)]">
                  {candidate.reason ?? t.incompatibleLabel}
                </span>
              ) : null}
              {candidate.compatible && candidate.consent && onInstallCandidate ? (
                <div className="ml-auto">
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => onInstallCandidate(source.id, candidate)}
                  >
                    {t.installLabel}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          {source.groups.length > 0 ? (
            <IntegrationInstancesList
              groups={source.groups}
              labels={labels}
              busy={busy}
              onToggleEnabled={
                onToggleEnabled
                  ? (instance, enabled) => onToggleEnabled(source.id, instance, enabled)
                  : undefined
              }
              onConfigure={onConfigure ? (instance) => onConfigure(source.id, instance) : undefined}
              onPark={onPark ? (instance) => onPark(source.id, instance) : undefined}
              onRestore={onRestore ? (instance) => onRestore(source.id, instance) : undefined}
              onTombstone={
                onTombstone ? (instance) => onTombstone(source.id, instance) : undefined
              }
              onApplyUpdate={
                onApplyUpdate ? (instance) => onApplyUpdate(source.id, instance) : undefined
              }
              renderInstanceActions={
                renderInstanceActions
                  ? (instance: InstanceOf) => renderInstanceActions(source.id, instance)
                  : undefined
              }
            />
          ) : null}
        </section>
      ))}
    </div>
  )
})
