import * as React from 'react'
import { ChevronRight, FileText } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../modal/Modal'
import { Skeleton } from '../skeleton/Skeleton'

export interface IntegrationDocsNode {
  id: string
  title: string
  children?: IntegrationDocsNode[]
}

export interface DocsDialogLabels {
  title?: string
  description?: string
  closeLabel?: string
  treeLabel?: string
  emptyLabel?: string
  loadingLabel?: string
  errorLabel?: string
}

export interface DocsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labels?: DocsDialogLabels
  /** The docs tree (app-fetched data — the dialog renders only). */
  docs: IntegrationDocsNode[]
  /** Controlled selection into the tree. */
  selectedId?: string | null
  onSelect: (nodeId: string) => void
  /** Content slot for the selected node — app-owned fetch + render. */
  renderContent: (node: IntegrationDocsNode) => React.ReactNode
  status?: 'loading' | 'error' | 'ready'
  errorDetail?: string | null
  className?: string
}

function flatten(nodes: IntegrationDocsNode[]): IntegrationDocsNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])])
}

function TreeBranch({
  nodes,
  depth,
  selectedId,
  onSelect,
  labels,
}: {
  nodes: IntegrationDocsNode[]
  depth: number
  selectedId?: string | null
  onSelect: (nodeId: string) => void
  labels: Required<Pick<DocsDialogLabels, 'treeLabel' | 'emptyLabel'>>
}) {
  return (
    <ul className={cn('space-y-0.5', depth > 0 && 'ml-3 border-l border-[var(--as-border)] pl-2')}>
      {nodes.map((node) => {
        const hasChildren = (node.children ?? []).length > 0
        const selected = node.id === selectedId
        return (
          <li key={node.id}>
            <button
              type="button"
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSelect(node.id)}
              className={cn(
                'flex w-full items-center gap-1.5 rounded-[var(--as-radius-sm)] px-2 py-1 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                selected
                  ? 'bg-[var(--as-primary)]/10 font-medium text-[var(--as-primary)]'
                  : 'text-[var(--as-muted-fg)] hover:bg-[var(--as-secondary)]',
              )}
            >
              {hasChildren ? (
                <ChevronRight className="size-3 shrink-0" aria-hidden />
              ) : (
                <FileText className="size-3 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 truncate">{node.title}</span>
            </button>
            {hasChildren ? (
              <TreeBranch
                nodes={node.children ?? []}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                labels={labels}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Presentational docs dialog (plan 33 G4 — bundles carry docs; no product
 * re-invents the viewer): a tree/list navigation with a content SLOT — the
 * selected node's content is app-owned (fetch + render). Loading/error/
 * empty states ride props. No fetching, no storage.
 */
export const DocsDialog = React.forwardRef<HTMLDivElement, DocsDialogProps>(
  function DocsDialog(
    {
      open,
      onOpenChange,
      labels,
      docs,
      selectedId = null,
      onSelect,
      renderContent,
      status = 'ready',
      errorDetail = null,
      className,
    },
    ref,
  ) {
    const t = React.useMemo(
      () => ({
        title: labels?.title ?? 'Documentation',
        description: labels?.description,
        closeLabel: labels?.closeLabel ?? 'Close',
        treeLabel: labels?.treeLabel ?? 'Contents',
        emptyLabel: labels?.emptyLabel ?? 'This bundle ships no docs.',
        loadingLabel: labels?.loadingLabel ?? 'Loading docs…',
        errorLabel: labels?.errorLabel ?? 'Docs could not be loaded.',
      }),
      [labels],
    )

    const selected =
      flatten(docs).find((node) => node.id === selectedId) ??
      (docs.length > 0 ? flatten(docs)[0] : null)

    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent
          size="xl"
          className={cn('gap-3', className)}
          closeLabel={t.closeLabel}
        >
          <ModalHeader>
            <ModalTitle>{t.title}</ModalTitle>
            {t.description ? <ModalDescription>{t.description}</ModalDescription> : null}
          </ModalHeader>
          <div
            ref={ref}
            data-as="docs-dialog"
            data-status={status}
            data-testid="integration-docs"
            className="grid min-h-0 flex-1 gap-3 sm:grid-cols-[minmax(10rem,14rem)_1fr]"
          >
            <nav aria-label={t.treeLabel} className="min-h-0 overflow-y-auto">
              {docs.length === 0 ? (
                <p className="text-xs text-[var(--as-muted-fg)]" data-testid="integration-docs-empty">
                  {t.emptyLabel}
                </p>
              ) : (
                <TreeBranch
                  nodes={docs}
                  depth={0}
                  selectedId={selected?.id ?? selectedId}
                  onSelect={onSelect}
                  labels={t}
                />
              )}
            </nav>
            <div
              className="min-h-0 overflow-y-auto rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3"
              data-testid="integration-docs-content"
            >
              {status === 'loading' ? (
                <div role="status" aria-label={t.loadingLabel} className="space-y-2" data-testid="integration-docs-loading">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : status === 'error' ? (
                <div data-testid="integration-docs-error">
                  <p role="alert" className="text-sm text-[var(--as-danger)]">
                    {t.errorLabel}
                  </p>
                  {errorDetail ? (
                    <p className="mt-1 break-all text-xs text-[var(--as-muted-fg)]">{errorDetail}</p>
                  ) : null}
                </div>
              ) : selected ? (
                renderContent(selected)
              ) : null}
            </div>
          </div>
          <ModalFooter>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              {t.closeLabel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  },
)
