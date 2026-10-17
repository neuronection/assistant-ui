import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import {
  IntegrationCapabilityChips,
  OriginChip,
  TierBadge,
} from '../integration-atoms/IntegrationAtoms'
import type {
  IntegrationExtensionView,
  IntegrationProvenanceView,
} from '../../contracts'

/**
 * Presentational extension identity card (ADR-0040 D25 — one registry view,
 * origin-first): name/version, provenance verbatim, origin chip (bundled
 * never renders imports as official), tier badge, risk-marked capability
 * chips, update states, and typed action callbacks out. Extensions carry N
 * instances (G1) — `instanceCount` summarizes them; the instances themselves
 * render through IntegrationInstancesList. Domain content renders into the
 * card's children slot as app-owned detail.
 */

export interface IntegrationCardLabels {
  authorLabel?: string
  licenseLabel?: string
  repositoryLabel?: string
  capabilitiesLabel?: string
  /** Kind badge label — renders the kind chip when set and the view carries a kind. */
  kindLabel?: string
  instancesLabel?: string
  updateAvailableLabel?: string
  reconsentRequiredLabel?: string
  digestDriftLabel?: string
  applyUpdateLabel?: string
  enableLabel?: string
  disableLabel?: string
  configureLabel?: string
  parkLabel?: string
  restoreLabel?: string
  removeLabel?: string
  enabledAriaLabel?: string
}

export interface IntegrationCardProps {
  extension: IntegrationExtensionView
  labels?: IntegrationCardLabels
  /** Instance count for the card's configured summary (extension → N instances). */
  instanceCount?: number | null
  /** Aggregate enable state (app-owned semantics); renders the toggle when set. */
  enabled?: boolean | null
  busy?: boolean
  onEnable?: (extension: IntegrationExtensionView, enabled: boolean) => void
  onConfigure?: (extension: IntegrationExtensionView) => void
  onPark?: (extension: IntegrationExtensionView) => void
  onRestore?: (extension: IntegrationExtensionView) => void
  onRemove?: (extension: IntegrationExtensionView) => void
  onApplyUpdate?: (extension: IntegrationExtensionView) => void
  /** Full control over the action row; the default buttons are replaced. */
  renderActions?: (extension: IntegrationExtensionView) => React.ReactNode
  icon?: LucideIcon
  /** Detail slot: app-owned domain content rendered inside the card. */
  children?: React.ReactNode
  className?: string
}

