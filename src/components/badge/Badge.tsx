import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--as-primary)] text-[var(--as-primary-fg)]',
        secondary:
          'border-transparent bg-[var(--as-secondary)] text-[var(--as-secondary-fg)]',
        outline: 'border-[var(--as-border)] text-[var(--as-fg)]',
        success: 'border-transparent bg-[var(--as-success)] text-[var(--as-success-fg)]',
        warning: 'border-transparent bg-[var(--as-warning)] text-[var(--as-warning-fg)]',
        danger: 'border-transparent bg-[var(--as-danger)] text-[var(--as-danger-fg)]',
        ai: 'border-transparent bg-[var(--as-ai)] text-[var(--as-ai-fg)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-as="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
})

export { badgeVariants }
