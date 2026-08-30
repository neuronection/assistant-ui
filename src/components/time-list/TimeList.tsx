import * as React from 'react'
import { Clock as ClockIcon, Plus, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { TimePickerContent } from '../time-picker/TimePicker'

export interface TimeListProps {
  /** List of 24-hour `HH:MM` strings. */
  value: string[]
  /** Push the fully replaced list back to the parent. */
  onChange: (next: string[]) => void
  /** Optional heading rendered above the chips. */
  label?: string
  /** Optional helper text rendered under the label. */
  hint?: string
  addLabel?: string
  emptyLabel?: string
  /** Cap the number of chips; renders a note when reached. */
  maxItems?: number
  maxItemsLabel?: (n: number) => string
  removeLabel?: string
  /** Disable every chip + the add button. */
  disabled?: boolean
  /** Diameter of the picker's clock face (default 220). */
  clockSize?: number
  className?: string
}

function readTime(value: string): { h12: number; min: number; period: 'AM' | 'PM' } | null {
  const m = /^(\d{1,2}):(\d{1,2})$/.exec((value || '').trim())
  if (!m) return null
  const h = parseInt(m[1]!, 10)
  const min = parseInt(m[2]!, 10)
  if (Number.isNaN(h) || Number.isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return null
  const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { h12, min, period }
}

interface ChipProps {
  value: string
  onChange: (v: string) => void
  onRemove: () => void
  clockSize: number
  removeLabel: string
  disabled?: boolean
}

const TimeChip: React.FC<ChipProps> = ({
  value,
  onChange,
  onRemove,
  clockSize,
  removeLabel,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false)
  const parsed = readTime(value ?? '')

  const main = parsed ? parsed.h12.toString() : '--'
  const minStr = parsed ? parsed.min.toString().padStart(2, '0') : '--'
  const period = parsed ? parsed.period : ''

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <span className="relative inline-flex group">
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            aria-label={`Edit ${value}`}
            className={cn(
              'inline-flex cursor-pointer select-none items-center gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] py-2 pl-3 pr-7 transition-[border-color,box-shadow,translate] hover:border-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
              !disabled && 'hover:-translate-y-0.5 hover:shadow-[var(--as-shadow-2)]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[var(--as-radius-sm)] bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] text-[var(--as-primary)]">
              <ClockIcon className="size-4" aria-hidden />
            </span>
            <span className="flex items-baseline gap-1 tabular-nums">
              <span className="text-base font-extrabold leading-none text-[var(--as-fg)]">
                {main}:{minStr}
              </span>
              {period ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--as-muted-fg)]">
                  {period}
                </span>
              ) : null}
            </span>
          </button>
        </PopoverTrigger>
        {!disabled ? (
          <button
            type="button"
            aria-label={removeLabel}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute right-1.5 top-1/2 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-[var(--as-surface-raised)] text-[var(--as-muted-fg)] opacity-0 transition-all hover:bg-[var(--as-danger)] hover:text-[var(--as-danger-fg)] focus-visible:opacity-100 group-hover:opacity-100"
            style={{ translate: '0 -50%' }}
          >
            <X className="size-3" aria-hidden />
          </button>
        ) : null}
        <PopoverContent
          align="center"
          sideOffset={6}
          collisionPadding={8}
          aria-label={`Edit ${value}`}
          className="w-[300px] p-0"
        >
          <TimePickerContent
            value={value}
            onChange={onChange}
            onDone={() => setOpen(false)}
            size={clockSize}
          />
        </PopoverContent>
      </span>
    </Popover>
  )
}

/**
 * Chip-based editor for a list of `HH:MM` times: each chip opens the clock
 * picker, an add pill appends a slot. For a single time use `TimePicker`.
 */
export const TimeList = React.forwardRef<HTMLDivElement, TimeListProps>(
  function TimeList(
    {
      value,
      onChange,
      label,
      hint,
      addLabel = 'Add time',
      emptyLabel,
      maxItems,
      maxItemsLabel = (n) => `Maximum of ${n} items.`,
      removeLabel = 'Remove time',
      disabled = false,
      clockSize = 220,
      className,
    },
    ref,
  ) {
    const updateAt = React.useCallback(
      (i: number, v: string) => {
        if (disabled) return
        const next = value.slice()
        next[i] = v
        onChange(next)
      },
      [disabled, value, onChange],
    )

    const removeAt = React.useCallback(
      (i: number) => {
        if (disabled) return
        onChange(value.filter((_, idx) => idx !== i))
      },
      [disabled, value, onChange],
    )

    const add = React.useCallback(() => {
      if (disabled) return
      if (maxItems !== undefined && value.length >= maxItems) return
      onChange([...value, '09:00'])
    }, [disabled, maxItems, value, onChange])

    const atMax = maxItems !== undefined && value.length >= maxItems

    return (
      <div ref={ref} data-as="time-list" className={cn('flex flex-col gap-2', className)}>
        {label || hint ? (
          <div>
            {label ? (
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--as-muted-fg)]">
                {label}
              </p>
            ) : null}
            {hint ? (
              <p className="mt-0.5 px-1 text-[11px] text-[var(--as-muted-fg)]">{hint}</p>
            ) : null}
          </div>
        ) : null}

        {value.length === 0 && emptyLabel ? (
          <p className="px-1 py-2 text-xs italic text-[var(--as-muted-fg)]">{emptyLabel}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.map((time, i) => (
              <TimeChip
                key={`${i}-${time}`}
                value={time}
                onChange={(v) => updateAt(i, v)}
                onRemove={() => removeAt(i)}
                clockSize={clockSize}
                removeLabel={removeLabel}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {!atMax && !disabled ? (
          <button
            type="button"
            onClick={add}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--as-radius)] border border-dashed border-[var(--as-border)] py-1.5 pl-2.5 pr-3 text-xs font-bold text-[var(--as-muted-fg)] transition-colors hover:border-[var(--as-primary)] hover:bg-[color-mix(in_srgb,var(--as-primary)_6%,transparent)] hover:text-[var(--as-primary)]"
          >
            <Plus className="size-3.5" aria-hidden />
            {addLabel}
          </button>
        ) : null}

        {atMax && maxItems !== undefined ? (
          <p className="text-[10px] italic text-[var(--as-muted-fg)]">{maxItemsLabel(maxItems)}</p>
        ) : null}
      </div>
    )
  },
)
