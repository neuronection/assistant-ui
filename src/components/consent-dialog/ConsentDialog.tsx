import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { IntegrationCapabilityChips } from '../integration-atoms/IntegrationAtoms'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../modal/Modal'
import type { IntegrationConsentPayloadView } from '../../contracts'

export interface ConsentDialogLabels {
  installTitle?: string
  reconsentTitle?: string
  updateTitle?: string
  description?: string
  tierLabel?: string
  versionLabel?: string
  authorLabel?: string
  licenseLabel?: string
  repositoryLabel?: string
  digestLabel?: string
  capabilitiesLabel?: string
  changesLabel?: string
  addedLabel?: string
  removedLabel?: string
  versionChangeLabel?: string
  digestChangeLabel?: string
  apiVersionChangeLabel?: string
  confirmLabel?: string
  declineLabel?: string
  closeLabel?: string
  busyLabel?: string
}

export interface ConsentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The consent payload — law text (disclosure, provenance) arrives as data. */
  payload: IntegrationConsentPayloadView | null
  /** Host-authored context copy (origin/coverage note), rendered above the verbatim law text. */
  context?: string | null
  labels?: ConsentDialogLabels
  busy?: boolean
  onConsent: (payload: IntegrationConsentPayloadView) => void
  onDecline?: (payload: IntegrationConsentPayloadView) => void
  className?: string
}

function changeValue(change: { from?: string | null; to?: string | null }): string {
  return `${change.from ?? '—'} → ${change.to ?? '—'}`
}

/**
 * Presentational consent dialog (ADR-0040 clause 21 / D15+D22): renders the
 * charter's consent content VERBATIM — capabilities, tier + import class,
 * provenance, the pinned digest and the law disclosure, all arriving as data
 * in the payload (the library never words consent). One surface for install
 * consent, capability-growth re-consent and update consent; the change
 * summary and the host's `context` copy render above the verbatim law text.
 * Consent persistence is app-side; the dialog only emits explicit user acts.
 */
