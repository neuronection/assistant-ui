import * as React from 'react'
import { Check, Clock as ClockIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

type ViewMode = 'hours' | 'minutes'

export interface TimePickerProps {
  /** 24-hour `HH:MM` string, or null/undefined when empty. */
  value: string | null | undefined
  /** Fired with a 24-hour `HH:MM` string. */
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  /** Diameter of the clock face in px (default 240). */
  size?: number
  /** Accessible name for the trigger (also an optional visible label). */
  label?: string
  hourLabel?: string
  minuteLabel?: string
  doneLabel?: string
  variant?: 'default' | 'unstyled'
}

interface Hms {
  hour24: number
  minute: number
}

function parse24(value: string | null | undefined): Hms | null {
  if (!value) return null
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(value.trim())
  if (!m) return null
  const h = parseInt(m[1]!, 10)
  const min = parseInt(m[2]!, 10)
  if (Number.isNaN(h) || Number.isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return null
  return { hour24: h, minute: min }
}

function to24(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12
  return hour12 === 12 ? 12 : hour12 + 12
}

function from24(hour24: number): { hour12: number; period: 'AM' | 'PM' } {
  if (hour24 === 0) return { hour12: 12, period: 'AM' }
  if (hour24 === 12) return { hour12: 12, period: 'PM' }
  if (hour24 < 12) return { hour12: hour24, period: 'AM' }
  return { hour12: hour24 - 12, period: 'PM' }
}

function format12(hour24: number, minute: number): string {
  const { hour12, period } = from24(hour24)
  const mm = minute.toString().padStart(2, '0')
  return `${hour12}:${mm} ${period}`
}

function format24(hour24: number, minute: number): string {
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

interface ClockProps {
  mode: ViewMode
  hour12: number
  minute: number
  size: number
  onPickHour: (h: number) => void
  onPickMinute: (m: number) => void
}

/**
 * SVG clock face. Hours (1–12) and minutes (0,5,…,55) sit on a ring; the
 * selected tick is highlighted and a hand points to it. Click anywhere on the
 * face to snap to the nearest tick of the active mode.
 */
const ClockFace: React.FC<ClockProps> = ({
  mode,
  hour12,
  minute,
  size,
  onPickHour,
  onPickMinute,
}) => {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 22

  const ticks =
    mode === 'hours'
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 12 }, (_, i) => i * 5)

  const selectedValue = mode === 'hours' ? hour12 : minute

  const angleFor = React.useCallback(
    (val: number) => {
      if (mode === 'hours') {
        return (val / 12) * 360 - 90
      }
      return (val / 60) * 360 - 90
    },
    [mode],
  )

  const pointFor = React.useCallback(
    (val: number, r: number) => {
      const rad = (angleFor(val) * Math.PI) / 180
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
    },
    [angleFor, cx, cy],
  )

  const handTarget = pointFor(selectedValue, radius - 22)
  const labelPoint = (val: number) => pointFor(val, radius)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left - cx
    const y = e.clientY - rect.top - cy
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90
    if (deg < 0) deg += 360
    if (mode === 'hours') {
      const h = Math.round(deg / 30) || 12
      onPickHour(h)
    } else {
      const m = (Math.round(deg / 30) || 12) * 5
      onPickMinute(m === 60 ? 0 : m)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (mode === 'hours') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        onPickHour(hour12 >= 12 ? 1 : hour12 + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        onPickHour(hour12 <= 1 ? 12 : hour12 - 1)
      }
    } else {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        onPickMinute(minute >= 55 ? 0 : minute + 5)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        onPickMinute(minute <= 0 ? 55 : minute - 5)
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label={mode === 'hours' ? 'Hour' : 'Minute'}
      aria-valuemin={mode === 'hours' ? 1 : 0}
      aria-valuemax={mode === 'hours' ? 12 : 59}
      aria-valuenow={selectedValue}
      className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-focus-ring)]"
    >
      <circle cx={cx} cy={cy} r={radius + 4} className="fill-[var(--as-muted)] stroke-[var(--as-border)]" strokeWidth={1} />

      {ticks.map((val) => {
        const p = labelPoint(val)
        const isSelected = val === selectedValue
        return (
          <g key={val}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isSelected ? 17 : 15}
              className={cn(
                'transition-all',
                isSelected
                  ? 'fill-[var(--as-primary)]'
                  : 'fill-[var(--as-surface-raised)] stroke-[var(--as-border)]',
              )}
              strokeWidth={1}
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                'font-medium',
                isSelected ? 'fill-[var(--as-primary-fg)] font-bold' : 'fill-[var(--as-fg)]',
              )}
              style={{ fontSize: 13, userSelect: 'none' }}
            >
              {val.toString().padStart(2, '0')}
            </text>
          </g>
        )
      })}

      <line
        x1={cx}
        y1={cy}
        x2={handTarget.x}
        y2={handTarget.y}
        className="stroke-[var(--as-primary)]"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} className="fill-[var(--as-primary)]" />
    </svg>
  )
}

