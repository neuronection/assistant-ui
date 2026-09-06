import * as React from 'react'
import { Brain, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Spinner } from '../spinner/Spinner'

export interface ChatReasoningLabels {
  title: string
  streaming: string
}

export interface ChatReasoningProps {
  /** Accumulated reasoning text (family `delta kind="reasoning"`). */
  text: string
  /** Live reasoning stream — spinner + streaming label while on. */
  streaming?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  labels?: Partial<ChatReasoningLabels>
  icon?: LucideIcon
  className?: string
}

/**
 * Collapsible thinking block for reasoning models (study's
 * `ReasoningBubble`, family-standard): streams live while the model
 * reasons, collapses to a summary row when done. Controlled-first.
 */
export const ChatReasoning = React.forwardRef<HTMLDivElement, ChatReasoningProps>(
  function ChatReasoning(
    { text, streaming = false, open: openProp, defaultOpen = true, onOpenChange, labels, icon: Icon = Brain, className },
    ref,
  ) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const isControlled = openProp !== undefined
    const open = isControlled ? openProp : uncontrolledOpen
    const regionId = React.useId()

    const toggle = () => {
      const next = !open
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    }

    const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggle()
      }
    }

    return (
      <div
        ref={ref}
        data-as="chat-reasoning"
        data-open={open}
        className={cn(
          'rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] text-xs text-[var(--as-muted-fg)]',
          className,
        )}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={toggle}
          onKeyDown={onKeyDown}
          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left font-medium text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          <span className="flex-1">{labels?.title ?? 'Thinking'}</span>
          {streaming ? (
            <span role="status" className="flex items-center gap-1.5 font-normal">
              <Spinner size="sm" className="text-[var(--as-muted-fg)]" />
              <span className="sr-only">{labels?.streaming ?? 'Thinking…'}</span>
            </span>
          ) : null}
          <ChevronDown
            className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
        {open ? (
          <div id={regionId} className="border-t border-[var(--as-border)] px-2.5 py-2">
            <p className="whitespace-pre-wrap break-words leading-relaxed">{text}</p>
          </div>
        ) : null}
      </div>
    )
  },
)
