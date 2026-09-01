import * as React from 'react'
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CapabilityDescriptor {
  value: string
  label: string
  icon?: LucideIcon
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
          const Icon = cap.icon
          if (!interactive) {
            return (
              <span
                key={cap.value}
                data-as-cap={cap.value}
                data-active={on || undefined}
                title={`${cap.label} capability`}
                className={cn(
                  'inline-flex items-center gap-1 rounded-[var(--as-radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  on
                    ? 'bg-[var(--as-primary)]/10 text-[var(--as-primary)]'
                    : 'bg-[var(--as-muted)] text-[var(--as-muted-fg)]',
                )}
              >
                {Icon ? <Icon className="size-2.5" aria-hidden /> : null}
                {cap.label}
              </span>
            )
          }
          return (
            <button
              key={cap.value}
              type="button"
              data-as-cap={cap.value}
              aria-pressed={on}
              disabled={disabled || locked(cap.value)}
              onClick={() => onToggle?.(cap.value)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-[var(--as-radius)] border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                'disabled:pointer-events-none disabled:opacity-60',
                on
                  ? 'border-[var(--as-primary)]/30 bg-[var(--as-primary)]/10 text-[var(--as-primary)] shadow-[var(--as-shadow-1)]'
                  : 'border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-muted-fg)] hover:border-[var(--as-muted-fg)]/40',
              )}
            >
              {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
              {cap.label}
              {on ? <Check className="size-3" aria-hidden /> : null}
            </button>
          )
        })}
      </div>
    )
  },
)
