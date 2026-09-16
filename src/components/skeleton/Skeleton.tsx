import * as React from 'react'
import { cn } from '../../lib/utils'

export type SkeletonProps = React.ComponentProps<'div'>

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="skeleton"
        aria-hidden="true"
        className={cn('rounded-md bg-[var(--as-muted)]', className)}
        {...props}
      />
    )
  },
)

export interface SkeletonTextProps extends React.ComponentProps<'div'> {
  lines?: number
  lastLineRatio?: number
}

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  function SkeletonText(
    { className, lines = 3, lastLineRatio = 0.8, ...props },
    ref,
  ) {
    const count = Math.min(Math.max(Math.round(lines), 1), 12)
    const ratio = Math.min(Math.max(lastLineRatio, 0.1), 1)
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('flex w-full flex-col gap-2', className)}
        {...props}
      >
        {Array.from({ length: count }, (_, index) => (
          <Skeleton
            key={index}
            className="h-3.5"
            style={
              index === count - 1 && count > 1
                ? { width: `${ratio * 100}%` }
                : undefined
            }
          />
        ))}
      </div>
    )
  },
)
