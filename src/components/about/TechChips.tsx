import * as React from 'react'
import { cn } from '../../lib/utils'
import { ChipList } from '../chip-list/ChipList'

export interface TechChipsProps extends React.ComponentProps<'div'> {
  items: ReadonlyArray<string | null | undefined>
}

export const TechChips = React.forwardRef<HTMLDivElement, TechChipsProps>(
  function TechChips({ items, className, ...props }, ref) {
    const cleaned = items.filter((item): item is string => Boolean(item))
    if (cleaned.length === 0) return null
    return (
      <div ref={ref} data-as="tech-chips" className={cn(className)} {...props}>
        <ChipList items={cleaned} variant="neutral" />
      </div>
    )
  },
)
