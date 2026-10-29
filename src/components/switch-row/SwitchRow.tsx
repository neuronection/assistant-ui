import * as React from 'react'
import { cn } from '../../lib/utils'

export interface SwitchRowProps
  extends Omit<React.ComponentProps<'button'>, 'onChange'> {
  /** Visible row label — doubles as the switch's accessible name. */
  label: React.ReactNode
  /** Controlled on/off state. */
  checked: boolean
  /** Controlled toggle. */
  onCheckedChange: (checked: boolean) => void
  /** Sub-line under the label — apps pass the current value ("now: gpt-5"). */
  currentValue?: React.ReactNode
  disabled?: boolean
  /** Knob-only rendering (dense grids): the label stays in the
   * accessibility tree as visually-hidden text. */
  hideLabel?: boolean
}

/** Labeled `role="switch"` row with an animated knob — the standalone
 * settings toggle the family's setup surfaces (desktop/study/health)
 * previously hand-rolled. */
export const SwitchRow = React.forwardRef<HTMLButtonElement, SwitchRowProps>(
  function SwitchRow(
    {
      label,
      checked,
      onCheckedChange,
      currentValue,
      disabled = false,
      hideLabel = false,
      className,
      onClick,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        data-as="switch-row"
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          onCheckedChange(!checked)
        }}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-left text-sm text-[var(--as-fg)] transition-colors hover:bg-[var(--as-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          {hideLabel ? (
            <span className="sr-only">{label}</span>
          ) : (
            <span className="truncate font-medium">{label}</span>
          )}
          {currentValue != null && currentValue !== '' ? (
            <span className="truncate text-xs text-[var(--as-muted-fg)]">
              {currentValue}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150',
            checked ? 'bg-[var(--as-primary)]' : 'bg-[var(--as-border)]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-[var(--as-surface-raised)] shadow transition-all duration-150',
              checked ? 'left-[1.125rem]' : 'left-0.5',
            )}
          />
        </span>
      </button>
    )
  },
)