interface TimeInputProps {
  value: number
  min: number
  max: number
  active?: boolean
  onChange: (n: number) => void
  onFocus: () => void
  onConvertFrom24?: (n24: number) => void
  ariaLabel?: string
}

/**
 * A 2-digit, keyboard-editable numeric field. Accepts only digits, clamps on
 * blur/Enter, and supports Arrow Up/Down to step. While focused it holds the
 * raw text; it re-syncs from `value` when not focused.
 */
const TimeInput: React.FC<TimeInputProps> = ({
  value,
  min,
  max,
  active,
  onChange,
  onFocus,
  onConvertFrom24,
  ariaLabel,
}) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const [text, setText] = React.useState<string>(pad(value))
  const [focused, setFocused] = React.useState(false)

  React.useEffect(() => {
    if (!focused) setText(pad(value))
  }, [value, focused])

  const commit = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits === '') {
      setText(pad(value))
      return
    }
    const n = parseInt(digits, 10)
    if (Number.isNaN(n)) {
      setText(pad(value))
      return
    }
    if (onConvertFrom24 && (n > max || n === 0)) {
      onConvertFrom24(n)
      return
    }
    const clamped = Math.max(min, Math.min(max, n))
    onChange(clamped)
    setText(pad(clamped))
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={text}
      aria-label={ariaLabel}
      onFocus={() => {
        setFocused(true)
        onFocus()
        requestAnimationFrame(() => {
          const el = document.activeElement as HTMLInputElement | null
          if (el) el.select()
        })
      }}
      onBlur={() => {
        setFocused(false)
        commit(text)
      }}
      onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, 2))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          ;(e.target as HTMLInputElement).blur()
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          const next = value >= max ? min : value + 1
          onChange(next)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          const next = value <= min ? max : value - 1
          onChange(next)
        }
      }}
      className={cn(
        'h-10 w-12 rounded-[var(--as-radius-sm)] bg-transparent text-center text-2xl font-bold tabular-nums outline-none transition-colors',
        active
          ? 'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] text-[var(--as-primary)]'
          : 'text-[var(--as-fg)] hover:bg-[var(--as-muted)]',
      )}
    />
  )
}

export interface TimePickerContentProps {
  value: string | null | undefined
  onChange: (value: string) => void
  onDone?: () => void
  size?: number
  hourLabel?: string
  minuteLabel?: string
  doneLabel?: string
  className?: string
}

/**
 * The popover body: editable HH:MM inputs + AM/PM segmented control + clock
 * face + Done button. Owns a working copy of the time, seeded from `value`
 * once on mount (the parent unmounts it when the popover closes).
 */
