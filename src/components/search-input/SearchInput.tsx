import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder: string
  ariaLabel: string
  autoFocus?: boolean
  clearLabel?: string
  className?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onSubmit,
      placeholder,
      ariaLabel,
      autoFocus = false,
      clearLabel = 'Clear search',
      className,
    },
    ref,
  ) {
    return (
      <form
        data-as="search-input"
        role="search"
        className={cn(
          'flex items-center gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 focus-within:border-[var(--as-focus-ring)]',
          className,
        )}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.(value)
        }}
      >
        <Search className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
        <input
          ref={ref}
          type="text"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--as-fg)] outline-none placeholder:text-[var(--as-muted-fg)]"
          placeholder={placeholder}
          aria-label={ariaLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button
            type="button"
            className="rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            onClick={() => onChange('')}
            aria-label={clearLabel}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </form>
    )
  },
)
