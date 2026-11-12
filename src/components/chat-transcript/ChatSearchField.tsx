import * as React from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface ChatSearchFieldLabels {
  search: string
  placeholder: string
  previous: string
  next: string
  clear: string
  matches: string
}

export interface ChatSearchFieldProps {
  query: string
  onQueryChange: (query: string) => void
  /** Total matches in the transcript (drives the `n/N` readout). */
  matchCount?: number
  /** 0-based active match index. */
  activeIndex?: number
  onPrevious?: () => void
  onNext?: () => void
  labels?: Partial<ChatSearchFieldLabels>
  className?: string
}

/**
 * The in-conversation search field (plan 101 P2): controlled query input
 * with an `n/N` match readout and prev/next controls. Enter jumps to the
 * next match, Shift+Enter to the previous, Escape clears. Composed by
 * `ChatTranscript` when its `search` prop is given, or standalone.
 */
export const ChatSearchField = React.forwardRef<HTMLDivElement, ChatSearchFieldProps>(
  function ChatSearchField(
    { query, onQueryChange, matchCount, activeIndex, onPrevious, onNext, labels, className },
    ref,
  ) {
    const inputId = React.useId()

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onQueryChange('')
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (event.shiftKey) {
          onPrevious?.()
        } else {
          onNext?.()
        }
      }
    }

    const hasMatches = matchCount !== undefined && matchCount > 0
    const readout =
      matchCount === undefined
        ? null
        : hasMatches
          ? `${(activeIndex ?? 0) + 1}/${matchCount}`
          : '0'

    return (
      <div
        ref={ref}
        data-as="chat-search-field"
        className={cn(
          'flex items-center gap-1 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1',
          className,
        )}
      >
        <Search className="size-3.5 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
        <input
          id={inputId}
          type="text"
          value={query}
          placeholder={labels?.placeholder ?? 'Search conversation'}
          aria-label={labels?.search ?? 'Search conversation'}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-xs text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-none"
        />
        {readout !== null ? (
          <span
            aria-label={labels?.matches ?? 'matches'}
            className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--as-muted-fg)]"
          >
            {readout}
          </span>
        ) : null}
        {query !== '' ? (
          <button
            type="button"
            aria-label={labels?.clear ?? 'Clear search'}
            onClick={() => onQueryChange('')}
            className="rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={labels?.previous ?? 'Previous match'}
          disabled={!hasMatches}
          onClick={onPrevious}
          className="rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <ChevronUp className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={labels?.next ?? 'Next match'}
          disabled={!hasMatches}
          onClick={onNext}
          className="rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </div>
    )
  },
)