export const TimePickerContent: React.FC<TimePickerContentProps> = ({
  value,
  onChange,
  onDone,
  size = 240,
  hourLabel = 'Hour',
  minuteLabel = 'Minute',
  doneLabel = 'Done',
  className,
}) => {
  const seedRef = React.useRef<{ h24: number; min: number } | null>(null)
  if (seedRef.current === null) {
    const p = parse24(value)
    if (p) {
      seedRef.current = { h24: p.hour24, min: p.minute }
    } else {
      const now = new Date()
      seedRef.current = { h24: now.getHours(), min: now.getMinutes() }
    }
  }
  const seed = seedRef.current

  const [hour12, setHour12] = React.useState<number>(() => from24(seed.h24).hour12)
  const [minute, setMinute] = React.useState<number>(seed.min)
  const [period, setPeriod] = React.useState<'AM' | 'PM'>(() => from24(seed.h24).period)
  const [mode, setMode] = React.useState<ViewMode>('hours')

  const commit = React.useCallback(
    (h12: number, min: number, p: 'AM' | 'PM') => {
      onChange(format24(to24(h12, p), min))
    },
    [onChange],
  )

  const pickHour = (h: number) => {
    setHour12(h)
    commit(h, minute, period)
  }
  const pickMinute = (m: number) => {
    setMinute(m)
    commit(hour12, m, period)
  }
  const togglePeriod = (p: 'AM' | 'PM') => {
    if (p === period) return
    setPeriod(p)
    commit(hour12, minute, p)
  }

  return (
    <div
      data-as="time-picker-content"
      className={cn('flex flex-col gap-2 p-4', className)}
    >
      <div className="mb-1 flex select-none items-center justify-center gap-2">
        <div className="flex items-center gap-0.5 rounded-[var(--as-radius)] bg-[var(--as-muted)] px-1 py-0.5">
          <TimeInput
            value={hour12}
            min={1}
            max={12}
            active={mode === 'hours'}
            ariaLabel={hourLabel}
            onChange={(h) => {
              setHour12(h)
              commit(h, minute, period)
            }}
            onConvertFrom24={(n24) => {
              const f = from24(n24)
              setHour12(f.hour12)
              setPeriod(f.period)
              commit(f.hour12, minute, f.period)
            }}
            onFocus={() => setMode('hours')}
          />
          <span className="px-0.5 text-2xl font-bold text-[var(--as-muted-fg)]">:</span>
          <TimeInput
            value={minute}
            min={0}
            max={59}
            active={mode === 'minutes'}
            ariaLabel={minuteLabel}
            onChange={(m) => {
              setMinute(m)
              commit(hour12, m, period)
            }}
            onFocus={() => setMode('minutes')}
          />
        </div>

        <div className="flex overflow-hidden rounded-[var(--as-radius)] border border-[var(--as-border)]">
          {(['AM', 'PM'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePeriod(p)}
              aria-pressed={period === p}
              className={cn(
                'cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors',
                period === p
                  ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
                  : 'bg-[var(--as-surface)] text-[var(--as-muted-fg)] hover:bg-[var(--as-muted)]',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--as-muted-fg)]">
        {mode === 'hours' ? hourLabel : minuteLabel}
      </p>

      <div className="mb-2 flex justify-center">
        <ClockFace
          mode={mode}
          hour12={hour12}
          minute={minute}
          size={size}
          onPickHour={pickHour}
          onPickMinute={pickMinute}
        />
      </div>

      <div className="flex justify-end border-t border-[var(--as-border)] pt-2">
        <button
          type="button"
          onClick={onDone}
          className="flex cursor-pointer items-center gap-1.5 rounded-[var(--as-radius)] bg-[var(--as-primary)] px-4 py-2 text-xs font-bold text-[var(--as-primary-fg)] transition-[filter] hover:brightness-110"
        >
          <Check className="size-3.5" aria-hidden />
          {doneLabel}
        </button>
      </div>
    </div>
  )
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(
    {
      value,
      onChange,
      className,
      placeholder = 'Select time',
      disabled = false,
      id,
      size = 240,
      label,
      hourLabel,
      minuteLabel,
      doneLabel,
      variant = 'default',
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)

    const parsed = parse24(value)
    const display = parsed ? format12(parsed.hour24, parsed.minute) : null

    return (
      <div
        ref={ref}
        data-as="time-picker"
        className={cn(!className?.includes('w-') && 'w-full', 'flex flex-col', className)}
      >
        {label ? (
          <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--as-muted-fg)]">
            {label}
          </label>
        ) : null}
        <Popover open={open && !disabled} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              aria-label={label ?? 'Choose time'}
              className={cn(
                'flex items-center gap-2 text-left text-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
                !className?.includes('w-') && 'w-full',
                variant === 'default' &&
                  'rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2.5 hover:border-[var(--as-primary)]',
              )}
            >
              {variant === 'default' ? (
                <ClockIcon className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
              ) : null}
              <span
                className={cn(
                  'flex-1 truncate',
                  !parsed && (variant === 'default' ? 'text-[var(--as-muted-fg)]' : 'opacity-70'),
                  parsed && variant === 'default' && 'font-medium text-[var(--as-fg)]',
                )}
              >
                {display ?? placeholder}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={4}
            collisionPadding={8}
            aria-label={label ?? 'Choose time'}
            className="w-[300px] p-0"
          >
            <TimePickerContent
              value={value}
              onChange={onChange}
              onDone={() => setOpen(false)}
              size={size}
              hourLabel={hourLabel}
              minuteLabel={minuteLabel}
              doneLabel={doneLabel}
            />
          </PopoverContent>
        </Popover>

        <input type="hidden" value={value ?? ''} id={id} name={id} />
      </div>
    )
  },
)