export const ConsentDialog = React.forwardRef<HTMLDivElement, ConsentDialogProps>(
  function ConsentDialog(
    { open, onOpenChange, payload, context = null, labels, busy = false, onConsent, onDecline, className },
    ref,
  ) {
    const t = React.useMemo(
      () => ({
        installTitle: labels?.installTitle ?? 'Consent to import',
        reconsentTitle: labels?.reconsentTitle ?? 'New capabilities — re-consent required',
        updateTitle: labels?.updateTitle ?? 'Update available — re-consent required',
        description: labels?.description,
        tierLabel: labels?.tierLabel ?? 'Tier / class',
        versionLabel: labels?.versionLabel ?? 'Version',
        authorLabel: labels?.authorLabel ?? 'Author',
        licenseLabel: labels?.licenseLabel ?? 'License',
        repositoryLabel: labels?.repositoryLabel ?? 'Repository',
        digestLabel: labels?.digestLabel ?? 'Pinned content digest',
        capabilitiesLabel: labels?.capabilitiesLabel ?? 'Capabilities',
        changesLabel: labels?.changesLabel ?? 'What changed',
        addedLabel: labels?.addedLabel ?? 'Added capabilities',
        removedLabel: labels?.removedLabel ?? 'Removed capabilities',
        versionChangeLabel: labels?.versionChangeLabel ?? 'Version',
        digestChangeLabel: labels?.digestChangeLabel ?? 'Digest',
        apiVersionChangeLabel: labels?.apiVersionChangeLabel ?? 'API version',
        confirmLabel: labels?.confirmLabel ?? 'I consent',
        declineLabel: labels?.declineLabel ?? 'Decline',
        closeLabel: labels?.closeLabel ?? 'Close',
        busyLabel: labels?.busyLabel ?? 'Applying…',
      }),
      [labels],
    )

    const title =
      payload?.variant === 're-consent'
        ? t.reconsentTitle
        : payload?.variant === 'update'
          ? t.updateTitle
          : t.installTitle

    const changes = payload?.changeSummary ?? null
    const changeRows: Array<[string, React.ReactNode]> = []
    if (changes?.changed?.length) {
      changeRows.push([t.changesLabel, changes.changed.join(', ')])
    }
    if (changes?.addedCapabilities?.length) {
      changeRows.push([t.addedLabel, changes.addedCapabilities.join(', ')])
    }
    if (changes?.removedCapabilities?.length) {
      changeRows.push([t.removedLabel, changes.removedCapabilities.join(', ')])
    }
    if (changes?.versionChange) {
      changeRows.push([t.versionChangeLabel, changeValue(changes.versionChange)])
    }
    if (changes?.digestChange) {
      changeRows.push([t.digestChangeLabel, changeValue(changes.digestChange)])
    }
    if (changes?.apiVersionChange) {
      changeRows.push([t.apiVersionChangeLabel, changeValue(changes.apiVersionChange)])
    }

    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent
          size="lg"
          className={cn('gap-3', className)}
          closeLabel={t.closeLabel}
        >
          <ModalHeader>
            <ModalTitle>
              {title}
              {payload?.extensionId ? `: ${payload.extensionId}` : ''}
            </ModalTitle>
            {t.description ? <ModalDescription>{t.description}</ModalDescription> : null}
          </ModalHeader>
          {payload ? (
            <div
              ref={ref}
              data-as="consent-dialog"
              data-variant={payload.variant}
              data-testid="integration-consent"
              className="space-y-3"
            >
              <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="font-medium text-[var(--as-fg)]">{t.tierLabel}</dt>
                  <dd data-testid="integration-consent-tier">
                    {payload.tier} · {payload.importClass}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-medium text-[var(--as-fg)]">{t.versionLabel}</dt>
                  <dd>{payload.version ?? '—'}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-medium text-[var(--as-fg)]">{t.authorLabel}</dt>
                  <dd>{payload.provenance.author ?? '—'}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-medium text-[var(--as-fg)]">{t.licenseLabel}</dt>
                  <dd>{payload.provenance.license ?? '—'}</dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="font-medium text-[var(--as-fg)]">{t.repositoryLabel}</dt>
                  <dd className="break-all">{payload.provenance.repository ?? '—'}</dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="font-medium text-[var(--as-fg)]">{t.digestLabel}</dt>
                  <dd
                    className="break-all font-mono text-[var(--as-muted-fg)]"
                    data-testid="integration-consent-digest"
                  >
                    {payload.digest}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-xs font-medium text-[var(--as-fg)]">{t.capabilitiesLabel}</p>
                <div className="mt-1" data-testid="integration-consent-capabilities">
                  <IntegrationCapabilityChips capabilities={payload.capabilities} />
                </div>
              </div>

              {changeRows.length > 0 ? (
                <div
                  className="space-y-1 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-2"
                  data-testid="integration-consent-changes"
                >
                  <p className="text-xs font-semibold text-[var(--as-fg)]">{t.changesLabel}</p>
                  <dl className="space-y-0.5 text-xs">
                    {changeRows.map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="shrink-0 text-[var(--as-muted-fg)]">{label}:</dt>
                        <dd className="min-w-0 break-all text-[var(--as-fg)]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {context ? (
                <p
                  className="rounded-[var(--as-radius-sm)] bg-[var(--as-secondary)] p-2 text-xs text-[var(--as-fg)]"
                  data-testid="integration-consent-context"
                >
                  {context}
                </p>
              ) : null}

              {payload.disclosure ? (
                <p
                  className="border-l-4 border-[var(--as-warning)] pl-2 text-xs text-[var(--as-fg)]"
                  data-testid="integration-consent-disclosure"
                >
                  {payload.disclosure}
                </p>
              ) : null}
            </div>
          ) : null}
          <ModalFooter>
            {payload ? (
              <>
                <Button size="sm" disabled={busy} onClick={() => onConsent(payload)}>
                  {t.confirmLabel}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    onDecline?.(payload)
                    onOpenChange(false)
                  }}
                >
                  {t.declineLabel}
                </Button>
              </>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  },
)
