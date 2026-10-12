import * as React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'

export interface SetupFirstRunCardProps
  extends Omit<React.ComponentProps<'section'>, 'title'> {
  title: React.ReactNode
  body?: React.ReactNode
  /** The app is probing for a local engine (e.g. Ollama) — renders the
   * `probingLabel` status line while it runs. */
  localProbing?: boolean
  onSetup: () => void
  /** Optional dismiss — omit to render the card without a dismiss action. */
  onDismiss?: () => void
  /** App content between body and actions (e.g. a detected-local banner). */
  children?: React.ReactNode
  setupLabel?: string
  dismissLabel?: string
  probingLabel?: string
}

/** Empty-state CTA for the AI-settings surface when no provider is
 * configured yet (plan 26 §6) — the entry point of the setup flow. Chat
 * empty states deep-link to the settings surface that renders this card. */
export const SetupFirstRunCard = React.forwardRef<
  HTMLElement,
  SetupFirstRunCardProps
>(function SetupFirstRunCard(
  {
    title,
    body,
    localProbing = false,
    onSetup,
    onDismiss,
    children,
    setupLabel = 'Set up a provider',
    dismissLabel = 'Dismiss',
    probingLabel = 'Checking for a local engine…',
    className,
    ...props
  },
  ref,
) {
  const titleId = React.useId()
  return (
    <section
      ref={ref}
      data-as="setup-first-run-card"
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-3 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] p-4',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h3
          id={titleId}
          className="flex items-center gap-2 text-base font-semibold text-[var(--as-fg)]"
        >
          <Sparkles className="size-4 shrink-0 text-[var(--as-primary)]" aria-hidden />
          {title}
        </h3>
        {body ? (
          <p className="text-sm text-[var(--as-muted-fg)]">{body}</p>
        ) : null}
      </div>
      {children}
      {localProbing ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-[var(--as-muted-fg)]"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {probingLabel}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSetup}>
          {setupLabel}
        </Button>
        {onDismiss ? (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            {dismissLabel}
          </Button>
        ) : null}
      </div>
    </section>
  )
})
