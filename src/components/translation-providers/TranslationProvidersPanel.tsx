import * as React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import {
  TranslationProviderSettingsForm,
} from './TranslationProviderSettingsForm'
import { TranslationProvidersList } from './TranslationProvidersList'
import type { TranslationProviderWizardLabels } from './TranslationProviderWizard'
import { TranslationProviderWizard } from './TranslationProviderWizard'
import type {
  TranslationEngineCatalog,
  TranslationProbeView,
  TranslationProviderFormValue,
  TranslationProviderSaveInput,
  TranslationProviderView,
} from './types'

export interface TranslationProvidersPanelLabels
  extends TranslationProviderWizardLabels {
  title?: string
  hint?: string
  addLabel?: string
  editTitle?: string
  emptyLabel?: string
  disabledBadge?: string
  noKeyLabel?: string
  keyStoredLabel?: string
  enableLabel?: string
  disableLabel?: string
  moveUpLabel?: string
  moveDownLabel?: string
  editLabel?: string
  deleteLabel?: string
  testLabel?: string
  idleLabel?: string
  okLabel?: string
  failLabel?: string
  orderLabel?: (position: number) => string
  actionsLabel?: (name: string) => string
}

export interface TranslationProvidersPanelProps {
  providers: TranslationProviderView[]
  catalog: TranslationEngineCatalog
  /** Connection tests keyed by provider id. */
  probes?: Record<string, TranslationProbeView>
  /** Id currently mid-test (shows the testing spinner). */
  testingId?: string | null
  busy?: boolean
  labels?: TranslationProvidersPanelLabels
  className?: string
  /** Default connection name per type — the app derives it from its
   * existing instances (label, numbered when taken). */
  defaultName?: (type: string) => string | null
  onSave: (input: TranslationProviderSaveInput) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onToggle: (id: string, enabled: boolean) => void
  onTest: (id: string) => void
}

/**
 * Composed translation settings section in the AI-providers pattern: a
 * ProviderCard list with `⋯` management actions, an add flow that starts
 * from engine tiles ("choose" → "configure"), and an inline edit form for
 * an existing instance. Fully controlled — persistence, keys and tests
 * are app-side; array order is the failover priority. Apps wanting their
 * own chrome (modal wizard, detail-page edit) compose
 * TranslationProvidersList / TranslationProviderWizard /
 * TranslationProviderSettingsForm directly.
 */
export const TranslationProvidersPanel = React.forwardRef<
  HTMLDivElement,
  TranslationProvidersPanelProps
>(function TranslationProvidersPanel(
  {
    providers,
    catalog,
    probes = {},
    testingId = null,
    busy = false,
    labels,
    defaultName,
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
    title: labels?.title ?? 'Translation providers',
    hint: labels?.hint,
    addLabel: labels?.addLabel ?? 'Add provider',
    editTitle: labels?.editTitle ?? 'Edit provider',
    cancelLabel: labels?.cancelLabel ?? 'Cancel',
  }

  const listLabels = {
    ...labels,
    okLabel: labels?.okLabel ?? 'ok',
    failLabel: labels?.failLabel ?? 'failed',
  }

  const [adding, setAdding] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const editing = providers.find((provider) => provider.id === editingId) ?? null
  const editingEntry = editing ? catalog.entries[editing.type] : undefined
  const [editValue, setEditValue] = React.useState<TranslationProviderFormValue | null>(null)

  const openEdit = (provider: TranslationProviderView): void => {
    setEditingId(provider.id)
    setEditValue({
      name: provider.name,
      apiKey: '',
      apiBase: provider.apiBase ?? '',
      fields: {},
    })
  }

  const closeEdit = (): void => {
    setEditingId(null)
    setEditValue(null)
  }

  return (
    <div
      ref={ref}
      data-as="translation-providers"
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
          <TranslationProviderWizard
            catalog={catalog}
            defaultName={defaultName}
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
            <TranslationProviderSettingsForm
              type={editing.type}
              entry={editingEntry}
              mode="edit"
              value={editValue}
              onChange={setEditValue}
              busy={busy}
              labels={{ ...labels, cancelLabel: t.cancelLabel }}
              storedKeyHint={editing.keyHint}
              onCancel={closeEdit}
              onSubmit={(submitted) => {
                closeEdit()
                onSave({
                  id: editing.id,
                  type: editing.type,
                  name: submitted.name,
                  apiBase: submitted.apiBase,
                  apiKey: submitted.apiKey.trim() === '' ? null : submitted.apiKey,
                  fields: submitted.fields,
                })
              }}
            />
          </div>
        ) : (
          <TranslationProvidersList
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
