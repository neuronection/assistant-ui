import * as React from 'react'
import { cn } from '../../lib/utils'

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, hint, error, id: idProp, ...props }, ref) {
    const autoId = React.useId()
    const id = idProp ?? (label || hint || error ? autoId : undefined)
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

    const textarea = (
      <textarea
        ref={ref}
        id={id}
        data-as="textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'flex min-h-16 w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)] transition-colors placeholder:text-[var(--as-muted-fg)] focus-visible:border-[var(--as-focus-ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-[var(--as-danger)] focus-visible:border-[var(--as-danger)] focus-visible:ring-[var(--as-danger)]',
          className,
        )}
        {...props}
      />
    )

    if (!label && !hint && !error) return textarea

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={id} className="text-sm font-medium leading-none text-[var(--as-fg)]">
            {label}
          </label>
        ) : null}
        {textarea}
        {hint && !error ? (
          <p id={`${id}-hint`} className="text-xs text-[var(--as-muted-fg)]">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-xs font-medium text-[var(--as-danger)]">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
