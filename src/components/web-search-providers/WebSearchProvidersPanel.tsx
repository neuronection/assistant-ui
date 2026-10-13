import * as React from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { ConnectionTestRow, type ConnectionTestStatus } from '../connection-test-row/ConnectionTestRow'

export type WebSearchProbeStatus =
  | 'ok'
  | 'unreachable'
  | 'auth'
  | 'rate_limit'
  | 'json_disabled'
  | 'error'

export interface WebSearchProviderView {
  id: string
  name: string
  type: string
  enabled: boolean
  baseUrl?: string | null
  googleCx?: string | null
  keyHint?: string | null
  keySet: boolean
}

export interface WebSearchProviderCatalogField {
  id: string
  label: string
  required: boolean
  placeholder?: string
}

export interface WebSearchProviderCatalogEntry {
  label: string
  requiresKey: boolean
  keyUrl?: string | null
  baseUrl?: string | null
  baseUrlRequired: boolean
  baseUrlHint?: string | null
  notes?: string | null
  fields?: WebSearchProviderCatalogField[]
}

export interface WebSearchProviderCatalog {
  /** Rendering + form order for provider types. */
  order: string[]
  entries: Record<string, WebSearchProviderCatalogEntry>
}

export interface WebSearchProviderSaveInput {
  /** Absent = create. */
  id?: string
  type: string
  name?: string | null
  baseUrl?: string | null
  googleCx?: string | null
  /** `null` keeps the stored key, a value stores it. */
  apiKey?: string | null
}

export interface WebSearchProviderProbeView {
  status: WebSearchProbeStatus
  latencyMs?: number | null
  error?: string | null
}

export interface WebSearchProvidersPanelLabels {
  title?: string
  hint?: string
  addLabel?: string
  emptyLabel?: string
  nameLabel?: string
  typeLabel?: string
  baseUrlLabel?: string
  baseUrlRequiredLabel?: string
  keyLabel?: string
  keyOptionalLabel?: string
  keyStoredLabel?: string
  noKeyLabel?: string
  saveLabel?: string
  cancelLabel?: string
  editLabel?: string
  deleteLabel?: string
  moveUpLabel?: string
  moveDownLabel?: string
  enabledAriaLabel?: string
  disabledBadge?: string
  testLabel?: string
  probeLabels?: Partial<Record<WebSearchProbeStatus, string>>
}

export interface WebSearchProvidersPanelProps {
  providers: WebSearchProviderView[]
  catalog: WebSearchProviderCatalog
  /** Connection probes keyed by provider id. */
  probes?: Record<string, WebSearchProviderProbeView>
  /** Id currently mid-test (shows the testing spinner). */
  testingId?: string | null
  busy?: boolean
  labels?: WebSearchProvidersPanelLabels
  onSave: (input: WebSearchProviderSaveInput) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onToggle: (id: string, enabled: boolean) => void
  onTest: (id: string) => void
  className?: string
}

const inputClass =
  'min-w-0 flex-1 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

/**
 * Presentational ordered web-search provider list (ADR-0035 family shape):
 * enable/reorder/test/edit/delete rows plus a catalog-driven add/edit form.
 * Fully controlled — persistence, keys and probes are app-side; the panel
 * renders and emits. The first enabled provider that answers wins is the
 * family's fallback semantics, surfaced here by row order.
 */
export const WebSearchProvidersPanel = React.forwardRef<
  HTMLDivElement,
  WebSearchProvidersPanelProps
