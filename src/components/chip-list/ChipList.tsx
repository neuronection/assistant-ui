import * as React from 'react'
import { ChevronRight, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ChipVariant =
  | 'neutral'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

export interface ChipListProps extends React.ComponentProps<'div'> {
  items: ReadonlyArray<string | null | undefined>
  onRemove?: (item: string) => void
  onItemClick?: (value: string, index: number) => void
  variant?: ChipVariant
  emptyText?: string
  showChevron?: boolean
  removeLabel?: string
}

const chipTints: Record<Exclude<ChipVariant, 'neutral'>, string> = {
  primary: 'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] text-[var(--as-primary)]',
  info: 'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] text-[var(--as-primary)]',
  success:
    'bg-[color-mix(in_srgb,var(--as-success)_14%,transparent)] text-[var(--as-success)]',
  warning:
    'bg-[color-mix(in_srgb,var(--as-warning)_18%,transparent)] text-[color-mix(in_srgb,var(--as-warning)_72%,var(--as-fg))]',
  danger: 'bg-[color-mix(in_srgb,var(--as-danger)_12%,transparent)] text-[var(--as-danger)]',
}

export const ChipList = React.forwardRef<HTMLDivElement, ChipListProps>(
  function ChipList(
    {
      items,
      onRemove,
      onItemClick,
      variant = 'neutral',
      emptyText,
      showChevron = false,
      removeLabel = 'Remove',
      className,
      ...props
    },
    ref,
  ) {
    const cleaned = items.filter((item): item is string => Boolean(item))

    if (cleaned.length === 0) {
      if (!emptyText) return null
      return (
        <p className={cn('text-sm text-[var(--as-muted-fg)]', className)}>
          {emptyText}
        </p>
      )
    }

    return (
      <div
        ref={ref}
        data-as="chip-list"
        className={cn('flex flex-wrap gap-1.5', className)}
        {...props}
      >
        {cleaned.map((item, index) => {
          const tint =
            variant === 'neutral'
              ? 'bg-[var(--as-secondary)] text-[var(--as-secondary-fg)]'
              : chipTints[variant]
          const content = (
            <>
              {item}
              {onItemClick && showChevron ? (
                <ChevronRight className="size-3 opacity-60" aria-hidden />
              ) : null}
            </>
          )
          return (
            <span
              key={`${item}-${index}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-[calc(var(--as-radius-sm)-2px)] py-0.5 pl-2.5 pr-1.5 text-xs font-medium',
                onItemClick &&
                  'cursor-pointer transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                tint,
              )}
            >
              {onItemClick ? (
                <button
                  type="button"
                  onClick={() => onItemClick(item, index)}
                  className="cursor-pointer bg-transparent p-0 text-inherit outline-none"
                >
                  {content}
                </button>
              ) : (
                content
              )}
              {onRemove ? (
                <button
                  type="button"
                  aria-label={`${removeLabel} ${item}`}
                  onClick={() => onRemove(item)}
                  className="cursor-pointer opacity-70 transition-colors hover:text-[var(--as-danger)] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
                >
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
            </span>
          )
        })}
      </div>
    )
  },
)
