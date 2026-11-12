import * as React from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface ChatSuggestionCardProps extends React.ComponentProps<'button'> {
  /** Leading icon (defaults to none — pass `Sparkles`, `BookOpen`, …). */
  icon?: LucideIcon
  /** Trailing hint text, e.g. "5 min". */
  hint?: string
  children: React.ReactNode
}

/**
 * The family suggestion card (plan 101 P4): the standard action chip for
 * `ChatWelcome suggestions` and composer suggestion strips — left-aligned
 * icon + title + hint with a lift-on-hover affordance (border + shadow,
 * no transform utilities: TW3-safe).
 */
export const ChatSuggestionCard = React.forwardRef<HTMLButtonElement, ChatSuggestionCardProps>(
  function ChatSuggestionCard({ icon: Icon, hint, className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        data-as="chat-suggestion-card"
        className={cn(
          'flex w-full items-center gap-2.5 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2.5 text-left text-sm text-[var(--as-fg)] shadow-[var(--as-shadow-1)] transition-[border-color,box-shadow,background-color] duration-[var(--as-duration-fast)] ease-[var(--as-ease-standard)] hover:border-[var(--as-primary)] hover:bg-[var(--as-surface-raised)] hover:shadow-[var(--as-shadow-2)] focus-visible:border-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {Icon ? <Icon className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden /> : null}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {hint ? <span className="shrink-0 text-xs text-[var(--as-muted-fg)]">{hint}</span> : null}
      </button>
    )
  },
)
