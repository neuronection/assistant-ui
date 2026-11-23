import * as React from 'react'
import { MicOff, X } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface DictationUnavailableProps {
  /** Short reason shown first, e.g. 'Dictation unavailable'. */
  label: string
  /** Optional explanation, e.g. the app's assignment state. */
  detail?: string
  /** App-supplied follow-up. A label without a handler or with a blank label renders nothing. */
  action?: { label: string; onClick: () => void }
  /** When provided, renders a dismiss control (per-user notice dismissal). */
  onDismiss?: () => void
  /** Accessible name/tooltip for the dismiss control. English default: 'Dismiss'. */
  dismissLabel?: string
  className?: string
}

export const DictationUnavailable = React.forwardRef<
  HTMLDivElement,
  DictationUnavailableProps
>(function DictationUnavailable(
  { label, detail, action, onDismiss, dismissLabel = 'Dismiss', className },
  ref,
) {
  return (
    <div
      ref={ref}
      role="note"
      aria-live="polite"
      aria-atomic="true"
      data-as="dictation-unavailable"
      className={cn(
        'flex items-start gap-2 rounded-[var(--as-radius)] bg-[var(--as-muted)] px-2.5 py-2 text-xs',
        className,
      )}
    >
      <MicOff className="mt-0.5 size-3.5 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
      <span className="min-w-0 flex-1 leading-relaxed">
        <span className="font-medium text-[var(--as-fg)]">{label}</span>
        {detail ? (
          <span className="text-[var(--as-muted-fg)]"> {detail}</span>
        ) : null}
      </span>
      {action &&
      typeof action.onClick === 'function' &&
      action.label.trim() !== '' ? (
        <button
          type="button"
          className="shrink-0 rounded-[var(--as-radius-sm)] px-2 py-0.5 font-medium text-[var(--as-primary)] transition-colors hover:bg-[var(--as-surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
      {typeof onDismiss === 'function' ? (
        <button
          type="button"
          aria-label={dismissLabel}
          title={dismissLabel}
          className="mt-0.5 shrink-0 rounded-full p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          onClick={onDismiss}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  )
})
