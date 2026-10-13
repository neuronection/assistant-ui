import * as React from 'react'
import { Check, ChevronDown, ChevronRight, ChevronUp, Library, Pencil, PenLine, Plus, X } from 'lucide-react'
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
  /** Read-only provider: hides Add/Edit/Remove (e.g. org-managed providers). */
  readOnly?: boolean
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
  /** The model's decision transport (e.g. `systemone`) — set when `caps`
   * carries the app's decision capability. */
  decisionTransport?: string
  /** App-defined extra fields (see `extraFields`), carried verbatim. */
  extra?: Record<string, string>
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
  decisionTransport?: string
  extra?: Record<string, string>
}

export interface ModelRegistryPatch {
  label?: string
  caps?: string[]
  reasoningEffort?: string
  temperature?: number | null
  maxTokens?: number | null
  decisionTransport?: string
  extra?: Record<string, string>
}

export interface ModelRegistryExtraField {
  key: string
  label: string
  placeholder?: string
  /** Render a multi-line textarea instead of a single-line input. */
  multiline?: boolean
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
    /** Toggle a model's enabled flag; renders the row checkbox when set. */
    onToggleEnabled?: (model: ModelRegistryModel, enabled: boolean) => void
    enableLabel?: string
    /** App-declared extra fields rendered in the add/edit modal (e.g. a
     *  description line); values ride `extra` on Draft/Patch/Model. */
    extraFields?: ModelRegistryExtraField[]
  reasoningEffortOptions?: string[]
  addLabel?: string
  addAllLabel?: string
  addTitle?: string
  editTitle?: string
  selectModelLabel?: string
  manualIdToggleLabel?: string
  /** Shown on the manual↔catalog toggle when manual entry is active
   * (returning to the catalog picker). */
  useCatalogLabel?: string
  /** Visually-hidden prefix for the provider context banner. */
  providerContextLabel?: string
  editLabel?: string
  removeLabel?: string
  missingLabel?: string
  capsLabel?: string
  /** Muted explainer under the capability chips (what they gate). */
  capsHint?: string
  /** Capability values that are standalone kinds (e.g. decision, stt, tts,
   * embeddings): selecting one makes the model exactly that kind — the
   * chat-family caps combine, standalone kinds replace everything (the
   * family's slot-separation law, D4, expressed in the form). */
  standaloneCaps?: string[]
  /** Label for the standalone-kinds cluster (`standaloneCaps`). */
  standaloneLabel?: string
  /** Selection implications between combinable caps (e.g.
   * `{ vision: ['text'], tools: ['text'] }` — every vision/tool-capable
   * model is a text model too): selecting a key auto-enables its values,
   * and deselecting a value deselects everything that implies it. */
  capImplications?: Record<string, string[]>
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
  /** The app's shipping decision transport (e.g. `systemone`): when set,
   * models with the decision capability render a read-only transport row
   * and carry the value on Draft/Patch. */
  decisionTransport?: string
  decisionTransportLabel?: string
  saveLabel?: string
  cancelLabel?: string
  addDraftLabel?: string
  providersEmptyLabel?: string
  emptyAction?: React.ReactNode
  className?: string
}

/**
 * Capabilities whose models take generation-side parameters (temperature,
 * max tokens, reasoning effort). Other capabilities (stt/tts/embeddings/
 * decision) render without those sections — plan 26 follow-up: options
 * are shown per capability, never always.
 */
const PARAMETRIC_CAPS = new Set(['text', 'vision', 'tools'])

/** Whether any selected capability takes generation-side parameters. */
const hasParametricCaps = (caps: string[]): boolean =>
  caps.some((cap) => PARAMETRIC_CAPS.has(cap))

/**
 * Catalog normalization for `standaloneCaps` (remote model pick): a caps
 * set may carry either one standalone kind (alone) or any combination of
 * the chat-family caps — never both, never two standalone kinds.
 */
const normalizeCaps = (next: string[], standalone: ReadonlySet<string>): string[] => {
  const standaloneHit = next.find((cap) => standalone.has(cap))
  return standaloneHit ? [standaloneHit] : next
}

/**
 * `capImplications` closure over a selection toggle: selecting a cap
 * enables its implications (vision → text); deselecting a cap drops
 * everything that implies it (text off → vision + tools off). Idempotent
 * for caps the implications do not mention.
 */
const applyImplications = (
  next: string[],
  implications: Record<string, string[]>,
  toggled: string,
  selected: boolean,
): string[] => {
  if (Object.keys(implications).length === 0) return next
  if (selected) {
    const implied = implications[toggled] ?? []
    return [...next, ...implied.filter((cap) => !next.includes(cap))]
  }
  const dependents = Object.entries(implications)
    .filter(([, values]) => values.includes(toggled))
    .map(([cap]) => cap)
  return dependents.length === 0 ? next : next.filter((cap) => cap !== toggled && !dependents.includes(cap))
}

