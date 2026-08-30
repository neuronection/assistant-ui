import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.ComponentProps<'input'> {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, id: idProp, ...props },
  ref,
) {
  const autoId = React.useId()
  const id = idProp ?? (label || hint || error ? autoId : undefined)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  const input = (
    <input
      ref={ref}
      id={id}
      data-as="input"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(
        'flex h-9 w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-1 text-sm text-[var(--as-fg)] transition-colors placeholder:text-[var(--as-muted-fg)] focus-visible:border-[var(--as-focus-ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-focus-ring)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        error &&
          'border-[var(--as-danger)] focus-visible:border-[var(--as-danger)] focus-visible:ring-[var(--as-danger)]',
        className,
      )}
      {...props}
    />
  )

  if (!label && !hint && !error) return input

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium leading-none text-[var(--as-fg)]">
          {label}
        </label>
      ) : null}
      {input}
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
})
