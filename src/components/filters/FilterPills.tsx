import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { FilterPillItem } from './types'

export interface FilterPillsProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onRemove'> {
  /** Applied filters; an empty list renders nothing. */
  items: FilterPillItem[]
  onRemove: (key: string) => void
  /** Accessible name of a pill's remove button. Default `Remove <label>`. */
  removeLabel?: (label: string) => string
  /** `data-testid` of the row. */
  testId?: string
  /** `data-testid` of one pill button. */
  itemTestId?: (key: string) => string
}

/**
 * The removable row above a filtered list: one pill per applied filter,
 * rendered only when at least one exists. The host owns the labels and what
 * removal means; this is the one chrome.
 */
export const FilterPills = React.forwardRef<HTMLDivElement, FilterPillsProps>(function FilterPills(
  { items, onRemove, removeLabel, testId, itemTestId, className, ...props },
  ref,
) {
  if (items.length === 0) return null
  const labelFor = removeLabel ?? ((label: string) => `Remove ${label}`)

  return (
    <div
      ref={ref}
      data-as="filter-pills"
      data-testid={testId}
      className={cn('flex flex-wrap items-center gap-1 text-xs text-[var(--as-muted-fg)]', className)}
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onRemove(item.key)}
          aria-label={labelFor(item.label)}
          data-testid={itemTestId?.(item.key)}
          className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-0.5 transition-colors hover:border-[color-mix(in_srgb,var(--as-primary)_40%,var(--as-border))] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        >
          {item.label}
          <X aria-hidden className="size-3" />
        </button>
      ))}
    </div>
  )
})
