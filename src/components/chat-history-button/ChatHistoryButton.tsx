import * as React from 'react'
import { History } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { PopoverButton } from '../popover-button/PopoverButton'

export interface ChatHistoryButtonLabels {
  open: string
}

export interface ChatHistoryButtonProps {
  /**
   * Popover content, typically the app's session-list glue. Called with
   * `close` — invoke it after a pick to dismiss the popover (the
   * `closeSignal` pattern underneath).
   */
  children: (close: () => void) => React.ReactNode
  icon?: LucideIcon
  /** Called every time the popover opens — refresh the session list here. */
  onOpen?: () => void
  align?: 'start' | 'center' | 'end'
  panelClassName?: string
  labels?: Partial<ChatHistoryButtonLabels>
  className?: string
}

/**
 * Header entry point for a chat's session history (career's
 * `HistoryButton` + study's ChatPanel history popover, generalized): a
 * labelled popover trigger wrapping the app's session list. The list
 * itself (search, actions) stays app-side via
 * [`ChatSessionList`](../chat-session-list) glue.
 */
export function ChatHistoryButton({
  children,
  icon: Icon = History,
  onOpen,
  align = 'end',
  panelClassName,
  labels,
  className,
}: ChatHistoryButtonProps) {
  const [closeSignal, setCloseSignal] = React.useState(0)
  const close = React.useCallback(() => setCloseSignal((signal) => signal + 1), [])
  return (
    <span className={cn('inline-flex', className)} data-as="chat-history-button">
      <PopoverButton
        label={labels?.open ?? 'Chat history'}
        trigger={<Icon className="size-4" aria-hidden />}
        align={align}
        closeSignal={closeSignal}
        onOpenChange={(open) => {
          if (open) {
            onOpen?.()
          }
        }}
        panelClassName={cn('h-96 w-72 p-2', panelClassName)}
      >
        {children(close)}
      </PopoverButton>
    </span>
  )
}
