import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ChipInputProps
  extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  separators?: string[]
  inputLabel?: string
  removeLabel?: string
  disabled?: boolean
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const ChipInput = React.forwardRef<HTMLDivElement, ChipInputProps>(
  function ChipInput(
    {
      value,
      onChange,
      placeholder,
      separators = [','],
      inputLabel = 'Add',
      removeLabel = 'Remove',
      disabled = false,
      className,
      ...props
    },
    ref,
  ) {
    const [draft, setDraft] = React.useState('')
    const inputRef = React.useRef<HTMLInputElement>(null)

    const commit = (raw: string) => {
      const separatorPattern = new RegExp(
        `[${separators.map(escapeRegex).join('')}\\n\\r]`,
      )
      const existing = new Set(value.map((chip) => chip.toLowerCase()))
      const next = [...value]
      for (const part of raw.split(separatorPattern)) {
        const trimmed = part.trim()
        if (trimmed && !existing.has(trimmed.toLowerCase())) {
          next.push(trimmed)
          existing.add(trimmed.toLowerCase())
        }
      }
      if (next.length !== value.length) {
        onChange(next)
      }
      setDraft('')
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || separators.includes(event.key)) {
        event.preventDefault()
        commit(draft)
      } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
        event.preventDefault()
        onChange(value.slice(0, -1))
      }
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault()
      const text = event.clipboardData.getData('text')
      commit(`${draft}${text}`)
    }

    const removeAt = (index: number) => {
      onChange(value.filter((_, i) => i !== index))
    }

    return (
      <div
        ref={ref}
        data-as="chip-input"
        role="group"
        onClick={() => {
          if (!disabled) inputRef.current?.focus()
        }}
        className={cn(
          'flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2.5 py-1.5 text-sm outline-none transition-colors focus-within:border-[var(--as-focus-ring)] focus-within:ring-2 focus-within:ring-[var(--as-focus-ring)]',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        {...props}
      >
        {value.map((chip, index) => (
          <span
            key={`${chip}-${index}`}
            className="inline-flex items-center gap-1 rounded-[calc(var(--as-radius-sm)-2px)] bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] py-0.5 pl-2.5 pr-1.5 text-xs font-medium text-[var(--as-primary)]"
          >
            {chip}
            <button
              type="button"
              disabled={disabled}
              aria-label={`${removeLabel} ${chip}`}
              onClick={(event) => {
                event.stopPropagation()
                removeAt(index)
              }}
              className="cursor-pointer rounded-full opacity-70 transition-colors hover:text-[var(--as-danger)] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none"
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          aria-label={inputLabel}
          disabled={disabled}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (draft.trim()) commit(draft)
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-24 flex-1 bg-transparent text-sm text-[var(--as-fg)] outline-none placeholder:text-[var(--as-muted-fg)]"
        />
      </div>
    )
  },
)
