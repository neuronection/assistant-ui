import * as React from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ViewToggleView = 'grid' | 'list'

export interface ViewToggleProps {
  view: ViewToggleView
  onChange: (view: ViewToggleView) => void
  gridLabel?: string
  listLabel?: string
  className?: string
}

export function ViewToggle({
  view,
  onChange,
  gridLabel = 'Grid view',
  listLabel = 'List view',
  className,
}: ViewToggleProps) {
  const base =
    'cursor-pointer rounded-[calc(var(--as-radius)-2px)] p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--as-focus-ring)]'
  return (
    <div
      data-as="view-toggle"
      role="group"
      className={cn(
        'flex overflow-hidden rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)]',
        className,
      )}
    >
      <button
        type="button"
        title={gridLabel}
        aria-label={gridLabel}
        aria-pressed={view === 'grid'}
        className={cn(
          base,
          view === 'grid'
            ? 'bg-[var(--as-secondary)] text-[var(--as-fg)]'
            : 'text-[var(--as-muted-fg)]',
        )}
        onClick={() => onChange('grid')}
      >
        <LayoutGrid className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        title={listLabel}
        aria-label={listLabel}
        aria-pressed={view === 'list'}
        className={cn(
          base,
          view === 'list'
            ? 'bg-[var(--as-secondary)] text-[var(--as-fg)]'
            : 'text-[var(--as-muted-fg)]',
        )}
        onClick={() => onChange('list')}
      >
        <List className="size-4" aria-hidden />
      </button>
    </div>
  )
}
