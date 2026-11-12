import * as React from 'react'
import { MicOff } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface DictationUnavailableProps {
  /** Short reason shown first, e.g. 'Dictation unavailable'. */
  label: string
  /** Optional explanation, e.g. the app's assignment state. */
  detail?: string
  /** App-supplied follow-up. A label without a handler or with a blank label renders nothing. */
  action?: { label: string; onClick: () => void }
  className?: string
}

export const DictationUnavailable = React.forwardRef<
  HTMLDivElement,
  DictationUnavailableProps
>(function DictationUnavailable({ label, detail, action, className }, ref) {
  return (
    <div
      ref={ref}
      role="note"
      aria-live="polite"
      aria-atomic="true"
      data-as="dictation-unavailable"
      className={cn(
        'flex items-center gap-2 rounded-[var(--as-radius)] border border-dashed border-[var(--as-border)] bg-[var(--as-surface)] px-2.5 py-1.5 text-xs',
        className,
      )}
    >
      <MicOff className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="font-medium text-[var(--as-fg)]">{label}</span>
        {detail ? (
          <span className="break-words text-[var(--as-muted-fg)]"> {detail}</span>
        ) : null}
      </span>
      {action &&
      typeof action.onClick === 'function' &&
      action.label.trim() !== '' ? (
        <button
          type="button"
          className="shrink-0 rounded-[var(--as-radius-sm)] px-2 py-1 font-medium text-[var(--as-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
})
