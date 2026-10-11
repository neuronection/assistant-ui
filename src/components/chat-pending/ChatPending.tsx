import * as React from 'react'

import { cn } from '../../lib/utils'
import { ChatTurnStatus } from '../chat-turn-status/ChatTurnStatus'

export interface ChatPendingProps {
  /**
   * Phase label narrated while the first token is awaited, e.g.
   * "thinking" — usually the live turn's current node label.
   */
  label?: string
  /** Turn start timestamp (ms) — enables the elapsed timer. */
  startedAt?: number
  /** Placeholder line count. Default 2 (capped at 6). */
  lines?: number
  /** Extra node under the placeholder (model badge, app hints). */
  children?: React.ReactNode
  className?: string
}

/**
 * The first-token latency placeholder (plan 100 S2): narrated phase row
 * (dots + elapsed timer via `ChatTurnStatus`) over an assistant-aligned
 * shimmer placeholder tinted with the `--as-ai` accent. Render it as the
 * transcript's `live` tail between send and the first delta.
 */
export const ChatPending = React.forwardRef<HTMLDivElement, ChatPendingProps>(
  function ChatPending({ label = 'thinking', startedAt, lines = 2, children, className }, ref) {
    const count = Math.min(Math.max(Math.round(lines), 1), 6)
    return (
      <div
        ref={ref}
        data-as="chat-pending"
        className={cn('flex w-full max-w-[92%] flex-col gap-1.5', className)}
      >
        <ChatTurnStatus label={label} startedAt={startedAt} />
        <div
          aria-hidden
          className="flex flex-col gap-2 rounded-[var(--as-radius)] rounded-bl-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2.5 shadow-[inset_2px_0_0_var(--as-ai)]"
        >
          {Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              className={cn(
                'as-anim-shimmer h-3.5 rounded-[var(--as-radius-sm)] bg-[var(--as-muted)]',
                index === count - 1 && count > 1 && 'w-3/5',
              )}
            />
          ))}
        </div>
        {children}
      </div>
    )
  },
)
