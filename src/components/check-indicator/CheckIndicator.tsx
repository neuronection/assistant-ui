import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CheckIndicatorProps {
  checked: boolean
  label: string
  onToggle: () => void
  mixed?: boolean
  className?: string
}

export const CheckIndicator = React.forwardRef<HTMLButtonElement, CheckIndicatorProps>(
  function CheckIndicator({ checked, label, onToggle, mixed = false, className }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        data-as="check-indicator"
        aria-checked={mixed ? 'mixed' : checked}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        className={cn(
          'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--as-radius-sm)-2px)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
          checked || mixed
            ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
            : 'border border-[var(--as-border)] text-[var(--as-muted-fg)] hover:border-[var(--as-fg)]/40',
          className,
        )}
      >
        {mixed ? (
          <Minus className="size-3" aria-hidden />
        ) : checked ? (
          <Check className="size-3" aria-hidden />
        ) : null}
      </button>
    )
  },
)
