import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../modal/Modal'
import {
  EXTENSION_REF_STRATEGIES,
  type ExtensionRefStrategy,
} from '../../contracts'
import type { IntegrationSourceDraft } from '../../contracts'

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
}

const inputClass =
  'min-w-0 w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

const EMPTY_DRAFT: IntegrationSourceDraft = {
  url: '',
  localPath: '',
  refStrategy: 'release-tag',
  refValue: '',
  subpath: '',
  secretSlot: null,
  secretValue: '',
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
  { open, onOpenChange, onSubmit, labels, busy = false, error = null, secretSlot = null, className },
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
    }),
    [labels],
  )

  const [draft, setDraft] = React.useState<IntegrationSourceDraft>(EMPTY_DRAFT)

  React.useEffect(() => {
    if (open) setDraft({ ...EMPTY_DRAFT, secretSlot })
  }, [open, secretSlot])

  const usable =
    draft.url.trim().startsWith('https://') || draft.localPath.trim().startsWith('/')
  const refValueOk =
    draft.refStrategy === 'release-tag' || draft.refValue.trim() !== ''

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!usable || !refValueOk || busy) return
    onSubmit({
      ...draft,
      url: draft.url.trim(),
      localPath: draft.localPath.trim(),
      refValue: draft.refValue.trim(),
      subpath: draft.subpath.trim(),
      secretValue: draft.secretValue?.trim() ? draft.secretValue.trim() : undefined,
    })
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className={cn('gap-3', className)} closeLabel={t.closeLabel}>
        <ModalHeader>
          <ModalTitle>{t.title}</ModalTitle>
          {t.description ? <ModalDescription>{t.description}</ModalDescription> : null}
        </ModalHeader>
        <form
          ref={ref}
          data-as="add-integration-source-dialog"
          data-testid="integration-source-form"
          className="space-y-2"
          onSubmit={submit}
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
            <p role="status" className="text-xs text-[var(--as-muted-fg)]" data-testid="integration-source-busy">
              {t.submittingLabel}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-xs text-[var(--as-danger)]" data-testid="integration-source-error">
              {error}
            </p>
          ) : null}
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
      </ModalContent>
    </Modal>
  )
})
