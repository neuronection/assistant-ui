import * as React from 'react'
import { cn } from '../../lib/utils'

export interface RangeBarProps extends React.ComponentProps<'div'> {
  low: number
  high: number
  min?: number
  max?: number
  value?: number | null
  unit?: string
  label?: string
  valueLabel?: string
}

function pct(value: number, domainMin: number, domainMax: number): number {
  if (domainMax === domainMin) return 0
  return ((value - domainMin) / (domainMax - domainMin)) * 100
}

function fmt(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toFixed(1).replace(/\.0$/, '')
}

export const RangeBar = React.forwardRef<HTMLDivElement, RangeBarProps>(
  function RangeBar(
    { low, high, min, max, value, unit, label, valueLabel = 'You', className, ...props },
    ref,
  ) {
    if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
      return null
    }

    const span = high - low
    let domainMin = min ?? low - span
    let domainMax = max ?? high + span
    if (domainMin < 0 && low >= 0) {
      const shift = -domainMin
      domainMin = 0
      domainMax += shift
    }
    if (domainMax <= domainMin) domainMax = domainMin + span

    const left = Math.max(0, Math.min(100, pct(low, domainMin, domainMax)))
    const right = Math.max(0, Math.min(100, pct(high, domainMin, domainMax)))
    const valuePct =
      value !== null && value !== undefined && Number.isFinite(value)
        ? Math.max(0, Math.min(100, pct(value, domainMin, domainMax)))
        : null

    return (
      <div
        ref={ref}
        data-as="range-bar"
        className={cn('w-full', className)}
        {...props}
      >
        {label ? (
          <p className="mb-1 text-xs text-[var(--as-muted-fg)]">{label}</p>
        ) : null}
        <div className="relative h-3.5 w-full rounded-full bg-[var(--as-muted)]">
          <div
            className="absolute h-full rounded-full bg-[color-mix(in_srgb,var(--as-primary)_30%,transparent)]"
            style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
            title={`${label ? `${label}: ` : ''}${fmt(low)} – ${fmt(high)}${unit ? ` ${unit}` : ''}`}
          />
          {valuePct !== null ? (
            <div
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--as-surface-raised)] bg-[var(--as-primary)] shadow-[var(--as-shadow-1)]"
              style={{ left: `${valuePct}%` }}
              title={`${valueLabel}: ${fmt(value as number)}${unit ? ` ${unit}` : ''}`}
            />
          ) : null}
        </div>
        <div className="mt-0.5 flex justify-between text-[10px] text-[var(--as-muted-fg)]">
          <span>{fmt(domainMin)}</span>
          <span className="font-medium">
            {fmt(low)} – {fmt(high)}
            {unit ? ` ${unit}` : ''}
          </span>
          <span>{fmt(domainMax)}</span>
        </div>
      </div>
    )
  },
)
