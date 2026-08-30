import * as React from 'react'
import { cn } from '../../lib/utils'
import {
  FileCard,
  formatBytes,
  type FileCardStatus,
} from '../file-card/FileCard'

export interface FileQueueItem {
  id: string
  name: string
  sizeBytes?: number
  status?: FileCardStatus
  error?: string | null
  thumbnailUrl?: string | null
  included?: boolean
}

export interface FileQueueProps {
  files: FileQueueItem[]
  onRemove?: (id: string) => void
  onToggleInclude?: (id: string) => void
  onOpen?: (id: string) => void
  onReorder?: (fromId: string, toId: string) => void
  reorderable?: boolean
  emptyText?: string
  summary?: React.ReactNode
  removeLabel?: string
  includeLabel?: string
  className?: string
}

/**
 * FileCard grid with aggregate summary and optional drag-to-reorder
 * (reports intent via `onReorder(fromId, toId)` — the app owns ordering).
 */
export const FileQueue = React.forwardRef<HTMLDivElement, FileQueueProps>(
  function FileQueue(
    {
      files,
      onRemove,
      onToggleInclude,
      onOpen,
      onReorder,
      reorderable = Boolean(onReorder),
      emptyText,
      summary,
      removeLabel = 'Remove file',
      includeLabel = 'Include in processing',
      className,
    },
    ref,
  ) {
    const dragId = React.useRef<string | null>(null)
    const [dropTarget, setDropTarget] = React.useState<string | null>(null)

    if (files.length === 0 && emptyText) {
      return (
        <p ref={ref} className={cn('text-sm text-[var(--as-muted-fg)]', className)}>
          {emptyText}
        </p>
      )
    }

    return (
      <div ref={ref} data-as="file-queue" className={cn('flex w-full flex-col gap-2', className)}>
        {files.length > 0 ? (
          <p className="text-xs text-[var(--as-muted-fg)]">
            {summary ??
              `${files.length} ${files.length === 1 ? 'file' : 'files'}${
                files.some((f) => f.sizeBytes != null)
                  ? ` · ${formatBytes(files.reduce((total, f) => total + (f.sizeBytes ?? 0), 0))}`
                  : ''
              }`}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              onDragOver={reorderable ? (event) => {
                event.preventDefault()
                if (dragId.current && dragId.current !== file.id) setDropTarget(file.id)
              } : undefined}
              onDrop={reorderable ? (event) => {
                event.preventDefault()
                if (dragId.current && dragId.current !== file.id) {
                  onReorder?.(dragId.current, file.id)
                }
                dragId.current = null
                setDropTarget(null)
              } : undefined}
              className={cn(
                dropTarget === file.id && 'ring-2 ring-[var(--as-focus-ring)] ring-offset-2',
              )}
            >
              <FileCard
                name={file.name}
                sizeBytes={file.sizeBytes}
                status={file.status}
                error={file.error}
                thumbnailUrl={file.thumbnailUrl}
                included={file.included}
                onToggleInclude={onToggleInclude ? () => onToggleInclude(file.id) : undefined}
                onRemove={onRemove ? () => onRemove(file.id) : undefined}
                onOpen={onOpen ? () => onOpen(file.id) : undefined}
                draggable={reorderable}
                onDragStart={() => {
                  dragId.current = file.id
                }}
                onDragEnd={() => {
                  dragId.current = null
                  setDropTarget(null)
                }}
                removeLabel={removeLabel}
                includeLabel={includeLabel}
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
)
