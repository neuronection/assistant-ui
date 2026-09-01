import * as React from 'react'
import { Check, ChevronDown, ChevronRight, ChevronUp, Pencil, Plus, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button'
import { CapabilityChips, type CapabilityDescriptor } from '../capability-chips'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../modal/Modal'
import { ModelPicker, type ModelPickerProvider } from '../model-picker/ModelPicker'
import { Spinner } from '../spinner'
import { beautifyId } from '../../lib/fuzzy'

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
  temperature?: number | null
  maxTokens?: number | null
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
  temperature?: number | null
  maxTokens?: number | null
}

export interface ModelRegistryPatch {
  label?: string
  caps?: string[]
  reasoningEffort?: string
  temperature?: number | null
  maxTokens?: number | null
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
  reasoningEffortOptions?: string[]
  addLabel?: string
  addAllLabel?: string
  addTitle?: string
  editTitle?: string
  selectModelLabel?: string
  manualIdToggleLabel?: string
  editLabel?: string
  removeLabel?: string
  missingLabel?: string
  capsLabel?: string
  /** Muted explainer under the capability chips (what they gate). */
  capsHint?: string
  searchPlaceholder?: string
  searchLabel?: string
  emptyProviderLabel?: string
  externalIdRequiredLabel?: string
  remoteEmptyLabel?: string
  remoteLoadingLabel?: string
  retryLabel?: string
  customOptionLabel?: string
  temperatureLabel?: string
  maxTokensLabel?: string
  labelLabel?: string
  reasoningEffortLabel?: string
  saveLabel?: string
  cancelLabel?: string
  addDraftLabel?: string
  providersEmptyLabel?: string
  emptyAction?: React.ReactNode
  className?: string
}

const CUSTOM = '__custom__'
interface NumberFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onClear: () => void
  step?: string
  min?: string
  max?: string
}

