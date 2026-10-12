import * as React from 'react'
import { Sparkles } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface ChatWelcomeProps {
  /** Greeting headline, e.g. "Ask anything about your courses". */
  title: string
  subtitle?: string
  /** Suggestion cards / chips — children stagger in (40 ms steps). */
  suggestions?: React.ReactNode
  /** Node inside the breathing `--as-ai` orb. Default: `Sparkles`. */
  icon?: React.ReactNode
  /** `page` centers generously; `sidebar` is the default density; `bubble` is compact. */
  variant?: 'page' | 'sidebar' | 'bubble'
  className?: string
}

/**
 * The chat empty-state kit (plan 100 S6): breathing `--as-ai` identity
 * orb, greeting, subtitle and staggered suggestion slots — drop it into
 * `ChatTranscript emptyState`. Presentational; suggestion targets stay
 * app-side.
 */
export const ChatWelcome = React.forwardRef<HTMLDivElement, ChatWelcomeProps>(
  function ChatWelcome({ title, subtitle, suggestions, icon, variant = 'sidebar', className }, ref) {
    return (
      <div
        ref={ref}
        data-as="chat-welcome"
        data-variant={variant}
        className={cn(
          'as-anim-fade-swap flex min-h-40 w-full flex-col items-center justify-center gap-2 p-6 text-center',
          variant === 'page' && 'min-h-56 gap-3 p-10',
          variant === 'bubble' && 'min-h-32 gap-1.5 p-4',
          className,
        )}
      >
        <div className="as-anim-breathe flex size-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--as-ai),var(--as-primary))] shadow-[var(--as-shadow-2)]">
          {icon ?? <Sparkles className="size-6 text-[var(--as-ai-fg)]" aria-hidden />}
        </div>
        <p className="text-lg font-semibold text-[var(--as-fg)]">{title}</p>
        {subtitle ? <p className="max-w-sm text-sm text-[var(--as-muted-fg)]">{subtitle}</p> : null}
        {suggestions ? (
          <div data-as="chat-welcome-suggestions" className="mt-2 flex w-full flex-col items-stretch gap-2">
            {suggestions}
          </div>
        ) : null}
      </div>
    )
  },
)
