import * as React from 'react'
import { cn } from '../../lib/utils'

export const Card = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function Card({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="card"
        className={cn(
          'rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] shadow-[var(--as-shadow-1)]',
          className,
        )}
        {...props}
      />
    )
  },
)

export const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="card-header"
        className={cn('flex flex-col gap-1.5 p-5', className)}
        {...props}
      />
    )
  },
)

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h3'>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        data-as="card-title"
        className={cn('font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    )
  },
)

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        data-as="card-description"
        className={cn('text-sm text-[var(--as-muted-fg)]', className)}
        {...props}
      />
    )
  },
)

export const CardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div ref={ref} data-as="card-content" className={cn('p-5 pt-0', className)} {...props} />
    )
  },
)

export const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="card-footer"
        className={cn('flex items-center p-5 pt-0', className)}
        {...props}
      />
    )
  },
)
