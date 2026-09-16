import * as React from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import { cn } from '../../lib/utils'

export type HoverCardProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Root
>

export function HoverCard({
  openDelay = 150,
  closeDelay = 100,
  ...props
}: HoverCardProps) {
  return (
    <HoverCardPrimitive.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  )
}

export const HoverCardTrigger = HoverCardPrimitive.Trigger
export const HoverCardPortal = HoverCardPrimitive.Portal

export const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(function HoverCardContent(
  { className, align = 'start', sideOffset = 6, ...props },
  ref,
) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        data-as="hover-card"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'as-anim-pop z-[var(--as-z-popover)] w-72 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3 text-[var(--as-fg)] shadow-[var(--as-shadow-2)] focus:outline-none',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
})
