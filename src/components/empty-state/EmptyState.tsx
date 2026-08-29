import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface EmptyStateProps extends React.ComponentProps<'div'> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    { icon: Icon, title, description, action, compact = false, className, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-as="empty-state"
        className={cn(
          'flex flex-col items-center justify-center text-center',
          compact ? 'py-6' : 'py-12',
          className,
        )}
        {...props}
      >
        {Icon ? (
          <Icon
            aria-hidden="true"
            className={cn(
              'mb-3 text-[var(--as-muted-fg)] opacity-60',
              compact ? 'size-8' : 'size-12',
            )}
          />
        ) : null}
        <p
          className={cn(
            'font-semibold text-[var(--as-fg)]',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-[var(--as-muted-fg)]">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    )
  },
)
