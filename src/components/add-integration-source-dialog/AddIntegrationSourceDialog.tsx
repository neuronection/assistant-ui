import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../modal/Modal'
import {
  EXTENSION_REF_STRATEGIES,
  type ExtensionRefStrategy,
} from '../../contracts'
import type { IntegrationSourceDraft } from '../../contracts'

export type AddIntegrationSourceKind = 'chooser' | 'git' | 'local'

export interface AddIntegrationSourceDialogLabels {
  title?: string
  description?: string
  urlLabel?: string
  localPathLabel?: string
  refStrategyLabel?: string
  refValueLabel?: string
  subpathLabel?: string
  secretLabel?: string
  submitLabel?: string
  cancelLabel?: string
  closeLabel?: string
  submittingLabel?: string
  refStrategyLabels?: Partial<Record<ExtensionRefStrategy, string>>
  kindPrompt?: string
  gitKindLabel?: string
  gitKindHint?: string
  localKindLabel?: string
  localKindHint?: string
}

export interface AddIntegrationSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: IntegrationSourceDraft) => void
  labels?: AddIntegrationSourceDialogLabels
  busy?: boolean
  error?: string | null
  /** Credential slot name for private-source secrets (sealed slot id). */
  secretSlot?: string | null
  className?: string
  /**
   * Source-kind mode (additive): 'chooser' asks the kind first with two
   * cards (the Add-provider pattern), 'git' / 'local' pin one kind and
   * show only its fields. Omitted = the legacy flat form (both fields).
   */
  kind?: AddIntegrationSourceKind
  /** Prefill for edit flows; merged over the empty draft when opened. */
  initial?: Partial<IntegrationSourceDraft>
}

const inputClass =
  'min-w-0 w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

const cardClass =
  'flex flex-1 flex-col items-start gap-0.5 rounded-[var(--as-radius-md)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2.5 text-left text-sm text-[var(--as-fg)] hover:border-[var(--as-focus-ring)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

const EMPTY_DRAFT: IntegrationSourceDraft = {
  url: '',
  localPath: '',
  refStrategy: 'release-tag',
  refValue: '',
  subpath: '',
  secretSlot: null,
  secretValue: '',
}

const LOCAL_DEFAULTS: Partial<IntegrationSourceDraft> = {
  refStrategy: 'branch',
  refValue: 'main',
}

/**
 * Presentational add-source dialog (ADR-0040 D13): ONE flow for https git
 * sources and the dev/test local-path variant — descriptor entry, ref
 * strategy, optional sealed credential slot; fetch/validate progress is the
 * host's (`busy` + `error` in, no fetching here). Discovered manifests
 * render through IntegrationSourcesList; consent hands off to
 * ConsentDialog. The draft is typed data out; apps validate it against the
 * family extension-sources.schema.json.
 */
export const AddIntegrationSourceDialog = React.forwardRef<
  HTMLFormElement,
  AddIntegrationSourceDialogProps
