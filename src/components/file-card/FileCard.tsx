import * as React from 'react'
import { Check, FileText, GripVertical, Loader2, TriangleAlert, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export type FileCardStatus = 'queued' | 'processing' | 'done' | 'failed'

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface FileCardProps {
  name: string
  sizeBytes?: number
  status?: FileCardStatus
  error?: string | null
  /** Small preview URL (app owns object-URL lifecycle). */
  thumbnailUrl?: string | null
  included?: boolean
  onToggleInclude?: () => void
  onRemove?: () => void
  onOpen?: () => void
  draggable?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  removeLabel?: string
  includeLabel?: string
  className?: string
}

export const FileCard = React.forwardRef<HTMLDivElement, FileCardProps>(
  function FileCard(
    {
      name,
      sizeBytes,
      status = 'queued',
      error,
      thumbnailUrl,
      included = true,
      onToggleInclude,
      onRemove,
      onOpen,
      draggable = false,
      onDragStart,
      onDragEnd,
      removeLabel = 'Remove file',
      includeLabel = 'Include in processing',
      className,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-as="file-card"
        data-status={status}
        draggable={draggable}
        onDragStart={(event) => {
          if (!draggable) return
          event.dataTransfer.effectAllowed = 'move'
          onDragStart?.()
        }}
        onDragEnd={draggable ? onDragEnd : undefined}
        onClick={onOpen}
        className={cn(
          'group relative flex w-40 flex-col overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] shadow-[var(--as-shadow-1)] transition-shadow hover:shadow-[var(--as-shadow-2)]',
          onOpen && 'cursor-pointer',
          !included && 'opacity-60',
          className,
        )}
      >
        {draggable ? (
          <span
            aria-hidden
            className="absolute left-1 top-1 z-10 cursor-grab rounded p-0.5 text-[var(--as-muted-fg)] opacity-0 transition-opacity group-hover:opacity-100"
          >
            <GripVertical className="size-3.5" />
          </span>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            aria-label={`${removeLabel} — ${name}`}
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
            className="absolute right-1 top-1 z-10 cursor-pointer rounded-full bg-[var(--as-surface-raised)] p-1 text-[var(--as-muted-fg)] opacity-0 shadow-[var(--as-shadow-1)] transition-opacity hover:text-[var(--as-danger)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--as-focus-ring)] group-hover:opacity-100"
          >
            <X className="size-3" aria-hidden />
          </button>
        ) : null}
        <div className="flex h-20 w-full items-center justify-center overflow-hidden bg-[var(--as-muted)]">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="size-full object-cover" />
          ) : (
            <FileText
              className={cn(
                'size-7',
                status === 'failed' ? 'text-[var(--as-danger)]' : 'text-[var(--as-muted-fg)]',
              )}
              aria-hidden
            />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1 p-2">
          <p className="truncate text-xs font-semibold text-[var(--as-fg)]" title={name}>
            {name}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--as-muted-fg)]">
            {status === 'processing' ? (
              <>
                <Loader2 className="size-3 animate-spin" aria-hidden />
                <span role="status">Processing…</span>
              </>
            ) : status === 'failed' ? (
              <>
                <TriangleAlert className="size-3 text-[var(--as-danger)]" aria-hidden />
                <span className="truncate text-[var(--as-danger)]">{error ?? 'Failed'}</span>
              </>
            ) : status === 'done' ? (
              <>
                <Check className="size-3 text-[var(--as-success)]" aria-hidden />
                <span>Done</span>
              </>
            ) : null}
            {sizeBytes != null ? (
              <span className="ml-auto shrink-0">{formatBytes(sizeBytes)}</span>
            ) : null}
          </div>
        </div>
        {onToggleInclude ? (
          <label
            onClick={(event) => event.stopPropagation()}
            className="flex cursor-pointer items-center gap-1.5 border-t border-[var(--as-border)] px-2 py-1.5 text-[10px] font-medium text-[var(--as-muted-fg)]"
          >
            <input
              type="checkbox"
              checked={included}
              onChange={() => onToggleInclude()}
              aria-label={`${includeLabel} — ${name}`}
              className="accent-[var(--as-primary)]"
            />
            {includeLabel}
          </label>
        ) : null}
      </div>
    )
  },
)
