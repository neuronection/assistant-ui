import * as React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import {
  WebSearchProviderSettingsForm,
  type WebSearchProviderSettingsFormLabels,
} from './WebSearchProviderSettingsForm'
import { WebSearchProvidersList } from './WebSearchProvidersList'
import type { WebSearchProviderWizardLabels } from './WebSearchProviderWizard'
import { WebSearchProviderWizard } from './WebSearchProviderWizard'
import type {
  WebSearchProviderCatalog,
  WebSearchProviderFormValue,
  WebSearchProviderProbeView,
  WebSearchProviderSaveInput,
  WebSearchProviderView,
} from './types'

export interface WebSearchProvidersPanelLabels
  extends WebSearchProviderSettingsFormLabels,
    Omit<WebSearchProviderWizardLabels, keyof WebSearchProviderSettingsFormLabels> {
  title?: string
  hint?: string
  addLabel?: string
  emptyLabel?: string
  editTitle?: string
  typeLabel?: string
  baseUrlRequiredLabel?: string
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
  probeLabels?: Partial<Record<WebSearchProviderProbeView['status'], string>>
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
  className?: string
  onSave: (input: WebSearchProviderSaveInput) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onToggle: (id: string, enabled: boolean) => void
  onTest: (id: string) => void
}

/**
 * Composed web-search settings section (ADR-0035 family shape) in the
 * AI-providers pattern: a ProviderCard list with `⋯` management actions,
 * an add flow that starts from provider tiles ("choose" → "configure"),
 * and an inline edit form for an existing instance. Fully controlled —
 * persistence, keys and probes are app-side; the first enabled provider
 * that answers wins is the family's fallback semantics, surfaced by card
 * order. Apps wanting their own chrome (modal wizard, detail-page edit)
 * compose WebSearchProvidersList / WebSearchProviderWizard /
 * WebSearchProviderSettingsForm directly.
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
  const t = {
    title: labels?.title ?? 'Web search providers',
    hint: labels?.hint,
    addLabel: labels?.addLabel ?? 'Add provider',
    editTitle: labels?.editTitle ?? 'Edit provider',
    cancelLabel: labels?.cancelLabel ?? 'Cancel',
  }

  const [adding, setAdding] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const listLabels = {
    ...labels,
    okLabel: labels?.probeLabels?.ok,
    failLabel: labels?.probeLabels?.error,
  }

  const editing = providers.find((provider) => provider.id === editingId) ?? null
  const editingEntry = editing ? catalog.entries[editing.type] : undefined
  const [editValue, setEditValue] = React.useState<WebSearchProviderFormValue | null>(null)

  const openEdit = (provider: WebSearchProviderView): void => {
    setEditingId(provider.id)
    setEditValue({
      name: provider.name,
      apiKey: '',
      baseUrl: provider.baseUrl ?? '',
      fields: { google_cx: provider.googleCx ?? '' },
    })
  }

  const closeEdit = (): void => {
    setEditingId(null)
    setEditValue(null)
  }

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
        {!adding && editing === null ? (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            {t.addLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-3">
        {adding ? (
          <WebSearchProviderWizard
            catalog={catalog}
            busy={busy}
            labels={labels}
            onCancel={() => setAdding(false)}
            onSave={(input) => {
              setAdding(false)
              onSave(input)
            }}
          />
        ) : editing !== null && editingEntry != null && editValue !== null ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--as-fg)]">{t.editTitle}</p>
            <WebSearchProviderSettingsForm
              type={editing.type}
              entry={editingEntry}
              mode="edit"
              value={editValue}
              onChange={setEditValue}
              busy={busy}
              storedKeyHint={editing.keyHint}
              onCancel={closeEdit}
              labels={{ ...labels, cancelLabel: t.cancelLabel }}
              onSubmit={(submitted) => {
                closeEdit()
                onSave({
                  id: editing.id,
                  type: editing.type,
                  name: submitted.name,
                  baseUrl: submitted.baseUrl,
                  googleCx: submitted.fields['google_cx'] ?? '',
                  apiKey: submitted.apiKey.trim() === '' ? null : submitted.apiKey,
                  fields: submitted.fields,
                })
              }}
            />
          </div>
        ) : (
          <WebSearchProvidersList
            providers={providers}
            catalog={catalog}
            probes={probes}
            testingId={testingId}
            busy={busy}
            labels={listLabels}
            onToggle={onToggle}
            onMove={onMove}
            onTest={onTest}
            onEdit={openEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  )
})
