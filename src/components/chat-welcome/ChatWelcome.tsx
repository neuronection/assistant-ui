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
    const page = variant === 'page'
    return (
      <div
        ref={ref}
        data-as="chat-welcome"
        data-variant={variant}
        className={cn(
          'as-anim-fade-swap flex min-h-40 w-full flex-col items-center justify-center text-center',
          page ? 'min-h-56 gap-3 p-6 sm:p-10' : variant === 'bubble' ? 'min-h-32 gap-1.5 p-4' : 'gap-2 p-5 sm:p-6',
          className,
        )}
      >
        <div className="relative mb-1 flex items-center justify-center">
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute rounded-full bg-[linear-gradient(135deg,var(--as-ai),var(--as-primary))] opacity-25 blur-xl',
              page ? '-inset-4' : '-inset-3',
            )}
          />
          <div
            data-as="chat-welcome-orb"
            className={cn(
              'as-anim-breathe relative flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--as-ai),var(--as-primary))] shadow-[var(--as-shadow-2)] ring-1 ring-[color-mix(in_srgb,var(--as-ai-fg)_20%,transparent)]',
              page ? 'size-14' : variant === 'bubble' ? 'size-10' : 'size-12',
            )}
          >
            {icon ?? (
              <Sparkles
                className={page ? 'size-6 text-[var(--as-ai-fg)]' : 'size-5 text-[var(--as-ai-fg)]'}
                aria-hidden
              />
            )}
          </div>
        </div>
        <p
          data-as="chat-welcome-title"
          className={cn(
            'max-w-md text-balance font-semibold tracking-[-0.02em] text-[var(--as-fg)]',
            page ? 'text-xl sm:text-2xl' : 'text-lg',
          )}
        >
          {title}
        </p>
        {subtitle ? (
          <p className="max-w-md text-balance text-sm text-[var(--as-muted-fg)] sm:text-[0.9375rem]">
            {subtitle}
          </p>
        ) : null}
        {suggestions ? (
          <div
            data-as="chat-welcome-suggestions"
            className={cn(
              'mt-3 flex w-full max-w-xl flex-col items-stretch gap-2',
              page && 'sm:grid sm:grid-cols-2',
            )}
          >
            {suggestions}
          </div>
        ) : null}
      </div>
    )
  },
)
