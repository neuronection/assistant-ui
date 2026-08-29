import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ScaleSliderProps
  extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value: number | '' | null | undefined
  onChange: (value: number | '') => void
  min: number
  max: number
  step?: number
  lowLabel?: string
  highLabel?: string
  showInput?: boolean
  disabled?: boolean
  ariaLabel?: string
}

export function scaleColorForValue(
  min: number,
  max: number,
  value: number | '' | null | undefined,
): string {
  if (value === '' || value === null || value === undefined) {
    return 'var(--as-muted-fg)'
  }
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 'var(--as-muted-fg)'
  return positionColor((numeric - min) / (max - min))
}

function positionColor(position: number): string {
  const clamped = Math.max(0, Math.min(1, position))
  const hue = 142 * (1 - clamped)
  return `hsl(${hue.toFixed(0)}, 72%, 48%)`
}

export const ScaleSlider = React.forwardRef<HTMLDivElement, ScaleSliderProps>(
  function ScaleSlider(
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      lowLabel,
      highLabel,
      showInput = true,
      disabled = false,
      ariaLabel = 'Scale',
      className,
      ...props
    },
    ref,
  ) {
    const numericValue =
      value === '' ||
      value === null ||
      value === undefined ||
      Number.isNaN(value as number)
        ? null
        : Number(value)
    const thumbColor = scaleColorForValue(min, max, value)
    const sliderValue = numericValue === null ? min : numericValue

    const handleSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
      const numeric = Number(event.target.value)
      onChange(Number.isNaN(numeric) ? '' : numeric)
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value
      if (raw === '') {
        onChange('')
        return
      }
      const numeric = Number(raw)
      onChange(Number.isNaN(numeric) ? '' : numeric)
    }

    const handleInputBlur = () => {
      if (numericValue === null) return
      const clamped = Math.max(min, Math.min(max, numericValue))
      if (clamped !== numericValue) onChange(clamped)
    }

    const showLabels = Boolean(lowLabel || highLabel)

    return (
      <div
        ref={ref}
        data-as="scale-slider"
        className={cn('flex flex-col gap-1.5', className)}
        {...props}
      >
        <div className="flex items-center gap-3">
          <input
            type="range"
            aria-label={ariaLabel}
            className={cn(
              'h-1.5 flex-1 cursor-pointer accent-[var(--as-primary)]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            disabled={disabled}
            onChange={handleSlider}
          />
          {showInput ? (
            <input
              type="number"
              aria-label={`${ariaLabel} value`}
              min={min}
              max={max}
              step={step}
              value={value ?? ''}
              disabled={disabled}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              style={{ borderColor: thumbColor }}
              className="w-16 rounded-[var(--as-radius-sm)] border-2 bg-[var(--as-surface-raised)] px-2 py-1.5 text-center text-sm font-bold text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:opacity-50"
            />
          ) : null}
        </div>
        {showLabels ? (
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider opacity-50">
            <span style={{ color: positionColor(0) }}>{lowLabel}</span>
            <span style={{ color: positionColor(1) }}>{highLabel}</span>
          </div>
        ) : null}
      </div>
    )
  },
)
