import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SelectionBarProps {
  count: number
  onClear: () => void
  countLabel?: React.ReactNode
  clearLabel?: string
  children?: React.ReactNode
  className?: string
}

export function SelectionBar({
  count,
  onClear,
  countLabel,
  clearLabel = 'Clear selection',
  children,
  className,
}: SelectionBarProps) {
  if (count === 0) {
    return null
  }
  return (
    <div
      data-as="selection-bar"
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-[var(--as-radius)] border border-[var(--as-primary)]/30 bg-[var(--as-primary)]/10 px-3 py-1.5 text-sm text-[var(--as-fg)]',
        className,
      )}
    >
      <span className="font-medium text-[var(--as-primary)]">
        {countLabel ?? `${count} selected`}
      </span>
      {children}
      <button
        type="button"
        className="ml-auto cursor-pointer rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        aria-label={clearLabel}
        onClick={onClear}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}
