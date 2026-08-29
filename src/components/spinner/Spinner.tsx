import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const sizeClasses = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
} as const

export interface SpinnerProps extends React.ComponentProps<'span'> {
  size?: keyof typeof sizeClasses
  label?: string
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner({ className, size = 'md', label, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-as="spinner"
        role={label ? 'status' : undefined}
        aria-live={label ? 'polite' : undefined}
        className={cn(
          'inline-flex items-center justify-center text-[var(--as-muted-fg)]',
          className,
        )}
        {...props}
      >
        <Loader2 aria-hidden="true" className={cn('animate-spin', sizeClasses[size])} />
        {label ? <span className="sr-only">{label}</span> : null}
      </span>
    )
  },
)
