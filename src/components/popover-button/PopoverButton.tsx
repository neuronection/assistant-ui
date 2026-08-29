import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../../lib/utils'

export interface PopoverButtonProps {
  trigger: React.ReactNode
  children: React.ReactNode | (() => React.ReactNode)
  label: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  panelClassName?: string
  triggerClassName?: string
  openOnHover?: boolean
  focusOnOpen?: boolean
  preserveFocus?: boolean
  closeSignal?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export function PopoverButton({
  trigger,
  children,
  label,
  align = 'end',
  side = 'bottom',
  sideOffset = 8,
  panelClassName,
  triggerClassName,
  openOnHover = false,
  focusOnOpen = true,
  preserveFocus = false,
  closeSignal = 0,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
}: PopoverButtonProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  React.useEffect(() => {
    if (closeSignal > 0) {
      setOpen(false)
    }
  }, [closeSignal, setOpen])

  const content =
    typeof children === 'function' ? (open ? children() : null) : children

  const hoverProps = openOnHover
    ? {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: (event: React.MouseEvent) => {
          const related = event.relatedTarget
          if (related instanceof Node && contentRef.current?.contains(related) === true) {
            return
          }
          setOpen(false)
        },
      }
    : {}

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <span className="relative inline-flex" data-as="popover-button" {...hoverProps}>
        <PopoverPrimitive.Trigger
          type="button"
          aria-label={label}
          disabled={disabled}
          className={cn(
            'inline-flex items-center justify-center gap-1 rounded-full transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
            triggerClassName ?? 'size-9',
          )}
          onMouseDown={preserveFocus ? (event) => event.preventDefault() : undefined}
          onClick={
            openOnHover
              ? (event) => {
                  event.preventDefault()
                  setOpen(true)
                }
              : undefined
          }
        >
          {trigger}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={contentRef}
            role="dialog"
            aria-label={label}
            align={align}
            side={side}
            sideOffset={sideOffset}
            collisionPadding={8}
            onOpenAutoFocus={(event) => {
              if (!focusOnOpen) {
                event.preventDefault()
              }
            }}
            onMouseLeave={
              openOnHover
                ? (event) => {
                    const related = event.relatedTarget
                    const insideTrigger =
                      related instanceof Element &&
                      related.closest('[data-as="popover-button"]') !== null
                    const insideContent =
                      related instanceof Node && contentRef.current?.contains(related) === true
                    if (!insideTrigger && !insideContent) {
                      setOpen(false)
                    }
                  }
                : undefined
            }
            className={cn(
              'as-anim-pop z-50 w-80 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3 text-[var(--as-fg)] shadow-[var(--as-shadow-3)] outline-none',
              panelClassName,
            )}
          >
            {content}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </span>
    </PopoverPrimitive.Root>
  )
}
