import * as React from 'react'
import { Send, Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

export interface AiAction {
  id: string
  label: string
  description?: string
  icon: LucideIcon
}

export interface AiActionsDropdownProps {
  actions: AiAction[]
  onAction: (action: AiAction) => void
  onPrompt?: (prompt: string) => void
  busy?: boolean
  error?: string | null
  label?: string
  title?: string
  promptLabel?: string
  promptPlaceholder?: string
  promptSubmitLabel?: string
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  panelClassName?: string
}

export const AiActionsDropdown = React.forwardRef<
  HTMLButtonElement,
  AiActionsDropdownProps
>(function AiActionsDropdown(
  {
    actions,
    onAction,
    onPrompt,
    busy = false,
    error,
    label = 'AI actions',
    title,
    promptLabel = 'Ask something custom',
    promptPlaceholder,
    promptSubmitLabel = 'Send',
    disabled = false,
    align = 'end',
    side = 'bottom',
    className,
    panelClassName,
  },
  ref,
) {
  const [open, setOpen] = React.useState(false)
  const [prompt, setPrompt] = React.useState('')

  const sendPrompt = () => {
    const trimmed = prompt.trim()
    if (!trimmed || busy || !onPrompt) return
    onPrompt(trimmed)
    setPrompt('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span className="relative inline-flex">
        <PopoverTrigger asChild disabled={disabled || busy}>
          <button
            ref={ref}
            type="button"
            data-as="ai-actions-dropdown"
            aria-label={label}
            className={cn(
              'inline-flex size-7 cursor-pointer items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--as-ai)_12%,transparent)] text-[var(--as-ai)] transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
              className,
            )}
          >
            <Sparkles className="size-4" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          align={align}
          aria-label={title ?? label}
          className={cn('w-64 p-1.5', panelClassName)}
        >
          <div data-as="ai-actions-panel" role="menu">
            {title ? (
              <p className="px-2 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
                {title}
              </p>
            ) : null}
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => onAction(action)}
                className="flex w-full cursor-pointer items-start gap-2.5 rounded-[var(--as-radius-sm)] px-2 py-2 text-left transition-colors hover:bg-[var(--as-secondary)] disabled:pointer-events-none disabled:opacity-50"
              >
                <action.icon
                  className="mt-0.5 size-4 shrink-0 text-[var(--as-ai)]"
                  aria-hidden
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--as-fg)]">
                    {action.label}
                  </span>
                  {action.description ? (
                    <span className="text-xs text-[var(--as-muted-fg)]">
                      {action.description}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
            {onPrompt ? (
              <form
                className="mt-1 flex items-center gap-1.5 border-t border-[var(--as-border)] p-1.5"
                onSubmit={(event) => {
                  event.preventDefault()
                  sendPrompt()
                }}
              >
                <input
                  type="text"
                  aria-label={promptLabel}
                  placeholder={promptPlaceholder ?? promptLabel}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-[var(--as-muted-fg)]"
                />
                <button
                  type="submit"
                  aria-label={promptSubmitLabel}
                  disabled={busy || !prompt.trim()}
                  className="shrink-0 cursor-pointer rounded-[var(--as-radius-sm)] bg-[var(--as-ai)] p-1 text-[var(--as-ai-fg)] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Send className="size-3" aria-hidden />
                </button>
              </form>
            ) : null}
            {busy ? (
              <p className="px-2 pb-1.5 text-xs text-[var(--as-muted-fg)]" role="status">
                …
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="px-2 pb-1.5 text-xs text-[var(--as-danger)]">
                {error}
              </p>
            ) : null}
          </div>
        </PopoverContent>
      </span>
    </Popover>
  )
})
