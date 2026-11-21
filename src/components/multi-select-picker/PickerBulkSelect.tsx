import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface PickerBulkSelectProps {
  /** Every option matching the host's current filters — the bulk scope. */
  count: number
  /** How many of them are already picked (drives the tri-state). */
  pickedCount: number
  /** Check action label (the host composes it, e.g. "Select all (12)"). */
  label: string
  /** Uncheck action label — used instead of `label` once all match. */
  clearLabel?: string
  onToggle: () => void
  /** Renders nothing at `count === 0`; set false to keep it inert. */
  disabled?: boolean
  className?: string
}

/**
 * The bulk "select all matching" control of the catalog-picker module: one
 * `role="checkbox"` with a checkbox-shaped tri-state (`mixed` when only part
 * of the matching set is picked). Data in, event out — the host owns the
 * scope and the selection; `PickerBrowseModal` uses it internally when
 * `selectAll` is on, and a host with its own browsing body (a card gallery,
 * a graph) places it directly so no surface re-implements the semantics.
 */
export const PickerBulkSelect = React.forwardRef<
  HTMLButtonElement,
  PickerBulkSelectProps
>(function PickerBulkSelect(
  { count, pickedCount, label, clearLabel, onToggle, disabled = false, className },
  ref,
) {
  if (count === 0) return null
  const allPicked = pickedCount >= count
  const somePicked = pickedCount > 0
  const text = allPicked && clearLabel ? clearLabel : label
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      data-as="picker-bulk-select"
      data-state={allPicked ? 'checked' : somePicked ? 'mixed' : 'unchecked'}
      aria-checked={allPicked ? true : somePicked ? 'mixed' : false}
      aria-label={text}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'flex cursor-pointer items-center gap-2 self-start rounded-[var(--as-radius-sm)] px-1 py-0.5 text-xs text-[var(--as-fg)] transition-colors hover:text-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[calc(var(--as-radius-sm)-2px)] transition-colors',
          allPicked || somePicked
            ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
            : 'border border-[var(--as-border)] text-[var(--as-muted-fg)]',
        )}
      >
        {allPicked ? (
          <Check className="size-3" aria-hidden />
        ) : somePicked ? (
          <Minus className="size-3" aria-hidden />
        ) : null}
      </span>
      <span>{text}</span>
    </button>
  )
})
