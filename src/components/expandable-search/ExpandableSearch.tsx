import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ExpandableSearchProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  onClear?: () => void
  placeholder: string
  ariaLabel: string
  clearLabel?: string
  expandLabel?: string
  className?: string
}

export const ExpandableSearch = React.forwardRef<HTMLInputElement, ExpandableSearchProps>(
  function ExpandableSearch(
    {
      value,
      onChange,
      onSubmit,
      onClear,
      placeholder,
      ariaLabel,
      clearLabel = 'Clear search',
      expandLabel = 'Search',
      className,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(value !== '')
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    React.useEffect(() => {
      if (open) {
        inputRef.current?.focus()
      }
    }, [open])

    const clear = () => {
      onChange('')
      onClear?.()
    }

    return (
      <form
        data-as="expandable-search"
        role="search"
        className={cn(
          'flex h-9 items-center overflow-hidden rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] transition-[width] duration-300 ease-out focus-within:border-[var(--as-focus-ring)]',
          open ? 'w-64' : 'w-9',
          className,
        )}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.(value)
        }}
      >
        <button
          type="button"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center text-[var(--as-muted-fg)] hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--as-focus-ring)]"
          aria-label={open ? undefined : expandLabel}
          title={open ? undefined : expandLabel}
          onClick={() => {
            if (!open) {
              setOpen(true)
            } else {
              inputRef.current?.focus()
            }
          }}
        >
          <Search className="size-4" aria-hidden />
        </button>
        <input
          ref={inputRef}
          type="text"
          className={cn(
            'min-w-0 flex-1 bg-transparent text-sm text-[var(--as-fg)] outline-none transition-opacity duration-200 placeholder:text-[var(--as-muted-fg)]',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              if (value) {
                clear()
              } else {
                setOpen(false)
              }
            }
          }}
          onBlur={() => {
            if (!value) {
              setOpen(false)
            }
          }}
        />
        {open && value ? (
          <button
            type="button"
            className="mr-2 shrink-0 cursor-pointer rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            aria-label={clearLabel}
            onClick={clear}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </form>
    )
  },
)
