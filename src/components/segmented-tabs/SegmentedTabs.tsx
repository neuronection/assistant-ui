import * as React from 'react'
import { cn } from '../../lib/utils'

export interface SegmentedTabsItem {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  disabled?: boolean
}

export interface SegmentedTabsProps {
  items: SegmentedTabsItem[]
  value: string
  onValueChange: (value: string) => void
  ariaLabel: string
  className?: string
}

export const SegmentedTabs = React.forwardRef<HTMLDivElement, SegmentedTabsProps>(
  function SegmentedTabs({ items, value, onValueChange, ariaLabel, className }, ref) {
    const activeIndex = Math.max(
      0,
      items.findIndex((item) => item.value === value),
    )

    const move = (from: number, delta: number) => {
      if (items.length === 0) return -1
      let index = from
      for (let step = 0; step < items.length; step++) {
        index = (index + delta + items.length) % items.length
        if (!items[index]?.disabled) return index
      }
      return -1
    }

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
      let nextIndex = -1
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = move(index, 1)
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = move(index, -1)
      else if (event.key === 'Home') nextIndex = move(-1, 1)
      else if (event.key === 'End') nextIndex = move(items.length, -1)
      if (nextIndex === -1 || nextIndex === index) return
      event.preventDefault()
      const next = items[nextIndex]
      if (!next) return
      onValueChange(next.value)
      const list = event.currentTarget.closest('[role="tablist"]')
      list?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus()
    }

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        data-as="segmented-tabs"
        className={cn(
          'relative grid auto-cols-fr grid-flow-col rounded-full border border-[var(--as-border)] bg-[var(--as-muted)] p-0.5',
          className,
        )}
      >
        {items.length > 0 && (
          <span
            aria-hidden
            data-thumb=""
            className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full border border-[var(--as-border)] bg-[var(--as-surface-raised)] shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{
              width: `calc((100% - 4px) / ${items.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        )}
        {items.map((item, index) => {
          const selected = item.value === value
          const Icon = item.icon
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'relative z-[1] flex cursor-pointer items-center justify-center gap-1 rounded-full px-1 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'text-[var(--as-fg)]'
                  : 'text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]',
                item.disabled && 'hover:text-[var(--as-muted-fg)]',
              )}
            >
              {Icon && (
                <Icon
                  className={cn('size-3.5', selected ? 'text-[var(--as-accent)]' : '')}
                  aria-hidden
                />
              )}
              {item.label}
            </button>
          )
        })}
      </div>
    )
  },
)
