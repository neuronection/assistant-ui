import * as React from 'react'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'

export type ExtensionSourceRefStrategy =
  | 'release-tag'
  | 'tag-pattern'
  | 'branch'
  | 'commit-pin'

export interface ExtensionSourceRef {
  strategy: ExtensionSourceRefStrategy
  value?: string
}

export interface ExtensionConsentProvenance {
  author?: string | null
  license?: string | null
  repository?: string | null
  description?: string | null
}

/** What every consent surface shows (ADR-0040 consent law): capabilities,
 * tier + import class, provenance (rendered verbatim), the pinned digest
 * and the verbatim perimeter disclosure. */
export interface ExtensionConsentPayload {
  extensionId: string | null
  version?: string | null
  tier: string
  importClass: string
  capabilities: string[]
  provenance: ExtensionConsentProvenance
  digest: string
  disclosure?: string | null
}

export interface ExtensionCandidateView {
  extensionId: string
  digest: string
  compatible: boolean
  reason?: string | null
  consent?: ExtensionConsentPayload | null
}

export interface ExtensionInstallView {
  id: string
  extensionId: string
  version?: string | null
  digest: string
  tier: string
  originClass: 'bundled' | 'imported' | 'listed'
  enabled: boolean
  state?: string | null
  parked?: boolean
  update?: {
    state?: string | null
    digest?: string | null
    requiresReconsent?: boolean
    version?: string | null
  } | null
}

export interface ExtensionSourceView {
  id: string
  kind: 'git' | 'local'
  origin: string
  status: 'ok' | 'degraded' | 'failing' | 'stale'
  candidates: ExtensionCandidateView[]
  installs: ExtensionInstallView[]
}

export interface ExtensionSourceDraft {
  url: string
  localPath: string
  refStrategy: ExtensionSourceRefStrategy
  refValue: string
  subpath: string
}

export interface ExtensionSourcesPanelLabels {
  title?: string
  hint?: string
  emptyLabel?: string
  addLabel?: string
  urlLabel?: string
  localPathLabel?: string
  refStrategyLabel?: string
  refValueLabel?: string
  subpathLabel?: string
  saveLabel?: string
  cancelLabel?: string
  checkLabel?: string
  removeSourceLabel?: string
  listedBadge?: string
  enabledAriaLabel?: string
  enableInstallAriaLabel?: string
  parkLabel?: string
  tombstoneLabel?: string
  applyUpdateLabel?: string
  updateAvailableLabel?: string
  reconsentRequiredLabel?: string
  digestDriftLabel?: string
  parkedBadge?: string
  consentTitleLabel?: string
  consentConfirmLabel?: string
  tierLabel?: string
  versionLabel?: string
  authorLabel?: string
  licenseLabel?: string
  repositoryLabel?: string
  digestLabel?: string
  capabilitiesLabel?: string
  incompatibleLabel?: string
}

export interface ExtensionSourcesPanelProps {
  /** Rendering order for sources. */
  sources: ExtensionSourceView[]
  busy?: boolean
  checkingId?: string | null
  labels?: ExtensionSourcesPanelLabels
  onAddSource: (draft: ExtensionSourceDraft) => void
  onCheck: (sourceId: string) => void
  onRemoveSource: (sourceId: string) => void
  onConsentInstall: (sourceId: string, candidate: ExtensionCandidateView) => void
  onEnable: (install: ExtensionInstallView, enabled: boolean) => void
  onApplyUpdate: (install: ExtensionInstallView) => void
  onPark: (install: ExtensionInstallView) => void
  onTombstone: (install: ExtensionInstallView) => void
  /** Content slot: override the consent body (defaults to the verbatim
   * payload rendering). The disclosure must render verbatim either way. */
  renderConsent?: (payload: ExtensionConsentPayload) => React.ReactNode
  className?: string
}

const inputClass =
  'min-w-0 flex-1 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

const chipClass =
  'rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]'

function shortDigest(digest: string): string {
  return digest ? `${digest.slice(0, 12)}…` : ''
}

