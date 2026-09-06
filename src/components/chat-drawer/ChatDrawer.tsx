import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface ChatDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The sidepanel content — usually `ChatPanel variant="sidebar"`. */
  panel: React.ReactNode
  side?: 'right' | 'left'
  /** Controlled width in px (persist app-side). Default 480. */
  width?: number
  onWidthChange?: (width: number) => void
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  closeLabel?: string
  resizeLabel?: string
  /** Accessible dialog name (visually hidden). Default "Chat". */
  title?: string
  /** Below this viewport width the drawer goes full-screen. Default 768. */
  fullScreenBreakpointPx?: number
  container?: HTMLElement | null
  overlayClassName?: string
  className?: string
}

function useIsNarrow(breakpointPx: number): boolean {
  const [narrow, setNarrow] = React.useState(() =>
    typeof window !== 'undefined' && window.matchMedia !== undefined
      ? window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches
      : false,
  )
  React.useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia === undefined) {
      return
    }
    const query = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
    const listener = (event: MediaQueryListEvent) => setNarrow(event.matches)
    query.addEventListener('change', listener)
    setNarrow(query.matches)
    return () => query.removeEventListener('change', listener)
  }, [breakpointPx])
  return narrow
}

/**
 * The resizable chat sidepanel (health's `AIDrawer` + study's resizable
 * sidebar, family-standard): portal overlay on Radix Dialog (focus trap,
 * Escape), drag + keyboard resize, full-screen below the breakpoint.
 */
export const ChatDrawer = React.forwardRef<HTMLDivElement, ChatDrawerProps>(
  function ChatDrawer({
      open,
      onOpenChange,
      panel,
      side = 'right',
      width = 480,
      onWidthChange,
      minWidth = 320,
      maxWidth = 860,
      resizable = true,
      closeLabel = 'Close chat',
      resizeLabel = 'Resize chat panel',
      title = 'Chat',
      fullScreenBreakpointPx = 768,
      container,
      overlayClassName,
      className,
    }) {
    const narrow = useIsNarrow(fullScreenBreakpointPx)
    const draggingRef = React.useRef(false)

    const clamp = (value: number) => Math.min(maxWidth, Math.max(minWidth, value))

    const onHandleKeyDown = (event: React.KeyboardEvent) => {
      if (!resizable || narrow) {
        return
      }
      const step = event.shiftKey ? 48 : 16
      if (event.key === (side === 'right' ? 'ArrowLeft' : 'ArrowRight')) {
        event.preventDefault()
        onWidthChange?.(clamp(width + step))
      } else if (event.key === (side === 'right' ? 'ArrowRight' : 'ArrowLeft')) {
        event.preventDefault()
        onWidthChange?.(clamp(width - step))
      }
    }

    const onHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable || narrow || event.button !== 0) {
        return
      }
      event.preventDefault()
      draggingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const onHandlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return
      }
      const delta = side === 'right' ? window.innerWidth - event.clientX : event.clientX
      onWidthChange?.(clamp(delta))
    }

    const onHandlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return
      }
      draggingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    }

    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal container={container}>
          <DialogPrimitive.Overlay
            data-as="chat-drawer-overlay"
            className={cn('as-anim-fade fixed inset-0 z-[var(--as-z-modal)] bg-[var(--as-overlay)]', overlayClassName)}
          />
          <DialogPrimitive.Content
            data-as="chat-drawer"
            data-side={side}
            data-full-screen={narrow || undefined}
            style={narrow ? undefined : { width: `${width}px`, maxWidth: '100vw' }}
            className={cn(
              'as-anim-drawer fixed top-0 z-[var(--as-z-modal)] flex h-dvh flex-col border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] shadow-[var(--as-shadow-3)] focus:outline-none',
              narrow
                ? 'inset-x-0 bottom-0 border-t'
                : side === 'right'
                  ? 'bottom-0 right-0 border-l'
                  : 'bottom-0 left-0 border-r',
              className,
            )}
          >
            {resizable && !narrow ? (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label={resizeLabel}
                tabIndex={0}
                onKeyDown={onHandleKeyDown}
                onPointerDown={onHandlePointerDown}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
                className={cn(
                  'group/handle absolute top-0 z-10 h-dvh w-1.5 cursor-col-resize focus-visible:outline-2 focus-visible:outline-[var(--as-focus-ring)]',
                  side === 'right' ? '-left-1' : '-right-1',
                )}
              >
                <span className="mx-auto block h-full w-px bg-transparent transition-colors group-hover/handle:bg-[var(--as-border)]" />
              </div>
            ) : null}
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
            <div className="flex min-h-0 flex-1 flex-col">{panel}</div>
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="absolute right-3 top-2.5 rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <X aria-hidden className="size-4" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  },
)
