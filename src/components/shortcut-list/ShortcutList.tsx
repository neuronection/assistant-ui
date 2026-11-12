import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ShortcutEntry {
  id: string
  label: string
  /** Display string already formatted by the app (e.g. "Ctrl K"). */
  keys: string
  disabled?: boolean
}

export interface ShortcutGroup {
  id: string
  label: string
  entries: ShortcutEntry[]
}

export interface ShortcutListProps {
  groups: ShortcutGroup[]
  className?: string
}

export const ShortcutList = React.forwardRef<HTMLDivElement, ShortcutListProps>(
  function ShortcutList({ groups, className }, ref) {
    const autoId = React.useId()

    return (
      <div ref={ref} data-as="shortcut-list" className={cn('flex flex-col gap-4', className)}>
        {groups.map((group) => {
          const headingId = `${autoId}-${group.id}`
          return (
            <section
              key={group.id}
              aria-labelledby={headingId}
              data-as="shortcut-group"
              className="flex flex-col gap-1.5"
            >
              <h3
                id={headingId}
                data-as="shortcut-group-label"
                className="text-xs font-medium uppercase tracking-wide text-[var(--as-muted-fg)]"
              >
                {group.label}
              </h3>
              <ul className="flex flex-col gap-1">
                {group.entries.map((entry) => (
                  <li
                    key={entry.id}
                    data-as="shortcut-entry"
                    data-disabled={entry.disabled || undefined}
                    aria-disabled={entry.disabled || undefined}
                    className={cn(
                      'flex items-center justify-between gap-3 text-sm text-[var(--as-fg)]',
                      entry.disabled && 'opacity-60',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                    <kbd className="shrink-0 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--as-muted-fg)]">
                      {entry.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    )
  },
)