export const DefaultConsentBody = function DefaultConsentBody({
  payload,
  labels,
}: {
  payload: ExtensionConsentPayload
  labels: Required<Pick<ExtensionSourcesPanelLabels, 'tierLabel' | 'versionLabel' | 'authorLabel' | 'licenseLabel' | 'repositoryLabel' | 'digestLabel' | 'capabilitiesLabel'>>
}) {
  const rows: Array<[string, React.ReactNode]> = [
    [labels.tierLabel, `${payload.tier} · ${payload.importClass}`],
    [labels.versionLabel, payload.version ?? '—'],
    [labels.authorLabel, payload.provenance.author ?? '—'],
    [labels.licenseLabel, payload.provenance.license ?? '—'],
    [labels.repositoryLabel, payload.provenance.repository ?? '—'],
  ]
  return (
    <div data-as="extension-consent" data-testid="ext-consent" className="space-y-2">
      <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-medium text-[var(--as-fg)]">{label}</dt>
            <dd className="break-all text-[var(--as-muted-fg)]">{value}</dd>
          </div>
        ))}
        <div className="min-w-0 sm:col-span-2">
          <dt className="font-medium text-[var(--as-fg)]">{labels.digestLabel}</dt>
          <dd className="font-mono break-all text-[var(--as-muted-fg)]" data-testid="ext-consent-digest">
            {payload.digest}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-1" data-testid="ext-consent-capabilities">
        {payload.capabilities.map((capability) => (
          <span key={capability} className={chipClass}>
            {capability}
          </span>
        ))}
      </div>
      {payload.disclosure ? (
        <p
          className="border-l-4 border-[var(--as-warning)] pl-2 text-xs text-[var(--as-fg)]"
          data-testid="ext-consent-disclosure"
        >
          {payload.disclosure}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Presentational extension-source list (ADR-0040 D13+D22 / plan 32
 * Phase 3): ordered git sources with their discovered candidates (consent
 * payloads rendered verbatim — the disclosure is law, never paraphrased),
 * digest-pinned installs with origin-class chips (D25: `imported` never
 * renders as official), update/park/tombstone affordances, and a
 * controlled add-from-git form. Persistence, consent records, probes and
 * GitOps are app-side; the panel renders and emits.
 */
export const ExtensionSourcesPanel = React.forwardRef<
  HTMLDivElement,
  ExtensionSourcesPanelProps
>(function ExtensionSourcesPanel(
  {
    sources,
    busy = false,
    checkingId = null,
    labels,
    onAddSource,
    onCheck,
    onRemoveSource,
    onConsentInstall,
    onEnable,
    onApplyUpdate,
    onPark,
    onTombstone,
    renderConsent,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      title: labels?.title ?? 'Extension sources',
      hint: labels?.hint,
      emptyLabel: labels?.emptyLabel ?? 'No extension sources yet.',
      addLabel: labels?.addLabel ?? 'Add source',
      urlLabel: labels?.urlLabel ?? 'https git URL',
      localPathLabel: labels?.localPathLabel ?? 'Local repo path (dev/test)',
      refStrategyLabel: labels?.refStrategyLabel ?? 'Ref strategy',
      refValueLabel: labels?.refValueLabel ?? 'Tag pattern / branch / commit',
      subpathLabel: labels?.subpathLabel ?? 'Subpath (optional)',
      saveLabel: labels?.saveLabel ?? 'Add source',
      cancelLabel: labels?.cancelLabel ?? 'Cancel',
      checkLabel: labels?.checkLabel ?? 'Check',
      removeSourceLabel: labels?.removeSourceLabel ?? 'Remove source',
      listedBadge: labels?.listedBadge ?? 'listed',
      enabledAriaLabel: labels?.enabledAriaLabel ?? 'Enable extension',
      parkLabel: labels?.parkLabel ?? 'Park',
      tombstoneLabel: labels?.tombstoneLabel ?? 'Tombstone',
      applyUpdateLabel: labels?.applyUpdateLabel ?? 'Apply update',
      updateAvailableLabel: labels?.updateAvailableLabel ?? 'Update available',
      reconsentRequiredLabel: labels?.reconsentRequiredLabel ?? 're-consent required',
      digestDriftLabel: labels?.digestDriftLabel ?? 'digest drift — refused',
      parkedBadge: labels?.parkedBadge ?? 'parked',
      consentTitleLabel: labels?.consentTitleLabel ?? 'Consent to import',
      consentConfirmLabel: labels?.consentConfirmLabel ?? 'I consent — install',
      tierLabel: labels?.tierLabel ?? 'Tier / class',
      versionLabel: labels?.versionLabel ?? 'Version',
      authorLabel: labels?.authorLabel ?? 'Author',
      licenseLabel: labels?.licenseLabel ?? 'License',
      repositoryLabel: labels?.repositoryLabel ?? 'Repository',
      digestLabel: labels?.digestLabel ?? 'Pinned digest',
      capabilitiesLabel: labels?.capabilitiesLabel ?? 'Capabilities',
      incompatibleLabel: labels?.incompatibleLabel ?? 'incompatible',
    }),
    [labels],
  )

  const [draft, setDraft] = React.useState<ExtensionSourceDraft | null>(null)
  const [confirming, setConfirming] = React.useState<{
    sourceId: string
    candidate: ExtensionCandidateView
  } | null>(null)

  const openAdd = () =>
    setDraft({
      url: '',
      localPath: '',
      refStrategy: 'release-tag',
      refValue: '',
      subpath: '',
    })

  const saveDisabled =
    busy ||
    (draft !== null &&
      !(draft.url.trim().startsWith('https://') || draft.localPath.trim().startsWith('/')))

  const consentBody = (payload: ExtensionConsentPayload) =>
    renderConsent ? renderConsent(payload) : <DefaultConsentBody payload={payload} labels={t} />

  return (
    <div
      ref={ref}
      data-as="extension-sources"
      className={cn(
        'rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-medium text-[var(--as-fg)]">{t.title}</p>
          {t.hint ? (
            <p className="mt-0.5 text-xs text-[var(--as-muted-fg)]">{t.hint}</p>
          ) : null}
        </div>
        {draft === null ? (
          <Button variant="outline" size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden />
            {t.addLabel}
          </Button>
        ) : null}
      </div>

      <ul className="mt-3 space-y-2" data-testid="ext-source-rows">
        {sources.map((source) => (
          <li
            key={source.id}
            data-testid={`ext-source-${source.id}`}
            className="space-y-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 truncate text-sm font-medium text-[var(--as-fg)]">
                {source.origin}
              </span>
              <span className={chipClass}>{source.kind}</span>
              <span
                data-testid={`ext-source-status-${source.id}`}
                className={chipClass}
                aria-label={`status: ${source.status}`}
              >
                {source.status}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || checkingId === source.id}
                  aria-label={`${t.checkLabel}: ${source.origin}`}
                  onClick={() => onCheck(source.id)}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  {t.checkLabel}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t.removeSourceLabel}: ${source.origin}`}
                  disabled={busy}
                  onClick={() => onRemoveSource(source.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            {source.candidates.map((candidate) => (
              <div
                key={`${candidate.extensionId}-${candidate.digest}`}
                data-testid={`ext-candidate-${candidate.extensionId}`}
                className="space-y-1 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--as-fg)]">
                  <span className="font-medium">{candidate.extensionId}</span>
                  <span className={chipClass}>{t.listedBadge}</span>
                  <span className="font-mono text-xs text-[var(--as-muted-fg)]">
                    {shortDigest(candidate.digest)}
                  </span>
                  {!candidate.compatible ? (
                    <span className="rounded-full bg-[var(--as-danger)] px-2 py-0.5 text-[11px]">
                      {candidate.reason ?? t.incompatibleLabel}
                    </span>
                  ) : null}
                </div>
                {candidate.compatible && candidate.consent ? (
                  <div className="space-y-1">
                    {consentBody(candidate.consent)}
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => setConfirming({ sourceId: source.id, candidate })}
                    >
                      {t.consentConfirmLabel}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}

            {source.installs.map((install) => {
              const updateState = install.update?.state ?? ''
              return (
                <div
                  key={install.id}
                  data-testid={`ext-install-${install.extensionId}`}
                  className="flex flex-wrap items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-2 text-sm text-[var(--as-fg)]"
                >
                  <label className="flex cursor-pointer items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={install.enabled}
                      aria-label={`${t.enabledAriaLabel}: ${install.extensionId}`}
                      onChange={(event) => onEnable(install, event.target.checked)}
                    />
                    {install.extensionId}
                  </label>
                  <span data-testid={`ext-origin-${install.extensionId}`} className={chipClass}>
                    {install.originClass}
                  </span>
                  <span className={chipClass}>{install.tier}</span>
                  <span className="font-mono text-xs text-[var(--as-muted-fg)]">
                    {shortDigest(install.digest)}
                  </span>
                  {install.parked ? (
                    <span className={chipClass}>{t.parkedBadge}</span>
                  ) : null}
                  {updateState === 'available' ? (
                    <span
                      data-testid={`ext-update-${install.extensionId}`}
                      className="text-xs text-[var(--as-fg)]"
                    >
                      {t.updateAvailableLabel}
                      {install.update?.requiresReconsent
                        ? ` — ${t.reconsentRequiredLabel}`
                        : ''}
                    </span>
                  ) : null}
                  {updateState === 'digest-drift' ? (
                    <span
                      data-testid={`ext-drift-${install.extensionId}`}
                      className="text-xs text-[var(--as-danger)]"
                    >
                      {t.digestDriftLabel}
                    </span>
                  ) : null}
                  <div className="ml-auto flex items-center gap-1.5">
                    {updateState === 'available' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => onApplyUpdate(install)}
                      >
                        {t.applyUpdateLabel}
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => onPark(install)}
                    >
                      {t.parkLabel}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${t.tombstoneLabel}: ${install.extensionId}`}
                      disabled={busy}
                      onClick={() => onTombstone(install)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              )
            })}
          </li>
        ))}
      </ul>

      {sources.length === 0 && draft === null ? (
        <p className="py-4 text-center text-sm text-[var(--as-muted-fg)]" data-testid="ext-empty">
          {t.emptyLabel}
        </p>
      ) : null}

      {draft !== null ? (
        <form
          data-testid="ext-source-form"
          className="mt-3 space-y-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3"
          onSubmit={(event) => {
            event.preventDefault()
            onAddSource(draft)
            setDraft(null)
          }}
        >
          <input
            className={inputClass}
            placeholder={t.urlLabel}
            aria-label={t.urlLabel}
            value={draft.url}
            onChange={(event) => setDraft({ ...draft, url: event.target.value })}
          />
          <input
            className={inputClass}
            placeholder={t.localPathLabel}
            aria-label={t.localPathLabel}
            value={draft.localPath}
            onChange={(event) => setDraft({ ...draft, localPath: event.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            <select
              className={cn(inputClass, 'flex-none')}
              aria-label={t.refStrategyLabel}
              value={draft.refStrategy}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  refStrategy: event.target.value as ExtensionSourceRefStrategy,
                })
              }
            >
              <option value="release-tag">release-tag</option>
              <option value="tag-pattern">tag-pattern</option>
              <option value="branch">branch</option>
              <option value="commit-pin">commit-pin</option>
            </select>
            <input
              className={inputClass}
              placeholder={t.refValueLabel}
              aria-label={t.refValueLabel}
              value={draft.refValue}
              onChange={(event) => setDraft({ ...draft, refValue: event.target.value })}
            />
            <input
              className={inputClass}
              placeholder={t.subpathLabel}
              aria-label={t.subpathLabel}
              value={draft.subpath}
              onChange={(event) => setDraft({ ...draft, subpath: event.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" type="submit" disabled={saveDisabled}>
              {t.saveLabel}
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setDraft(null)}>
              {t.cancelLabel}
            </Button>
          </div>
        </form>
      ) : null}

      {confirming ? (
        <div
          data-testid="ext-consent-confirm"
          role="alertdialog"
          aria-label={t.consentTitleLabel}
          className="mt-3 space-y-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3"
        >
          <p className="text-sm font-medium text-[var(--as-fg)]">
            {t.consentTitleLabel}: {confirming.candidate.extensionId}
          </p>
          {confirming.candidate.consent ? consentBody(confirming.candidate.consent) : null}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => {
                onConsentInstall(confirming.sourceId, confirming.candidate)
                setConfirming(null)
              }}
            >
              {t.consentConfirmLabel}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
              {t.cancelLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
})
