import * as React from 'react'
import { Check, ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button'
import { CapabilityChips, type CapabilityDescriptor } from '../capability-chips'
import { SearchInput } from '../search-input'
import { Spinner } from '../spinner'

export interface ModelRegistryProvider {
  id: string
  name: string
  type?: string
  baseUrl?: string
}

export interface ModelRegistryModel {
  id: string
  providerId: string
  externalId: string
  label?: string
  caps: string[]
  enabled: boolean
  reasoningEffort?: string
  missing?: boolean
}

export interface ModelRegistryRemoteModel {
  id: string
  caps: string[]
}

export interface ModelRegistryDraft {
  externalId: string
  label?: string
  caps: string[]
  reasoningEffort?: string
}

export interface ModelRegistryPatch {
  label?: string
  caps?: string[]
  enabled?: boolean
  reasoningEffort?: string
}

export type ModelRegistryRemoteState = 'loading' | 'error' | 'ready'

export interface ModelRegistryProps {
  providers: ModelRegistryProvider[]
  models: ModelRegistryModel[]
  caps: CapabilityDescriptor[]
  expandedProviderId?: string | null
  onExpandedProviderChange: (providerId: string | null) => void
  remoteModels?: ModelRegistryRemoteModel[]
  remoteState?: ModelRegistryRemoteState
  remoteError?: string | null
  onRetryRemote?: () => void
  onAddModel: (providerId: string, draft: ModelRegistryDraft) => void
  onAddAll?: (providerId: string, drafts: ModelRegistryDraft[]) => void
  onUpdateModel: (model: ModelRegistryModel, patch: ModelRegistryPatch) => void
  onDeleteModel: (model: ModelRegistryModel) => void
  rank?: (items: ModelRegistryRemoteModel[], query: string) => ModelRegistryRemoteModel[]
  reasoningEffortOptions?: string[]
  addLabel?: string
  addedLabel?: string
  addAllLabel?: string
  configureLabel?: string
  editLabel?: string
  removeLabel?: string
  missingLabel?: string
  capsLabel?: string
  searchPlaceholder?: string
  searchLabel?: string
  capFilterLabel?: string
  unclassifiedLabel?: string
  emptyProviderLabel?: string
  remoteEmptyLabel?: string
  remoteLoadingLabel?: string
  retryLabel?: string
  /** Catalog disclosure trigger; the search/filter zone renders only when opened. */
  browseLabel?: string
  manualAddLabel?: string
  externalIdLabel?: string
  labelLabel?: string
  reasoningEffortLabel?: string
  reasoningEffortPlaceholder?: string
  saveLabel?: string
  cancelLabel?: string
  addDraftLabel?: string
  providersEmptyLabel?: string
  emptyAction?: React.ReactNode
  className?: string
}

const UNCLASSIFIED = '__unclassified__'

interface DraftState {
  key: string
  mode: 'add' | 'edit'
  providerId: string
  externalId: string
  label: string
  caps: string[]
  reasoningEffort: string
  model?: ModelRegistryModel
}

export const ModelRegistry = React.forwardRef<HTMLDivElement, ModelRegistryProps>(
  function ModelRegistry(
    {
      providers,
      models,
      caps,
      expandedProviderId,
      onExpandedProviderChange,
      remoteModels,
      remoteState = 'ready',
      remoteError,
      onRetryRemote,
      onAddModel,
      onAddAll,
      onUpdateModel,
      onDeleteModel,
      rank,
      reasoningEffortOptions,
      addLabel = 'Add',
      addedLabel = 'Added',
      addAllLabel = 'Add all',
      configureLabel = 'Configure',
      editLabel = 'Edit',
      removeLabel = 'Remove',
      missingLabel = 'Missing',
      capsLabel = 'Capabilities',
      searchPlaceholder = 'Search models…',
      searchLabel = 'Search models',
      capFilterLabel = 'Filter by capability',
      unclassifiedLabel = 'Unclassified',
      emptyProviderLabel = 'No models yet — add from the catalog below.',
      remoteEmptyLabel = 'No models match.',
      remoteLoadingLabel = 'Loading models…',
      retryLabel = 'Retry',
      browseLabel = 'Browse catalog',
      manualAddLabel = 'Add manually',
      externalIdLabel = 'Model ID',
      labelLabel = 'Display label',
      reasoningEffortLabel = 'Reasoning effort',
      reasoningEffortPlaceholder,
      saveLabel = 'Save',
      cancelLabel = 'Cancel',
      addDraftLabel = 'Add model',
      providersEmptyLabel = 'No providers yet.',
      emptyAction,
      className,
    },
    ref,
  ) {
    const [query, setQuery] = React.useState('')
    const [capFilter, setCapFilter] = React.useState<string | null>(null)
    const [draft, setDraft] = React.useState<DraftState | null>(null)
    const [draftError, setDraftError] = React.useState<string | null>(null)
    const [catalogOpen, setCatalogOpen] = React.useState(false)

    const descriptorFor = React.useCallback(
      (value: string): CapabilityDescriptor =>
        caps.find((cap) => cap.value === value) ?? { value, label: value },
      [caps],
    )

    const filteredRemote = React.useMemo(() => {
      const items = remoteModels ?? []
      const needle = query.trim().toLowerCase()
      const ranked =
        needle && rank ? rank(items, query) : items
      const searched =
        needle && !rank
          ? ranked.filter((item) => item.id.toLowerCase().includes(needle))
          : ranked
      if (capFilter === UNCLASSIFIED) return searched.filter((item) => item.caps.length === 0)
      if (capFilter) return searched.filter((item) => item.caps.includes(capFilter))
      return searched
    }, [remoteModels, query, capFilter, rank])

    const filterDescriptors: CapabilityDescriptor[] = React.useMemo(
      () => [...caps, { value: UNCLASSIFIED, label: unclassifiedLabel }],
      [caps, unclassifiedLabel],
    )

    const pendingRemote = React.useMemo(() => {
      const expanded = providers.find((provider) => provider.id === expandedProviderId)
      if (!expanded) return []
      const existingIds = new Set(
        models
          .filter((model) => model.providerId === expanded.id)
          .map((model) => model.externalId),
      )
      return filteredRemote.filter((remote) => !existingIds.has(remote.id))
    }, [filteredRemote, providers, expandedProviderId, models])

    const resetDraft = React.useCallback(() => {
      setDraft(null)
      setDraftError(null)
    }, [])

    const toggleProvider = (providerId: string) => {
      const next = expandedProviderId === providerId ? null : providerId
      onExpandedProviderChange(next)
      setQuery('')
      setCapFilter(null)
      setCatalogOpen(false)
      resetDraft()
    }

    const openAddDraft = (providerId: string, remote: ModelRegistryRemoteModel) => {
      setDraft({
        key: `remote:${remote.id}`,
        mode: 'add',
        providerId,
        externalId: remote.id,
        label: '',
        caps: [...remote.caps],
        reasoningEffort: '',
      })
      setDraftError(null)
    }

    const openManualDraft = (providerId: string) => {
      setDraft({
        key: `manual:${providerId}`,
        mode: 'add',
        providerId,
        externalId: '',
        label: '',
        caps: caps[0] ? [caps[0].value] : [],
        reasoningEffort: '',
      })
      setDraftError(null)
    }

    const openEditDraft = (model: ModelRegistryModel) => {
      setDraft({
        key: `model:${model.id}`,
        mode: 'edit',
        providerId: model.providerId,
        externalId: model.externalId,
        label: model.label ?? '',
        caps: [...model.caps],
        reasoningEffort: model.reasoningEffort ?? '',
        model,
      })
      setDraftError(null)
    }

    const toggleDraftCap = (value: string) => {
      setDraft((current) =>
        current
          ? {
              ...current,
              caps: current.caps.includes(value)
                ? current.caps.filter((entry) => entry !== value)
                : [...current.caps, value],
            }
          : current,
      )
    }

    const submitDraft = () => {
      if (!draft) return
      const externalId = draft.externalId.trim()
      if (!externalId) {
        setDraftError(externalIdLabel)
        return
      }
      const payload: ModelRegistryDraft = {
        externalId,
        label: draft.label.trim() || undefined,
        caps: draft.caps,
        reasoningEffort: draft.reasoningEffort.trim(),
      }
      if (draft.mode === 'add') {
        onAddModel(draft.providerId, payload)
      } else if (draft.model) {
        onUpdateModel(draft.model, payload)
      }
      resetDraft()
    }

    const renderDraftPanel = () => {
      if (!draft) return null
      const confirmDisabled = draft.mode === 'add' && !draft.externalId.trim()
      return (
        <div
          data-as="model-registry-draft"
          className="flex flex-col gap-3 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1 space-y-1 text-xs">
              <span className="text-[var(--as-muted-fg)]">{externalIdLabel}</span>
              <input
                type="text"
                value={draft.externalId}
                disabled={draft.mode === 'edit'}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, externalId: event.target.value } : current,
                  )
                }
                className="w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 font-mono text-xs text-[var(--as-fg)] disabled:opacity-60"
              />
            </label>
            <label className="min-w-0 flex-1 space-y-1 text-xs">
              <span className="text-[var(--as-muted-fg)]">{labelLabel}</span>
              <input
                type="text"
                value={draft.label}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, label: event.target.value } : current,
                  )
                }
                className="w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-xs text-[var(--as-fg)]"
              />
            </label>
          </div>
          <div className="space-y-1">
            <span className="text-[var(--as-muted-fg)]">{capsLabel}</span>
            <CapabilityChips
              caps={caps}
              selected={draft.caps}
              onToggle={toggleDraftCap}
              ariaLabel={capsLabel}
            />
          </div>
          {reasoningEffortOptions ? (
            <label className="space-y-1 text-xs">
              <span className="text-[var(--as-muted-fg)]">{reasoningEffortLabel}</span>
              <input
                type="text"
                value={draft.reasoningEffort}
                placeholder={reasoningEffortPlaceholder}
                list="as-reasoning-effort-options"
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, reasoningEffort: event.target.value } : current,
                  )
                }
                className="w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-xs text-[var(--as-fg)]"
              />
              <datalist id="as-reasoning-effort-options">
                {reasoningEffortOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
          ) : null}
          {draftError ? (
            <p className="text-xs text-[var(--as-danger)]">{draftError}</p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={resetDraft}>
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              disabled={confirmDisabled}
              onClick={submitDraft}
            >
              <Plus aria-hidden />
              {draft.mode === 'add' ? addDraftLabel : saveLabel}
            </Button>
          </div>
        </div>
      )
    }

    const renderRemoteRows = (providerId: string) => {
      const providerModels = models.filter((model) => model.providerId === providerId)
      const existingFor = (externalId: string) =>
        providerModels.find((model) => model.externalId === externalId)
      if (remoteState === 'loading') {
        return (
          <p className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--as-muted-fg)]">
            <Spinner size="sm" />
            {remoteLoadingLabel}
          </p>
        )
      }
      if (remoteState === 'error') {
        return (
          <div className="flex items-center justify-between gap-2 py-2">
            <p className="truncate text-xs text-[var(--as-danger)]">{remoteError}</p>
            {onRetryRemote ? (
              <Button variant="outline" size="sm" onClick={onRetryRemote}>
                {retryLabel}
              </Button>
            ) : null}
          </div>
        )
      }
      if (filteredRemote.length === 0) {
        return (
          <p className="py-3 text-center text-xs text-[var(--as-muted-fg)]">
            {remoteEmptyLabel}
          </p>
        )
      }
      return (
        <div data-as="model-registry-catalog" className="flex flex-col gap-1">
          {filteredRemote.map((remote) => {
            const existing = existingFor(remote.id)
            const expandedRow = draft?.key === `remote:${remote.id}`
            return (
              <div key={remote.id} className="flex flex-col gap-2">
                <div className="flex min-w-0 items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--as-fg)]">
                    {remote.id}
                  </span>
                  <CapabilityChips
                    variant="badge"
                    caps={remote.caps.map(descriptorFor)}
                    selected={remote.caps}
                  />
                  <button
                    type="button"
                    aria-expanded={expandedRow}
                    aria-label={`${existing ? editLabel : configureLabel} ${remote.id}`}
                    onClick={() => {
                      if (expandedRow) {
                        resetDraft()
                      } else if (existing) {
                        openEditDraft(existing)
                      } else {
                        openAddDraft(providerId, remote)
                      }
                    }}
                    className="cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
                  >
                    {expandedRow ? (
                      <ChevronDown className="size-4" aria-hidden />
                    ) : (
                      <ChevronRight className="size-4" aria-hidden />
                    )}
                  </button>
                  {existing?.enabled ? (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--as-muted-fg)]">
                      <Check className="size-3" aria-hidden />
                      {addedLabel}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`${addLabel} ${remote.id}`}
                      onClick={() =>
                        onAddModel(providerId, { externalId: remote.id, caps: remote.caps })
                      }
                    >
                      <Plus aria-hidden />
                      {addLabel}
                    </Button>
                  )}
                </div>
                {expandedRow ? renderDraftPanel() : null}
              </div>
            )
          })}
        </div>
      )
    }

    const renderModelRow = (model: ModelRegistryModel) => {
      const expandedRow = draft?.key === `model:${model.id}`
      return (
        <div key={model.id} className="flex flex-col gap-2">
          <div
            className={cn(
              'flex min-w-0 items-center gap-2 rounded-[var(--as-radius-sm)] px-2 py-1.5 text-sm',
              model.missing && 'opacity-50',
            )}
          >
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--as-fg)]">
              {model.externalId}
            </span>
            {model.missing ? (
              <span className="text-xs text-[var(--as-warning)]">{missingLabel}</span>
            ) : null}
            <CapabilityChips
              variant="badge"
              caps={model.caps.map(descriptorFor)}
              selected={model.caps}
            />
            <button
              type="button"
              aria-expanded={expandedRow}
              aria-label={`${editLabel} ${model.externalId}`}
              onClick={() => (expandedRow ? resetDraft() : openEditDraft(model))}
              className="cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`${removeLabel} ${model.externalId}`}
              onClick={() => {
                if (expandedRow) resetDraft()
                onDeleteModel(model)
              }}
              className="cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </div>
          {expandedRow ? renderDraftPanel() : null}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        data-as="model-registry"
        className={cn('flex w-full flex-col gap-4', className)}
      >
        {providers.map((provider) => {
          const expanded = expandedProviderId === provider.id
          const providerModels = models.filter((model) => model.providerId === provider.id)
          return (
            <div
              key={provider.id}
              data-as="model-registry-provider"
              className={cn(
                'rounded-[var(--as-radius-lg)] border bg-[var(--as-surface)] transition-all',
                expanded
                  ? 'border-[var(--as-primary)] shadow-[var(--as-shadow-1)]'
                  : 'border-[var(--as-border)]',
              )}
            >
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => toggleProvider(provider.id)}
                className="group flex w-full cursor-pointer items-center gap-4 p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-[var(--as-radius)] transition-colors',
                    expanded
                      ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
                      : 'bg-[var(--as-muted)] text-[var(--as-muted-fg)] group-hover:bg-[var(--as-primary)]/10 group-hover:text-[var(--as-primary)]',
                  )}
                >
                  {expanded ? (
                    <ChevronDown className="size-5" aria-hidden />
                  ) : (
                    <ChevronRight className="size-5" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--as-fg)]">
                    {provider.name}
                    {provider.type ? (
                      <span className="rounded-full border border-[var(--as-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
                        {provider.type}
                      </span>
                    ) : null}
                    {providerModels.length ? (
                      <span className="rounded-full bg-[var(--as-muted)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--as-muted-fg)]">
                        {providerModels.filter((model) => model.enabled).length}/
                        {providerModels.length}
                      </span>
                    ) : null}
                  </span>
                  {provider.baseUrl ? (
                    <span className="block truncate font-mono text-xs text-[var(--as-muted-fg)]">
                      {provider.baseUrl}
                    </span>
                  ) : null}
                </span>
              </button>
              {expanded ? (
                <div className="as-anim-fade flex flex-col gap-3 border-t border-[var(--as-border)] p-4">
                  {providerModels.length === 0 ? (
                    <p className="text-xs text-[var(--as-muted-fg)]">{emptyProviderLabel}</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {providerModels.map(renderModelRow)}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 border-t border-[var(--as-border)] pt-3">
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-expanded={catalogOpen}
                        onClick={() => setCatalogOpen((open) => !open)}
                      >
                        <Plus aria-hidden />
                        {browseLabel}
                      </Button>
                    </div>
                    {catalogOpen ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <SearchInput
                            value={query}
                            onChange={(next) => {
                              setQuery(next)
                              resetDraft()
                            }}
                            placeholder={searchPlaceholder}
                            ariaLabel={searchLabel}
                            className="max-w-xs flex-1"
                          />
                          <CapabilityChips
                            caps={filterDescriptors}
                            selected={capFilter ? [capFilter] : []}
                            onToggle={(value) =>
                              setCapFilter((current) => (current === value ? null : value))
                            }
                            ariaLabel={capFilterLabel}
                          />
                          <Button variant="ghost" size="sm" onClick={() => openManualDraft(provider.id)}>
                            <Plus aria-hidden />
                            {manualAddLabel}
                          </Button>
                          {onAddAll ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={remoteState !== 'ready' || pendingRemote.length === 0}
                              onClick={() =>
                                onAddAll(
                                  provider.id,
                                  pendingRemote.map((remote) => ({
                                    externalId: remote.id,
                                    caps: remote.caps,
                                  })),
                                )
                              }
                            >
                              <Plus aria-hidden />
                              {addAllLabel} ({pendingRemote.length})
                            </Button>
                          ) : null}
                        </div>
                        {draft?.key.startsWith('manual:') ? renderDraftPanel() : null}
                        {renderRemoteRows(provider.id)}
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
        {providers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-[var(--as-muted-fg)]">{providersEmptyLabel}</p>
            {emptyAction}
          </div>
        ) : null}
      </div>
    )
  },
)
