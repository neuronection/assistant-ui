import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Spinner } from '../spinner/Spinner'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--as-radius)] text-sm font-medium text-[var(--as-fg)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-[var(--as-primary)] text-[var(--as-primary-fg)] hover:opacity-90',
        secondary: 'bg-[var(--as-secondary)] text-[var(--as-secondary-fg)] hover:opacity-80',
        outline:
          'border border-[var(--as-border)] bg-[var(--as-surface)] hover:bg-[var(--as-secondary)]',
        ghost: 'hover:bg-[var(--as-secondary)]',
        destructive:
          'bg-[var(--as-danger)] text-[var(--as-danger-fg)] hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-[var(--as-radius-sm)] px-3 text-xs',
        lg: 'h-10 rounded-[var(--as-radius-lg)] px-6',
        icon: 'size-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : 'button'
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? <Spinner /> : null}
        {children}
      </>
    )
    return (
      <Comp
        ref={ref}
        data-as="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading || disabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </Comp>
    )
  },
)

export { buttonVariants }