/** ON-implications folded over a whole caps set (catalog picks). */
const withImplications = (
  caps: string[],
  implications: Record<string, string[]>,
): string[] => {
  let out = [...caps]
  for (const cap of caps) {
    out = applyImplications(out, implications, cap, true)
  }
  return out
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
  decisionTransport: string
  extra: Record<string, string>
  extraTouched: boolean
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
      onToggleEnabled,
      enableLabel = 'Enabled',
      extraFields,
      reasoningEffortOptions,
      addLabel = 'Add model',
      addAllLabel = 'Add all',
      addTitle = 'Add model',
      editTitle = 'Edit model',
      selectModelLabel = 'Model',
      manualIdToggleLabel = 'Enter the model id manually',
      useCatalogLabel = 'Pick from the catalog',
      providerContextLabel = 'Provider',
      editLabel = 'Edit',
      removeLabel = 'Remove',
      missingLabel = 'Missing',
      capsLabel = 'Capabilities',
      capsHint,
      standaloneCaps,
      standaloneLabel = 'Standalone',
      capImplications,
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
      decisionTransport,
      decisionTransportLabel = 'Transport',
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

    const standaloneSet = React.useMemo(
      () => new Set(standaloneCaps ?? []),
      [standaloneCaps],
    )
    const combinableCaps = React.useMemo(
      () => caps.filter((cap) => !standaloneSet.has(cap.value)),
      [caps, standaloneSet],
    )
    const standaloneDescriptors = React.useMemo(
      () => caps.filter((cap) => standaloneSet.has(cap.value)),
      [caps, standaloneSet],
    )

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
      const firstCap = combinableCaps[0] ?? caps[0]
      setModal({
        mode: 'add',
        providerId,
        externalId: '',
        label: '',
        caps: firstCap ? [firstCap.value] : [],
        reasoningEffort: '',
        reasoningCustom: false,
        temperature: '',
        maxTokens: '',
        decisionTransport: '',
        extra: {},
        extraTouched: false,
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
        decisionTransport: model.decisionTransport ?? '',
        extra: { ...(model.extra ?? {}) },
        extraTouched: false,
        model,
        manual: false,
      })
      setDraftError(null)
    }

    const patchExtraField = (key: string, value: string) => {
      setModal((current) =>
        current
          ? { ...current, extra: { ...current.extra, [key]: value }, extraTouched: true }
          : current,
      )
    }

    const selectRemote = (remoteId: string) => {
      const remote = (remoteModels ?? []).find((entry) => entry.id === remoteId)
      setModal((current) => {
        if (!current) return current
        const normalized = remote ? normalizeCaps([...remote.caps], standaloneSet) : current.caps
        // catalog caps pass through the ON-implications (a vision/tool
        // catalog entry carries its text base)
        const nextCaps = withImplications(normalized, capImplications ?? {})
        return {
          ...current,
          externalId: remoteId,
          caps: nextCaps,
          decisionTransport: nextCaps.includes('decision')
            ? (decisionTransport ?? current.decisionTransport ?? '')
            : '',
          label: current.labelTouched ? current.label : beautifyId(remoteId),
        }
      })
    }

    const toggleDraftCap = (value: string) => {
      setModal((current) => {
        if (!current) return current
        const isStandalone = standaloneSet.has(value)
        const raw = isStandalone
          ? // a standalone kind replaces everything (or clears when toggled off)
            current.caps.includes(value)
            ? current.caps.filter((entry) => entry !== value)
            : [value]
          : current.caps.includes(value)
            ? current.caps.filter((entry) => entry !== value)
            : [...current.caps.filter((entry) => !standaloneSet.has(entry)), value]
        const nextCaps = isStandalone
          ? raw
          : applyImplications(raw, capImplications ?? {}, value, !current.caps.includes(value))
        return {
          ...current,
          caps: nextCaps,
          // The decision capability stamps the app's shipping transport;
          // without it there is no transport to carry.
          decisionTransport: nextCaps.includes('decision')
            ? (decisionTransport ?? current.decisionTransport ?? '')
            : '',
        }
      })
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
      const extra: Record<string, string> | undefined =
        modal.extraTouched || Object.values(modal.extra).some((value) => value.trim() !== '')
          ? { ...modal.extra }
          : undefined
      const isDecision = modal.caps.includes('decision')
      const payload: ModelRegistryDraft = {
        externalId,
        label: modal.label.trim() || undefined,
        caps: modal.caps,
        reasoningEffort: modal.reasoningEffort.trim(),
        temperature: numberOr(modal.temperature),
        maxTokens: numberOr(modal.maxTokens),
        ...(isDecision && modal.decisionTransport
          ? { decisionTransport: modal.decisionTransport }
          : {}),
        ...(extra !== undefined ? { extra } : {}),
      }
      if (modal.mode === 'add') {
        onAddModel(modal.providerId, payload)
      } else if (modal.model) {
        const patch: ModelRegistryPatch = { ...payload }
        if (isDecision) {
          patch.decisionTransport = modal.decisionTransport || decisionTransport
        } else {
          patch.decisionTransport = undefined
        }
        onUpdateModel(modal.model, patch)
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
              {provider ? (
                <div
                  data-as="model-registry-provider-context"
                  className="flex min-w-0 items-center gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-muted)]/50 px-3 py-2"
                >
                  <span className="sr-only">{providerContextLabel}:</span>
                  <span className="shrink-0 text-xs font-medium text-[var(--as-fg)]">
                    {provider.name}
                  </span>
                  {provider.baseUrl ? (
                    <>
                      <span aria-hidden className="text-[var(--as-border)]">
                        ·
                      </span>
                      <span className="truncate font-mono text-[10px] text-[var(--as-muted-fg)]">
                        {provider.baseUrl}
                      </span>
                    </>
                  ) : null}
                </div>
              ) : null}
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
                        data-as="model-registry-manual-toggle"
                        className="inline-flex cursor-pointer items-center gap-1.5 self-end rounded-[var(--as-radius)] border border-[var(--as-border)] bg-transparent px-2.5 py-1 text-xs text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
                        onClick={() => setModal((c) => (c ? { ...c, manual: true } : c))}
                      >
                        <PenLine className="size-3.5" aria-hidden />
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
                      data-as="model-registry-manual-toggle"
                      className="inline-flex cursor-pointer items-center gap-1.5 self-end rounded-[var(--as-radius)] border border-[var(--as-border)] bg-transparent px-2.5 py-1 text-xs text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
                      onClick={() => setModal((c) => (c ? { ...c, manual: !c.manual } : c))}
                    >
                      {modal.manual ? (
                        <>
                          <Library className="size-3.5" aria-hidden />
                          {useCatalogLabel}
                        </>
                      ) : (
                        <>
                          <PenLine className="size-3.5" aria-hidden />
                          {manualIdToggleLabel}
                        </>
                      )}
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
                {standaloneDescriptors.length > 0 ? (
                  <>
                    <CapabilityChips
                      caps={combinableCaps}
                      selected={modal.caps}
                      onToggle={toggleDraftCap}
                      ariaLabel={capsLabel}
                    />
                    <p className="flex items-center gap-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
                      <span className="h-px flex-1 bg-[var(--as-border)]" aria-hidden />
                      {standaloneLabel}
                      <span className="h-px flex-1 bg-[var(--as-border)]" aria-hidden />
                    </p>
                    <CapabilityChips
                      caps={standaloneDescriptors}
                      selected={modal.caps}
                      onToggle={toggleDraftCap}
                      ariaLabel={standaloneLabel}
                    />
                  </>
                ) : (
                  <CapabilityChips
                    caps={caps}
                    selected={modal.caps}
                    onToggle={toggleDraftCap}
                    ariaLabel={capsLabel}
                  />
                )}
                {modal.caps.includes('decision') && decisionTransport ? (
                  <p className="flex items-center gap-1.5 text-xs text-[var(--as-muted-fg)]">
                    <span>{decisionTransportLabel}:</span>
                    <code className="rounded-[var(--as-radius-sm)] bg-[var(--as-muted)] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--as-fg)]">
                      {decisionTransport}
                    </code>
                  </p>
                ) : null}
                {capsHint ? (
                  <p className="text-xs text-[var(--as-muted-fg)]">{capsHint}</p>
                ) : null}
              </div>
              {hasParametricCaps(modal.caps) && reasoningEffortOptions ? (
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
              {hasParametricCaps(modal.caps) ? (
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
              ) : null}
              {(extraFields ?? []).map((field) => {
                const value = modal.extra[field.key] ?? ''
                const common =
                  'w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)]'
                return (
                  <label key={field.key} className="block space-y-1 text-sm">
                    <span className="text-sm font-medium text-[var(--as-fg)]">{field.label}</span>
                    {field.multiline ? (
                      <textarea
                        rows={2}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => patchExtraField(field.key, event.target.value)}
                        className={common}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => patchExtraField(field.key, event.target.value)}
                        className={common}
                      />
                    )}
                  </label>
                )
              })}
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
                  {!provider.readOnly && providerModels.length === 0 ? (
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
                        {onToggleEnabled && !provider.readOnly ? (
                          <input
                            type="checkbox"
                            aria-label={`${enableLabel} — ${model.externalId}`}
                            checked={model.enabled}
                            onChange={(event) => onToggleEnabled(model, event.target.checked)}
                            className="size-4 shrink-0 cursor-pointer accent-[var(--as-primary)]"
                          />
                        ) : null}
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
                        {!provider.readOnly ? (
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`${editLabel} ${model.externalId}`}
                            onClick={() => openEditModal(model)}
                          >
                            <Pencil aria-hidden />
                            {editLabel}
                          </Button>
                        ) : null}
                        {!provider.readOnly ? (
                          <button
                            type="button"
                            aria-label={`${removeLabel} ${model.externalId}`}
                            onClick={() => onDeleteModel(model)}
                            className="cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
                          >
                            <X className="size-4" aria-hidden />
                          </button>
                        ) : null}
                      </div>
                    )
                  })}
                  {!provider.readOnly ? (
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
                  ) : null}
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