export const IntegrationCard = React.forwardRef<HTMLDivElement, IntegrationCardProps>(
  function IntegrationCard(
    {
      extension,
      labels,
      instanceCount = null,
      enabled = null,
      busy = false,
      onEnable,
      onConfigure,
      onPark,
      onRestore,
      onRemove,
      onApplyUpdate,
      renderActions,
      icon: Icon,
      children,
      className,
    },
    ref,
  ) {
    const t = React.useMemo(
      () => ({
        authorLabel: labels?.authorLabel ?? 'Author',
        licenseLabel: labels?.licenseLabel ?? 'License',
        repositoryLabel: labels?.repositoryLabel ?? 'Repository',
        capabilitiesLabel: labels?.capabilitiesLabel ?? 'Capabilities',
        instancesLabel: labels?.instancesLabel ?? 'configured',
        updateAvailableLabel: labels?.updateAvailableLabel ?? 'Update available',
        reconsentRequiredLabel: labels?.reconsentRequiredLabel ?? 're-consent required',
        digestDriftLabel: labels?.digestDriftLabel ?? 'digest drift — refused',
        applyUpdateLabel: labels?.applyUpdateLabel ?? 'Apply update',
        enableLabel: labels?.enableLabel ?? 'Enable',
        disableLabel: labels?.disableLabel ?? 'Disable',
        configureLabel: labels?.configureLabel ?? 'Configure',
        kindLabel: labels?.kindLabel,
        parkLabel: labels?.parkLabel ?? 'Park',
        restoreLabel: labels?.restoreLabel ?? 'Restore',
        removeLabel: labels?.removeLabel ?? 'Remove',
        enabledAriaLabel: labels?.enabledAriaLabel ?? `Enable ${extension.name}`,
      }),
      [labels, extension.name],
    )

    const provenance: IntegrationProvenanceView | null = extension.provenance ?? null
    const provenanceRows: Array<[string, React.ReactNode]> = []
    if (provenance?.author) provenanceRows.push([t.authorLabel, provenance.author])
    if (provenance?.license) provenanceRows.push([t.licenseLabel, provenance.license])
    if (provenance?.repository) provenanceRows.push([t.repositoryLabel, provenance.repository])

    const update = extension.update ?? null

    return (
      <div
        ref={ref}
        data-as="integration-card"
        data-testid="integration-card"
        data-extension-id={extension.id}
        data-origin-class={extension.originClass}
        className={cn(
          'rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] p-4',
          className,
        )}
      >
        <div className="flex flex-wrap items-start gap-2">
          {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-[var(--as-muted-fg)]" aria-hidden /> : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[var(--as-fg)]">{extension.name}</span>
              {extension.version ? (
                <span className="font-mono text-xs text-[var(--as-muted-fg)]">
                  {extension.version}
                </span>
              ) : null}
              <OriginChip originClass={extension.originClass} />
              <TierBadge tier={extension.tier} />
              {extension.kind && t.kindLabel ? (
                <span
                  data-as="integration-card-kind"
                  data-kind={extension.kind}
                  data-testid="integration-card-kind"
                  title={`kind: ${extension.kind}`}
                  className="rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]"
                >
                  {t.kindLabel}
                </span>
              ) : null}
              {instanceCount !== null ? (
                <span className="text-xs text-[var(--as-muted-fg)]" data-testid="integration-card-instances">
                  {instanceCount} {t.instancesLabel}
                </span>
              ) : null}
            </div>
            {extension.summary ? (
              <p className="mt-1 text-xs text-[var(--as-muted-fg)]">{extension.summary}</p>
            ) : null}
          </div>
        </div>

        {provenanceRows.length > 0 ? (
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-3" data-testid="integration-card-provenance">
            {provenanceRows.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[var(--as-muted-fg)]">{label}</dt>
                <dd className="truncate text-[var(--as-fg)]">
                  {label === t.repositoryLabel ? (
                    <span className="inline-flex items-center gap-1 break-all">
                      {value}
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                    </span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {extension.capabilities && extension.capabilities.length > 0 ? (
          <div className="mt-2">
            <IntegrationCapabilityChips capabilities={extension.capabilities} />
          </div>
        ) : null}

        {update?.state === 'available' ? (
          <p className="mt-2 text-xs text-[var(--as-fg)]" data-testid="integration-card-update">
            {t.updateAvailableLabel}
            {update.version ? ` — ${update.version}` : ''}
            {update.requiresReconsent ? ` — ${t.reconsentRequiredLabel}` : ''}
          </p>
        ) : null}
        {update?.state === 'digest-drift' ? (
          <p
            className="mt-2 text-xs text-[var(--as-danger)]"
            data-testid="integration-card-drift"
            role="alert"
          >
            {t.digestDriftLabel}
            {update.detail ? ` — ${update.detail}` : ''}
          </p>
        ) : null}

        {children ? <div className="mt-3">{children}</div> : null}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {renderActions ? (
            renderActions(extension)
          ) : (
            <>
              {onEnable && enabled !== null ? (
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--as-fg)]">
                  <input
                    type="checkbox"
                    checked={enabled}
                    aria-label={t.enabledAriaLabel}
                    disabled={busy}
                    onChange={(event) => onEnable(extension, event.target.checked)}
                  />
                  {enabled ? t.disableLabel : t.enableLabel}
                </label>
              ) : null}
              {onConfigure ? (
                <Button variant="outline" size="sm" disabled={busy} onClick={() => onConfigure(extension)}>
                  {t.configureLabel}
                </Button>
              ) : null}
              {onApplyUpdate && update?.state === 'available' ? (
                <Button variant="outline" size="sm" disabled={busy} onClick={() => onApplyUpdate(extension)}>
                  {t.applyUpdateLabel}
                </Button>
              ) : null}
              {onPark ? (
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => onPark(extension)}>
                  {t.parkLabel}
                </Button>
              ) : null}
              {onRestore ? (
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => onRestore(extension)}>
                  {t.restoreLabel}
                </Button>
              ) : null}
              {onRemove ? (
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => onRemove(extension)}>
                  {t.removeLabel}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    )
  },
)
