import * as React from 'react'
import { History } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'

export interface UndoNoticeProps {
  message?: string
  actionLabel?: string
  onUndo: () => void
  undoing?: boolean
  duration?: number
  onDismiss: () => void
  className?: string
}

export function UndoNotice({
  message = 'Item deleted',
  actionLabel = 'Undo',
  onUndo,
  undoing = false,
  duration = 8000,
  onDismiss,
  className,
}: UndoNoticeProps) {
  React.useEffect(() => {
    if (duration <= 0) {
      return
    }
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      data-as="undo-notice"
      role="status"
      className={cn(
        'flex items-center justify-between gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-secondary)] px-3 py-1.5 text-xs text-[var(--as-fg)]',
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <History className="size-3.5" aria-hidden />
        {message}
      </span>
      <Button variant="outline" size="sm" disabled={undoing} loading={undoing} onClick={() => onUndo()}>
        {actionLabel}
      </Button>
    </div>
  )
}
