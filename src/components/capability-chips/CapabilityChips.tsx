import * as React from 'react'
import { cn } from '../../lib/utils'

export interface CapabilityDescriptor {
  value: string
  label: string
}

export interface CapabilityChipsProps {
  caps: CapabilityDescriptor[]
  selected: string[]
  onToggle?: (value: string) => void
  variant?: 'toggle' | 'badge'
  minSelected?: number
  disabled?: boolean
  ariaLabel?: string
  className?: string
}

export const CapabilityChips = React.forwardRef<HTMLDivElement, CapabilityChipsProps>(
  function CapabilityChips(
    {
      caps,
      selected,
      onToggle,
      variant = 'toggle',
      minSelected = 0,
      disabled = false,
      ariaLabel,
      className,
    },
    ref,
  ) {
    const interactive = variant === 'toggle' && Boolean(onToggle)
    const locked = (value: string) =>
      interactive && !disabled && selected.includes(value) && selected.length <= minSelected

    return (
      <div
        ref={ref}
        data-as="capability-chips"
        data-variant={variant}
        role={interactive ? 'group' : undefined}
        aria-label={interactive ? ariaLabel : undefined}
        className={cn('flex flex-wrap items-center gap-1.5', className)}
      >
        {caps.map((cap) => {
          const on = selected.includes(cap.value)
          if (!interactive) {
            return (
              <span
                key={cap.value}
                data-active={on || undefined}
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]',
                  on
                    ? 'border-[var(--as-primary)] bg-[var(--as-primary)]/10 text-[var(--as-primary)]'
                    : 'border-[var(--as-border)] text-[var(--as-muted-fg)]',
                )}
              >
                {cap.label}
              </span>
            )
          }
          return (
            <button
              key={cap.value}
              type="button"
              aria-pressed={on}
              disabled={disabled || locked(cap.value)}
              onClick={() => onToggle?.(cap.value)}
              className={cn(
                'cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                'disabled:pointer-events-none disabled:opacity-50',
                on
                  ? 'border-[var(--as-primary)] bg-[var(--as-primary)]/10 text-[var(--as-primary)]'
                  : 'border-[var(--as-border)] text-[var(--as-muted-fg)] hover:bg-[var(--as-secondary)]',
              )}
            >
              {cap.label}
            </button>
          )
        })}
      </div>
    )
  },
)
