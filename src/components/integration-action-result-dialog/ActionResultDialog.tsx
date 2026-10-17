import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../modal/Modal'
import { Skeleton } from '../skeleton/Skeleton'
import { SurfaceRenderer } from '../surface-renderer/SurfaceRenderer'
import type { SurfaceAction, SurfaceLabels, SurfaceView } from '../surface-renderer/SurfaceRenderer'

export interface ActionResultDialogLabels {
  title?: string
  description?: string
  closeLabel?: string
  loadingLabel?: string
  errorLabel?: string
  retryLabel?: string
}

export interface ActionResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labels?: ActionResultDialogLabels
  /** The declarative result payload — ready renders through SurfaceRenderer. */
  result?:
    | {
        title?: string | null
        surface: SurfaceView
        surfaceLabels?: SurfaceLabels
      }
    | null
  status: 'loading' | 'error' | 'ready'
  errorDetail?: string | null
  onRetry?: () => void
  /** Typed actions out (run:* / item:* — semantics are the host's). */
  onSurfaceAction?: (action: SurfaceAction) => void
  /** Per-product chrome rendered around the declarative payload. */
  renderChrome?: (payload: { status: ActionResultDialogProps['status'] }) => React.ReactNode
  className?: string
}

/**
 * Presentational action-result dialog (ADR-0040 clause 16 — extensions'
 * declarative result payloads): HOSTS the family SurfaceRenderer for the
 * closed component vocabulary — compose, never reinvent. Loading/error/
 * ready states ride props; typed run + item action ids emit; per-product
 * chrome slots around the payload. Fetching and action semantics are
 * app-side.
 */
export const ActionResultDialog = React.forwardRef<
  HTMLDivElement,
  ActionResultDialogProps
>(function ActionResultDialog(
  {
    open,
    onOpenChange,
    labels,
    result = null,
    status,
    errorDetail = null,
    onRetry,
    onSurfaceAction,
    renderChrome,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      title: labels?.title ?? 'Result',
      description: labels?.description,
      closeLabel: labels?.closeLabel ?? 'Close',
      loadingLabel: labels?.loadingLabel ?? 'Loading result…',
      errorLabel: labels?.errorLabel ?? 'The action failed.',
      retryLabel: labels?.retryLabel ?? 'Retry',
    }),
    [labels],
  )

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        size="lg"
        className={cn('gap-3', className)}
        closeLabel={t.closeLabel}
        ref={ref}
      >
        <ModalHeader>
          <ModalTitle>
            {result?.title ? `${t.title}: ${result.title}` : t.title}
          </ModalTitle>
          {t.description ? <ModalDescription>{t.description}</ModalDescription> : null}
        </ModalHeader>
        <div
          data-as="action-result-dialog"
          data-status={status}
          data-testid="integration-action-result"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {renderChrome ? renderChrome({ status }) : null}
          {status === 'loading' ? (
            <div
              className="space-y-2"
              role="status"
              aria-label={t.loadingLabel}
              data-testid="integration-action-result-loading"
            >
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : null}
          {status === 'error' ? (
            <div data-testid="integration-action-result-error">
              <p role="alert" className="text-sm text-[var(--as-danger)]">
                {t.errorLabel}
              </p>
              {errorDetail ? (
                <p className="mt-1 break-all text-xs text-[var(--as-muted-fg)]">{errorDetail}</p>
              ) : null}
            </div>
          ) : null}
          {status === 'ready' && result ? (
            <SurfaceRenderer
              surface={result.surface}
              labels={result.surfaceLabels}
              onAction={onSurfaceAction}
            />
          ) : null}
        </div>
        <ModalFooter>
          {status === 'error' && onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry}>
              {t.retryLabel}
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
            {t.closeLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