>(function AddIntegrationSourceDialog(
  {
    open,
    onOpenChange,
    onSubmit,
    labels,
    busy = false,
    error = null,
    secretSlot = null,
    className,
    kind,
    initial,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      title: labels?.title ?? 'Add extension source',
      description: labels?.description,
      urlLabel: labels?.urlLabel ?? 'https git URL',
      localPathLabel: labels?.localPathLabel ?? 'Local repo path (dev/test only)',
      refStrategyLabel: labels?.refStrategyLabel ?? 'Ref strategy',
      refValueLabel: labels?.refValueLabel ?? 'Tag pattern / branch / commit sha',
      subpathLabel: labels?.subpathLabel ?? 'Subpath inside the repo (optional)',
      secretLabel: labels?.secretLabel ?? 'Private-source token (sealed slot)',
      submitLabel: labels?.submitLabel ?? 'Add source',
      cancelLabel: labels?.cancelLabel ?? 'Cancel',
      closeLabel: labels?.closeLabel ?? 'Close',
      submittingLabel: labels?.submittingLabel ?? 'Fetching and validating…',
      refStrategyLabels: labels?.refStrategyLabels ?? {},
      kindPrompt: labels?.kindPrompt ?? 'What are you importing from?',
      gitKindLabel: labels?.gitKindLabel ?? 'Git repository',
      gitKindHint: labels?.gitKindHint ?? 'An https git source — pinned ref, digest-checked',
      localKindLabel: labels?.localKindLabel ?? 'Local folder',
      localKindHint:
        labels?.localKindHint ?? 'A local git checkout (dev/test only, allowlisted roots)',
    }),
    [labels],
  )

  const [draft, setDraft] = React.useState<IntegrationSourceDraft>(EMPTY_DRAFT)
  const [chosen, setChosen] = React.useState<'git' | 'local' | null>(null)

  React.useEffect(() => {
    if (!open) return
    const base: IntegrationSourceDraft = { ...EMPTY_DRAFT, secretSlot, ...(initial ?? {}) }
    if (!initial?.refStrategy && (kind === 'local' || (kind === 'chooser' && chosen === 'local'))) {
      Object.assign(base, LOCAL_DEFAULTS)
    }
    setDraft(base)
    setChosen(kind === 'git' || kind === 'local' ? kind : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, secretSlot])

  const pickKind = (next: 'git' | 'local') => {
    setChosen(next)
    if (next === 'local' && !initial?.refStrategy) {
      setDraft((current) => ({ ...current, ...LOCAL_DEFAULTS }))
    }
    if (next === 'git' && !initial?.refStrategy) {
      setDraft((current) => ({
        ...current,
        refStrategy: EMPTY_DRAFT.refStrategy,
        refValue: EMPTY_DRAFT.refValue,
      }))
    }
  }

  const showGit = !kind || kind === 'git' || (kind === 'chooser' && chosen === 'git')
  const showLocal = !kind || kind === 'local' || (kind === 'chooser' && chosen === 'local')
  const chooserPending = kind === 'chooser' && chosen === null

  const usable =
    (showGit && draft.url.trim().startsWith('https://')) ||
    (showLocal && draft.localPath.trim().startsWith('/'))
  const refValueOk =
    draft.refStrategy === 'release-tag' || draft.refValue.trim() !== ''

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (chooserPending || !usable || !refValueOk || busy) return
    onSubmit({
      ...draft,
      url: showGit ? draft.url.trim() : '',
      localPath: showLocal ? draft.localPath.trim() : '',
      refValue: draft.refValue.trim(),
      subpath: draft.subpath.trim(),
      secretValue: draft.secretValue?.trim() ? draft.secretValue.trim() : undefined,
    })
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className={className} closeLabel={t.closeLabel}>
        <ModalHeader>
          <ModalTitle>{t.title}</ModalTitle>
          {t.description ? <ModalDescription>{t.description}</ModalDescription> : null}
        </ModalHeader>
        {chooserPending ? (
          <div className="space-y-3 px-6 pb-6" data-testid="integration-source-kind-chooser">
            <p className="text-sm text-[var(--as-muted-fg)]">{t.kindPrompt}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={cardClass}
                data-testid="integration-source-kind-git"
                onClick={() => pickKind('git')}
              >
                <span className="font-medium">{t.gitKindLabel}</span>
                <span className="text-xs text-[var(--as-muted-fg)]">{t.gitKindHint}</span>
              </button>
              <button
                type="button"
                className={cardClass}
                data-testid="integration-source-kind-local"
                onClick={() => pickKind('local')}
              >
                <span className="font-medium">{t.localKindLabel}</span>
                <span className="text-xs text-[var(--as-muted-fg)]">{t.localKindHint}</span>
              </button>
            </div>
            <ModalFooter>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                {t.cancelLabel}
              </Button>
            </ModalFooter>
          </div>
        ) : (
        <form
          ref={ref}
          data-as="add-integration-source-dialog"
          data-testid="integration-source-form"
          onSubmit={submit}
        >
          <div className="space-y-3 px-6 pb-6">
          {showGit ? (
            <input
              className={inputClass}
              placeholder={t.urlLabel}
              aria-label={t.urlLabel}
              value={draft.url}
              onChange={(event) => setDraft({ ...draft, url: event.target.value })}
            />
          ) : null}
          {showLocal ? (
            <input
              className={inputClass}
              placeholder={t.localPathLabel}
              aria-label={t.localPathLabel}
              value={draft.localPath}
              onChange={(event) => setDraft({ ...draft, localPath: event.target.value })}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <select
              className={cn(inputClass, 'sm:w-auto sm:flex-none')}
              aria-label={t.refStrategyLabel}
              value={draft.refStrategy}
              onChange={(event) =>
                setDraft({ ...draft, refStrategy: event.target.value as ExtensionRefStrategy })
              }
            >
              {EXTENSION_REF_STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {t.refStrategyLabels[strategy] ?? strategy}
                </option>
              ))}
            </select>
            <input
              className={cn(inputClass, 'flex-1')}
              placeholder={t.refValueLabel}
              aria-label={t.refValueLabel}
              value={draft.refValue}
              onChange={(event) => setDraft({ ...draft, refValue: event.target.value })}
            />
          </div>
          <input
            className={inputClass}
            placeholder={t.subpathLabel}
            aria-label={t.subpathLabel}
            value={draft.subpath}
            onChange={(event) => setDraft({ ...draft, subpath: event.target.value })}
          />
          {draft.secretSlot ? (
            <input
              type="password"
              autoComplete="off"
              className={inputClass}
              placeholder={t.secretLabel}
              aria-label={t.secretLabel}
              value={draft.secretValue ?? ''}
              onChange={(event) => setDraft({ ...draft, secretValue: event.target.value })}
            />
          ) : null}
          {busy ? (
            <p
              role="status"
              className="text-xs text-[var(--as-muted-fg)]"
              data-testid="integration-source-busy"
            >
              {t.submittingLabel}
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="text-xs text-[var(--as-danger)]"
              data-testid="integration-source-error"
            >
              {error}
            </p>
          ) : null}
          </div>
          <ModalFooter>
            <Button size="sm" type="submit" disabled={busy || !usable || !refValueOk}>
              {t.submitLabel}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              {t.cancelLabel}
            </Button>
          </ModalFooter>
        </form>
        )}
      </ModalContent>
    </Modal>
  )
})