>(function WebSearchProvidersPanel(
  {
    providers,
    catalog,
    probes = {},
    testingId = null,
    busy = false,
    labels,
    onSave,
    onDelete,
    onMove,
    onToggle,
    onTest,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      title: labels?.title ?? 'Web search providers',
      hint: labels?.hint,
      addLabel: labels?.addLabel ?? 'Add provider',
      emptyLabel: labels?.emptyLabel ?? 'No web search providers yet.',
      nameLabel: labels?.nameLabel ?? 'Name (optional)',
      typeLabel: labels?.typeLabel ?? 'Provider type',
      baseUrlLabel: labels?.baseUrlLabel ?? 'Base URL (optional)',
      baseUrlRequiredLabel: labels?.baseUrlRequiredLabel ?? 'Base URL (required)',
      keyLabel: labels?.keyLabel ?? 'API key',
      keyOptionalLabel: labels?.keyOptionalLabel ?? 'API key (optional)',
      keyStoredLabel: labels?.keyStoredLabel ?? 'API key saved',
      noKeyLabel: labels?.noKeyLabel ?? 'no key',
      saveLabel: labels?.saveLabel ?? 'Save provider',
      cancelLabel: labels?.cancelLabel ?? 'Cancel',
      editLabel: labels?.editLabel ?? 'Edit provider',
      deleteLabel: labels?.deleteLabel ?? 'Delete provider',
      moveUpLabel: labels?.moveUpLabel ?? 'Move up',
      moveDownLabel: labels?.moveDownLabel ?? 'Move down',
      enabledAriaLabel: labels?.enabledAriaLabel ?? 'Enable provider',
      disabledBadge: labels?.disabledBadge ?? 'disabled',
      testLabel: labels?.testLabel ?? 'Test',
      probeLabels: { ...labels?.probeLabels },
    }),
    [labels],
  )

  const [draft, setDraft] = React.useState<WebSearchProviderSaveInput | null>(null)

  const openAdd = () => {
    const first = catalog.order[0]
    if (first) setDraft({ type: first, name: '', baseUrl: '', googleCx: '', apiKey: null })
  }

  const openEdit = (provider: WebSearchProviderView) =>
    setDraft({
      id: provider.id,
      type: provider.type,
      name: provider.name,
      baseUrl: provider.baseUrl ?? '',
      googleCx: provider.googleCx ?? '',
      apiKey: null,
    })

  const draftEntry = draft ? catalog.entries[draft.type] : undefined
  const draftCxField = draftEntry?.fields?.some((field) => field.id === 'google_cx') ?? false
  const saveDisabled =
    busy ||
    (draftEntry?.baseUrlRequired && !(draft?.baseUrl ?? '').trim()) ||
    (draft?.id == null && (draftEntry?.requiresKey ?? false) && !(draft?.apiKey ?? '').trim())

  return (
    <div
      ref={ref}
      data-as="web-search-providers"
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

      <ul className="mt-3 space-y-2" data-testid="wsp-rows">
        {providers.map((provider, index) => {
          const probe = probes[provider.id]
          const isTesting = testingId === provider.id
          const showProbeRow = probe != null || isTesting
          const probeStatus: ConnectionTestStatus | null = !showProbeRow
            ? null
            : isTesting
              ? 'testing'
              : probe!.status === 'ok'
                ? 'ok'
                : 'fail'
          const probeText =
            probe && probe.status !== 'ok' && probe.error
              ? probe.error
              : probe
                ? (t.probeLabels[probe.status] ?? probe.status)
                : null
          return (
            <li
              key={provider.id}
              data-testid={`wsp-row-${provider.id}`}
              className="border-border border-[var(--as-border)] space-y-1 rounded-[var(--as-radius-sm)] border p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--as-fg)]">
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    aria-label={`${t.enabledAriaLabel}: ${provider.name}`}
                    onChange={(event) => onToggle(provider.id, event.target.checked)}
                  />
                  {provider.name}
                </label>
                <span className="rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] text-[var(--as-muted-fg)]">
                  {catalog.entries[provider.type]?.label ?? provider.type}
                </span>
                {provider.baseUrl ? (
                  <span className="truncate font-mono text-xs text-[var(--as-muted-fg)]">
                    {provider.baseUrl}
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-[var(--as-muted-fg)]">
                  {provider.keySet
                    ? (provider.keyHint ?? t.keyStoredLabel)
                    : t.noKeyLabel}
                </span>
              </div>
              {showProbeRow ? (
                <ConnectionTestRow
                  variant="inline"
                  status={probeStatus ?? 'idle'}
                  latencyMs={probe?.latencyMs ?? null}
                  label={catalog.entries[provider.type]?.label ?? provider.type}
                  testLabel={t.testLabel}
                  okLabel={t.probeLabels.ok ?? probe?.status ?? 'ok'}
                  failLabel={probeText ?? t.probeLabels.error ?? probe?.status ?? 'failed'}
                  errorMessage={probe && probe.status === 'ok' ? null : (probe?.error ?? null)}
                />
              ) : null}
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || testingId === provider.id}
                  onClick={() => onTest(provider.id)}
                >
                  {t.testLabel}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t.moveUpLabel}: ${provider.name}`}
                  disabled={index === 0 || busy}
                  onClick={() => onMove(provider.id, 'up')}
                >
                  <ChevronUp className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t.moveDownLabel}: ${provider.name}`}
                  disabled={index === providers.length - 1 || busy}
                  onClick={() => onMove(provider.id, 'down')}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t.editLabel}: ${provider.name}`}
                  disabled={busy}
                  onClick={() => openEdit(provider)}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t.deleteLabel}: ${provider.name}`}
                  disabled={busy}
                  onClick={() => onDelete(provider.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
                {!provider.enabled ? (
                  <span className="text-xs text-[var(--as-muted-fg)]">
                    {t.disabledBadge}
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {providers.length === 0 && draft === null ? (
        <p className="py-4 text-center text-sm text-[var(--as-muted-fg)]" data-testid="wsp-empty">
          {t.emptyLabel}
        </p>
      ) : null}

      {draft !== null ? (
        <form
          data-testid="wsp-form"
          className="mt-3 space-y-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(draft)
          }}
        >
          <div className="flex flex-wrap gap-2">
            <select
              className={inputClass}
              value={draft.type}
              disabled={draft.id != null || busy}
              aria-label={t.typeLabel}
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value, googleCx: '' })
              }
            >
              {catalog.order.map((type) => (
                <option key={type} value={type}>
                  {catalog.entries[type]?.label ?? type}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder={t.nameLabel}
              value={draft.name ?? ''}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              className={inputClass}
              placeholder={
                draftEntry?.baseUrlRequired
                  ? t.baseUrlRequiredLabel
                  : (draftEntry?.baseUrlHint ?? t.baseUrlLabel)
              }
              value={draft.baseUrl ?? ''}
              onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })}
            />
            {draftCxField ? (
              <input
                className={cn(inputClass, 'w-48 flex-none')}
                placeholder={draftEntry?.fields?.find((f) => f.id === 'google_cx')?.placeholder ?? ''}
                aria-label={draftEntry?.fields?.find((f) => f.id === 'google_cx')?.label ?? 'Engine id'}
                value={draft.googleCx ?? ''}
                onChange={(event) => setDraft({ ...draft, googleCx: event.target.value })}
              />
            ) : null}
            <input
              type="password"
              className={cn(inputClass, 'w-48 flex-none')}
              placeholder={
                draft.id != null
                  ? t.keyStoredLabel
                  : draftEntry?.requiresKey
                    ? t.keyLabel
                    : t.keyOptionalLabel
              }
              aria-label={t.keyLabel}
              value={draft.apiKey ?? ''}
              onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })}
            />
          </div>
          {draftEntry?.notes ? (
            <p className="text-[11px] text-[var(--as-muted-fg)]">{draftEntry.notes}</p>
          ) : null}
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
    </div>
  )
})
