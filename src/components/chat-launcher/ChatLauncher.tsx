import * as React from 'react'
import { MessageCircle, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Portal } from '../portal/Portal'

export interface ChatLauncherProps {
  /** The anchored panel body — usually `ChatPanel variant="bubble"`. */
  panel: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  position?: 'bottom-right' | 'bottom-left'
  label?: string
  closeLabel?: string
  icon?: LucideIcon
  closeIcon?: LucideIcon
  /** Unread / activity badge. */
  badge?: number | string
  /**
   * Render the floating close button pinned to the panel's top-right
   * corner (default). Turn this off when the panel body renders its own
   * header actions — an overlaid close intercepts clicks meant for
   * top-right header buttons; compose the close into those actions
   * (calling `onOpenChange(false)`) instead.
   */
  showClose?: boolean
  container?: HTMLElement | null
  panelClassName?: string
  className?: string
}

/**
 * The floating chat bubble (career's `ChatWidget` launcher,
 * family-standard): fixed launcher button opening an anchored, non-modal
 * panel. `aria-expanded` wiring, Escape closes while focus is inside.
 */
export const ChatLauncher = React.forwardRef<HTMLButtonElement, ChatLauncherProps>(
  function ChatLauncher(
    {
      panel,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      position = 'bottom-right',
      label = 'Chat',
      closeLabel = 'Close chat',
      icon: Icon = MessageCircle,
      closeIcon: CloseIcon = X,
      badge,
      showClose = true,
      container,
      panelClassName,
      className,
    },
    ref,
  ) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const isControlled = openProp !== undefined
    const open = isControlled ? openProp : uncontrolledOpen
    const panelRef = React.useRef<HTMLDivElement | null>(null)

    const setOpen = (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    }

    React.useEffect(() => {
      if (!open) {
        return
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && panelRef.current?.contains(document.activeElement)) {
          setOpen(false)
        }
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    })

    const showBadge = badge !== undefined && badge !== 0 && badge !== ''

    return (
      <>
        {open ? (
          <Portal container={container}>
            <div
              ref={panelRef}
              data-as="chat-launcher-panel"
              className={cn(
                'as-anim-pop fixed bottom-20 z-[var(--as-z-modal)] flex h-[min(36rem,calc(100dvh-11rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] shadow-[var(--as-shadow-3)]',
                position === 'bottom-right' ? 'right-4' : 'left-4',
                panelClassName,
              )}
              role="complementary"
              aria-label={label}
            >
              {panel}
              {showClose ? (
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={() => setOpen(false)}
                  className="absolute right-2 top-2 z-10 rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
                >
                  <CloseIcon aria-hidden className="size-4" />
                </button>
              ) : null}
            </div>
          </Portal>
        ) : null}
        <button
          ref={ref}
          type="button"
          aria-expanded={open}
          aria-label={open ? closeLabel : label}
          title={open ? closeLabel : label}
          onClick={() => setOpen(!open)}
          data-as="chat-launcher"
          data-open={open || undefined}
          className={cn(
            'fixed bottom-4 z-[var(--as-z-popover)] flex size-12 items-center justify-center rounded-full bg-[var(--as-primary)] text-[var(--as-primary-fg)] shadow-[var(--as-shadow-2)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
            position === 'bottom-right' ? 'right-4' : 'left-4',
            className,
          )}
        >
          <Icon className="size-5" aria-hidden />
          {showBadge ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--as-surface)] bg-[var(--as-danger)] px-1 text-[10px] font-semibold text-[var(--as-danger-fg)]">
              {badge}
            </span>
          ) : null}
        </button>
      </>
    )
  },
)