function NumberField({
  label,
  value,
  onChange,
  onClear,
  step = '1',
  min,
  max,
}: NumberFieldProps) {
  const bump = (delta: number) => {
    const current = value.trim() === '' ? 0 : Number(value)
    if (!Number.isFinite(current)) return
    const next = current + delta
    onChange(String(min != null && next < Number(min) ? Number(min) : next))
  }
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-sm font-medium text-[var(--as-fg)]">{label}</span>
      <span className="relative block">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 pr-16 text-sm text-[var(--as-fg)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="absolute inset-y-0 right-1.5 flex items-center gap-1">
          {value !== '' ? (
            <button
              type="button"
              aria-label={`${label} clear`}
              onClick={onClear}
              className="cursor-pointer text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
          <span className="flex flex-col">
            <button
              type="button"
              aria-label={`${label} increment`}
              onClick={() => bump(Number(step))}
              className="cursor-pointer leading-none text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]"
            >
              <ChevronUp className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`${label} decrement`}
              onClick={() => bump(-Number(step))}
              className="cursor-pointer leading-none text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]"
            >
              <ChevronDown className="size-3.5" aria-hidden />
            </button>
          </span>
        </span>
      </span>
    </label>
  )
}

interface ModalState {
  mode: 'add' | 'edit'
  providerId: string
  externalId: string
  label: string
  caps: string[]
  reasoningEffort: string
  reasoningCustom: boolean
  temperature: string
  maxTokens: string
  labelTouched: boolean
  model?: ModelRegistryModel
  manual: boolean
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
      reasoningEffortOptions,
      addLabel = 'Add model',
      addAllLabel = 'Add all',
      addTitle = 'Add model',
      editTitle = 'Edit model',
      selectModelLabel = 'Model',
      manualIdToggleLabel = 'Enter the model id manually',
      editLabel = 'Edit',
      removeLabel = 'Remove',
      missingLabel = 'Missing',
      capsLabel = 'Capabilities',
      capsHint,
      searchPlaceholder = 'Search models…',
      searchLabel = 'Search models',
      emptyProviderLabel = 'No models yet — use Add model to pick from the live catalog.',
      externalIdRequiredLabel = 'The model id is required.',
      remoteEmptyLabel = 'The provider listed no models.',
      remoteLoadingLabel = 'Loading models…',
      retryLabel = 'Retry',
      customOptionLabel = 'Custom…',
      temperatureLabel = 'Temperature',
      maxTokensLabel = 'Max tokens',
      labelLabel = 'Display label',
      reasoningEffortLabel = 'Reasoning effort',
      saveLabel = 'Save',
      cancelLabel = 'Cancel',
      addDraftLabel = 'Add model',
      providersEmptyLabel = 'No providers yet.',
      emptyAction,
      className,
    },
    ref,
  ) {
    const [modal, setModal] = React.useState<ModalState | null>(null)
    const [draftError, setDraftError] = React.useState<string | null>(null)

    const descriptorFor = React.useCallback(
      (value: string): CapabilityDescriptor =>
        caps.find((cap) => cap.value === value) ?? { value, label: value },
      [caps],
    )

    const resetModal = React.useCallback(() => {
      setModal(null)
      setDraftError(null)
    }, [])

    const toggleProvider = (providerId: string) => {
      onExpandedProviderChange(expandedProviderId === providerId ? null : providerId)
    }

    const openAddModal = (providerId: string) => {
      setModal({
        mode: 'add',
        providerId,
        externalId: '',
        label: '',
        caps: caps[0] ? [caps[0].value] : [],
        reasoningEffort: '',
        reasoningCustom: false,
        temperature: '',
        maxTokens: '',
        labelTouched: false,
        manual: false,
      })
      setDraftError(null)
    }

    const openEditModal = (model: ModelRegistryModel) => {
      setModal({
        mode: 'edit',
        providerId: model.providerId,
        externalId: model.externalId,
        label: model.label ?? '',
        caps: [...model.caps],
        labelTouched: true,
        reasoningEffort: model.reasoningEffort ?? '',
        reasoningCustom:
          model.reasoningEffort != null &&
          model.reasoningEffort !== '' &&
          !(reasoningEffortOptions ?? []).includes(model.reasoningEffort),
        temperature: model.temperature != null ? String(model.temperature) : '',
        maxTokens: model.maxTokens != null ? String(model.maxTokens) : '',
        model,
        manual: false,
      })
      setDraftError(null)
    }

    const selectRemote = (remoteId: string) => {
      const remote = (remoteModels ?? []).find((entry) => entry.id === remoteId)
      setModal((current) =>
        current
          ? {
              ...current,
              externalId: remoteId,
              caps: remote ? [...remote.caps] : current.caps,
              label: current.labelTouched ? current.label : beautifyId(remoteId),
            }
          : current,
      )
    }

    const toggleDraftCap = (value: string) => {
      setModal((current) =>
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

    const patchField = (field: keyof ModalState, value: string) => {
      setModal((current) => (current ? { ...current, [field]: value } : current))
    }

    const numberOr = (raw: string): number | null => {
      const trimmed = raw.trim()
      if (!trimmed) return null
      const parsed = Number(trimmed)
      return Number.isFinite(parsed) ? parsed : null
    }

    const submitModal = () => {
      if (!modal) return
      const externalId = modal.externalId.trim()
      if (!externalId) {
        setDraftError(externalIdRequiredLabel)
        return
      }
      const payload: ModelRegistryDraft = {
        externalId,
        label: modal.label.trim() || undefined,
        caps: modal.caps,
        reasoningEffort: modal.reasoningEffort.trim(),
        temperature: numberOr(modal.temperature),
        maxTokens: numberOr(modal.maxTokens),
      }
      if (modal.mode === 'add') {
        onAddModel(modal.providerId, payload)
      } else if (modal.model) {
        onUpdateModel(modal.model, payload)
      }
      resetModal()
    }

    const remoteForProvider = (provider: ModelRegistryProvider): ModelPickerProvider[] => {
      const items = remoteModels ?? []
      if (items.length === 0) return []
      return [
        {
          id: provider.id,
          name: provider.name,
          models: items.map((entry) => ({
            id: entry.id,
            name: entry.id,
            capabilities: entry.caps,
          })),
        },
      ]
    }

    const renderModal = () => {
      if (!modal) return null
      const provider = providers.find((entry) => entry.id === modal.providerId)
      const catalog = provider ? remoteForProvider(provider) : []
      const pendingCount = (remoteModels ?? []).filter(
        (remote) =>
          !models.some(
            (model) => model.providerId === modal.providerId && model.externalId === remote.id,
          ),
      ).length
      return (
        <Modal open onOpenChange={(open: boolean) => (!open ? resetModal() : undefined)}>
          <ModalContent className="max-h-[85vh] w-full max-w-lg overflow-y-auto">
            <ModalHeader>
              <ModalTitle className="text-base">
                {modal.mode === 'add' ? addTitle : `${editTitle} — ${modal.externalId}`}
              </ModalTitle>
            </ModalHeader>
            <div className="flex flex-col gap-4 p-4">
              {modal.mode === 'add' ? (
                remoteState === 'loading' ? (
                  <p className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--as-muted-fg)]">
                    <Spinner size="sm" />
                    {remoteLoadingLabel}
                  </p>
                ) : remoteState === 'error' ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-[var(--as-danger)]">{remoteError}</p>
                      {onRetryRemote ? (
                        <Button variant="outline" size="sm" onClick={onRetryRemote}>
                          {retryLabel}
                        </Button>
                      ) : null}
                    </div>
                    {modal.manual ? (
                      <label className="block space-y-1 text-sm">
                        <span className="text-sm font-medium text-[var(--as-fg)]">
                          {selectModelLabel}
                        </span>
                        <input
                          type="text"
                          value={modal.externalId}
                          onChange={(event) => patchField('externalId', event.target.value)}
                          className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 font-mono text-sm text-[var(--as-fg)]"
                        />
                      </label>
                    ) : (
                      <button
                        type="button"
                        className="cursor-pointer self-start text-xs text-[var(--as-muted-fg)] underline-offset-2 hover:text-[var(--as-fg)] hover:underline"
                        onClick={() => setModal((c) => (c ? { ...c, manual: true } : c))}
                      >
                        {manualIdToggleLabel}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {modal.manual ? (
                      <label className="block space-y-1 text-sm">
                        <span className="text-sm font-medium text-[var(--as-fg)]">
                          {selectModelLabel}
                        </span>
                        <input
                          type="text"
                          value={modal.externalId}
                          onChange={(event) => patchField('externalId', event.target.value)}
                          className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 font-mono text-sm text-[var(--as-fg)]"
                        />
                      </label>
                    ) : (
                      <ModelPicker
                        providers={catalog}
                        value={modal.externalId}
                        onChange={(modelId) => (modelId ? selectRemote(modelId) : undefined)}
                        label={selectModelLabel}
                        searchPlaceholder={searchPlaceholder}
                        searchLabel={searchLabel}
                        emptyLabel={remoteEmptyLabel}
                      />
                    )}
                    <button
                      type="button"
                      className="cursor-pointer self-start text-xs text-[var(--as-muted-fg)] underline-offset-2 hover:text-[var(--as-fg)] hover:underline"
                      onClick={() => setModal((c) => (c ? { ...c, manual: !c.manual } : c))}
                    >
                      {manualIdToggleLabel}
                    </button>
                  </>
                )
              ) : (
                <p className="font-mono text-sm text-[var(--as-fg)]">{modal.externalId}</p>
              )}
              <label className="block space-y-1 text-sm">
                <span className="text-sm font-medium text-[var(--as-fg)]">{labelLabel}</span>
                <input
                  type="text"
                  value={modal.label}
                  onChange={(event) =>
                    setModal((current) =>
                      current
                        ? { ...current, label: event.target.value, labelTouched: true }
                        : current,
                    )
                  }
                  className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)]"
                />
              </label>
              <div className="space-y-1">
                <span className="text-sm font-medium text-[var(--as-fg)]">{capsLabel}</span>
                <CapabilityChips
                  caps={caps}
                  selected={modal.caps}
                  onToggle={toggleDraftCap}
                  ariaLabel={capsLabel}
                />
                {capsHint ? (
                  <p className="text-xs text-[var(--as-muted-fg)]">{capsHint}</p>
                ) : null}
              </div>
              {reasoningEffortOptions ? (
                <label className="block space-y-1 text-sm">
                  <span className="text-sm font-medium text-[var(--as-fg)]">
                    {reasoningEffortLabel}
                  </span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {modal.reasoningCustom ? (
                      <input
                        type="text"
                        value={modal.reasoningEffort}
                        placeholder={customOptionLabel}
                        onChange={(event) => patchField('reasoningEffort', event.target.value)}
                        className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 font-mono text-sm text-[var(--as-fg)] sm:flex-1"
                      />
                    ) : (
                      <select
                        value={modal.reasoningCustom ? CUSTOM : modal.reasoningEffort}
                        onChange={(event) =>
                          setModal((current) =>
                            current
                              ? {
                                  ...current,
                                  reasoningCustom: event.target.value === CUSTOM,
                                  reasoningEffort:
                                    event.target.value === CUSTOM
                                      ? current.reasoningEffort
                                      : event.target.value,
                                }
                              : current,
                          )
                        }
                        className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)] sm:w-40"
                      >
                        <option value="">—</option>
                        {reasoningEffortOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        <option value={CUSTOM}>{customOptionLabel}</option>
                      </select>
                    )}
                  </div>
                </label>
              ) : null}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumberField
                  label={temperatureLabel}
                  value={modal.temperature}
                  onChange={(value) => patchField('temperature', value)}
                  onClear={() => patchField('temperature', '')}
                  step="0.1"
                  min="0"
                  max="2"
                />
                <NumberField
                  label={maxTokensLabel}
                  value={modal.maxTokens}
                  onChange={(value) => patchField('maxTokens', value)}
                  onClear={() => patchField('maxTokens', '')}
                  step="256"
                  min="1"
                />
              </div>
              {draftError ? (
                <p role="alert" className="text-xs text-[var(--as-danger)]">
                  {draftError}
                </p>
              ) : null}
            </div>
            <ModalFooter>
              {modal.mode === 'add' && onAddAll ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={remoteState !== 'ready' || pendingCount === 0}
                  onClick={() => {
                    onAddAll(
                      modal.providerId,
                      (remoteModels ?? [])
                        .filter(
                          (remote) =>
                            !models.some(
                              (model) =>
                                model.providerId === modal.providerId &&
                                model.externalId === remote.id,
                            ),
                        )
                        .map((remote) => ({
                          externalId: remote.id,
                          caps: remote.caps,
                          reasoningEffort: '',
                          temperature: null,
                          maxTokens: null,
                        })),
                    )
                    resetModal()
                  }}
                >
                  <Plus aria-hidden />
                  {addAllLabel} ({pendingCount})
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={resetModal}>
                {cancelLabel}
              </Button>
              <Button size="sm" onClick={submitModal}>
                <Check aria-hidden />
                {modal.mode === 'add' ? addDraftLabel : saveLabel}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
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
                <div className="as-anim-fade flex flex-col gap-2 border-t border-[var(--as-border)] p-4">
                  {providerModels.length === 0 ? (
                    <p className="text-xs text-[var(--as-muted-fg)]">
                      {emptyProviderLabel}
                    </p>
                  ) : null}
                  {providerModels.map((model) => {
                    return (
                      <div
                        key={model.id}
                        className={cn(
                          'flex min-w-0 items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-3 py-2 text-sm',
                          model.missing && 'opacity-50',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--as-fg)]">
                          {model.externalId}
                        </span>
                        {model.missing ? (
                          <span className="text-xs text-[var(--as-warning)]">
                            {missingLabel}
                          </span>
                        ) : null}
                        <CapabilityChips
                          variant="badge"
                          caps={model.caps.map(descriptorFor)}
                          selected={model.caps}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`${editLabel} ${model.externalId}`}
                          onClick={() => openEditModal(model)}
                        >
                          <Pencil aria-hidden />
                          {editLabel}
                        </Button>
                        <button
                          type="button"
                          aria-label={`${removeLabel} ${model.externalId}`}
                          onClick={() => onDeleteModel(model)}
                          className="cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </div>
                    )
                  })}
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-expanded={modal?.mode === 'add' && modal.providerId === provider.id}
                      onClick={() => openAddModal(provider.id)}
                    >
                      <Plus aria-hidden />
                      {addLabel}
                    </Button>
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
        {renderModal()}
      </div>
    )
  },
)

