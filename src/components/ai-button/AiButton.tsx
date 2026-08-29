import * as React from 'react'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

export interface AiButtonProps {
  onSubmit: (prompt: string) => void
  suggestions?: string[]
  onResponse?: React.ReactNode
  loading?: boolean
  error?: string | null
  label?: string
  promptLabel?: string
  submitLabel?: string
  loadingLabel?: string
  placeholder?: string
  disabled?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  className?: string
  panelClassName?: string
}

export const AiButton = React.forwardRef<HTMLButtonElement, AiButtonProps>(
  function AiButton(
    {
      onSubmit,
      suggestions = [],
      onResponse,
      loading = false,
      error,
      label = 'Ask AI',
      promptLabel = 'Ask a question',
      submitLabel = 'Send',
      loadingLabel = 'Thinking…',
      placeholder,
      disabled = false,
      side = 'bottom',
      align = 'end',
      className,
      panelClassName,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const [prompt, setPrompt] = React.useState('')

    const send = (value: string) => {
      const trimmed = value.trim()
      if (!trimmed || loading) return
      onSubmit(trimmed)
      setPrompt('')
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <span className="relative inline-flex">
          <PopoverTrigger asChild disabled={disabled}>
            <button
              ref={ref}
              type="button"
              data-as="ai-button"
              aria-label={label}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--as-ai)_12%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--as-ai)] transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
                className,
              )}
            >
              <Sparkles className="size-3.5" aria-hidden />
              {label}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side={side}
            align={align}
            aria-label={label}
            className={cn('w-72 p-3', panelClassName)}
          >
            <form
              data-as="ai-button-panel"
              onSubmit={(event) => {
                event.preventDefault()
                send(prompt)
              }}
            >
              {suggestions.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={loading}
                      onClick={() => send(suggestion)}
                      className="cursor-pointer rounded-[var(--as-radius-sm)] bg-[var(--as-secondary)] px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--as-ai)_14%,var(--as-secondary))] disabled:pointer-events-none disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="text"
                  aria-label={promptLabel}
                  placeholder={placeholder ?? promptLabel}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="h-8 w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 text-sm outline-none placeholder:text-[var(--as-muted-fg)] focus-visible:border-[var(--as-focus-ring)]"
                />
                <button
                  type="submit"
                  aria-label={submitLabel}
                  disabled={loading || !prompt.trim()}
                  className="shrink-0 cursor-pointer rounded-[var(--as-radius-sm)] bg-[var(--as-ai)] p-1.5 text-[var(--as-ai-fg)] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Send className="size-3.5" aria-hidden />
                </button>
              </div>
              {loading ? (
                <p className="text-sm text-[var(--as-muted-fg)]" role="status">
                  {loadingLabel}
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="text-sm text-[var(--as-danger)]">
                  {error}
                </p>
              ) : null}
              {onResponse}
            </form>
          </PopoverContent>
        </span>
      </Popover>
    )
  },
)
