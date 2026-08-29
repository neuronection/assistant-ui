import * as React from 'react'
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  setMonth,
  setYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from 'date-fns'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../popover'

type ViewMode = 'days' | 'months' | 'years'

export interface DatePickerProps {
  value: string | null | undefined
  onChange: (value: string) => void
  onClear?: () => void
  allowClear?: boolean
  clearLabel?: string
  placeholder?: string
  displayFormat?: string
  minDate?: Date
  maxDate?: Date
  weekStartsOn?: 0 | 1
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
  label?: string
  prevLabel?: string
  nextLabel?: string
  className?: string
  panelClassName?: string
}

function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      onClear,
      allowClear = false,
      clearLabel = 'Clear',
      placeholder = 'Select date',
      displayFormat = 'dd/MM/yyyy',
      minDate,
      maxDate,
      weekStartsOn = 1,
      disabled = false,
      required,
      id,
      name,
      label = 'Choose date',
      prevLabel = 'Previous',
      nextLabel = 'Next',
      className,
      panelClassName,
    },
    ref,
  ) {
    const autoId = React.useId()
    const hiddenId = id ?? `date-picker-${autoId}`
    const [open, setOpen] = React.useState(false)
    const [viewMode, setViewMode] = React.useState<ViewMode>('days')
    const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date())
    const [focusedDay, setFocusedDay] = React.useState<Date>(() => new Date())
    const [yearPage, setYearPage] = React.useState(() => new Date().getFullYear())
    const gridRef = React.useRef<HTMLDivElement>(null)

    const selectedDate = React.useMemo(() => {
      if (!value) return null
      const parsed = parseISO(value)
      return isValid(parsed) ? parsed : null
    }, [value])

    const isDisabled = React.useCallback(
      (date: Date) =>
        Boolean(minDate && date < startOfDay(minDate)) ||
        Boolean(maxDate && date > startOfDay(maxDate)),
      [minDate, maxDate],
    )

    const handleOpenChange = (next: boolean) => {
      setOpen(next)
      if (next) {
        const base = selectedDate ?? new Date()
        setCurrentDate(base)
        setFocusedDay(base)
        setYearPage(base.getFullYear())
        setViewMode('days')
      }
    }

    const handleSelect = (date: Date) => {
      if (isDisabled(date)) return
      onChange(format(date, 'yyyy-MM-dd'))
      setOpen(false)
    }

    const handleClear = (event: React.MouseEvent) => {
      event.stopPropagation()
      onChange('')
      onClear?.()
      setOpen(false)
    }

    const moveFocus = (next: Date) => {
      if (isDisabled(next)) return
      setFocusedDay(next)
      setCurrentDate((current) =>
        isSameMonth(current, next) ? current : startOfMonth(next),
      )
    }

    const handleGridKeyDown = (event: React.KeyboardEvent) => {
      const step =
        event.key === 'ArrowLeft'
          ? -1
          : event.key === 'ArrowRight'
            ? 1
            : event.key === 'ArrowUp'
              ? -7
              : event.key === 'ArrowDown'
                ? 7
                : 0
      if (step !== 0) {
        event.preventDefault()
        moveFocus(addDays(focusedDay, step))
        return
      }
      if (event.key === 'PageUp' || event.key === 'PageDown') {
        event.preventDefault()
        const direction = event.key === 'PageUp' ? -1 : 1
        moveFocus(addMonths(focusedDay, direction))
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        moveFocus(startOfMonth(focusedDay))
      } else if (event.key === 'End') {
        event.preventDefault()
        moveFocus(endOfMonth(focusedDay))
      }
    }

    React.useEffect(() => {
      if (!open || viewMode !== 'days') return
      const target = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-day="${dayKey(focusedDay)}"]`,
      )
      target?.focus()
    }, [open, viewMode, focusedDay])

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const gridStart = startOfWeek(monthStart, { weekStartsOn })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn })

    const weeks: Date[][] = []
    let cursor = gridStart
    while (cursor <= gridEnd) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        week.push(cursor)
        cursor = addDays(cursor, 1)
      }
      weeks.push(week)
    }

    const today = new Date()
    const weekdayStart = startOfWeek(new Date(), { weekStartsOn })

    const headerTitle =
      viewMode === 'days'
        ? format(currentDate, 'MMMM yyyy')
        : viewMode === 'months'
          ? format(currentDate, 'yyyy')
          : `${Math.floor(yearPage / 12) * 12} – ${Math.floor(yearPage / 12) * 12 + 11}`

    const handlePrev = () => {
      if (viewMode === 'days') setCurrentDate(subMonths(currentDate, 1))
      else if (viewMode === 'months') setCurrentDate(subYears(currentDate, 1))
      else setYearPage(yearPage - 12)
    }

    const handleNext = () => {
      if (viewMode === 'days') setCurrentDate(addMonths(currentDate, 1))
      else if (viewMode === 'months') setCurrentDate(addYears(currentDate, 1))
      else setYearPage(yearPage + 12)
    }

    const toggleViewMode = () => {
      if (viewMode !== 'years') setViewMode('years')
    }

    const navButtonClass =
      'cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

    return (
      <div
        ref={ref}
        data-as="date-picker"
        className={cn('relative w-full', className)}
      >
        <Popover open={open} onOpenChange={handleOpenChange}>
          <span className="relative inline-flex w-full">
            <PopoverTrigger asChild disabled={disabled}>
              <button
                type="button"
                aria-label={label}
                className={cn(
                  'flex h-9 w-full items-center gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-left text-sm text-[var(--as-fg)] transition-colors hover:border-[var(--as-fg)]/30 focus-visible:border-[var(--as-focus-ring)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
                  allowClear && selectedDate && !disabled && 'pr-8',
                )}
              >
                <CalendarIcon
                  className="size-4 shrink-0 text-[var(--as-muted-fg)]"
                  aria-hidden
                />
                <span
                  className={cn(
                    'flex-1 truncate text-left',
                    !selectedDate && 'text-[var(--as-muted-fg)]',
                  )}
                >
                  {selectedDate
                    ? format(selectedDate, displayFormat)
                    : placeholder}
                </span>
              </button>
            </PopoverTrigger>
            {allowClear && selectedDate && !disabled ? (
              <button
                type="button"
                aria-label={clearLabel}
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </span>

          <input
            type="hidden"
            id={hiddenId}
            name={name ?? hiddenId}
            value={value ?? ''}
            required={required}
          />

          <PopoverContent
            align="start"
            sideOffset={4}
            collisionPadding={8}
            aria-label={label}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              const panel = event.currentTarget as HTMLElement | null
              const target = panel?.querySelector<HTMLButtonElement>(
                '[data-day][tabindex="0"]',
              )
              target?.focus()
            }}
            className={cn(
              'as-anim-pop z-50 w-[280px] rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-2 text-[var(--as-fg)] shadow-[var(--as-shadow-3)] outline-none',
              panelClassName,
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1 pt-1">
              <button
                type="button"
                aria-label={prevLabel}
                onClick={handlePrev}
                className={navButtonClass}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={toggleViewMode}
                className="flex cursor-pointer items-center rounded-[var(--as-radius-sm)] px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--as-muted)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
              >
                <span>{headerTitle}</span>
                {viewMode !== 'years' ? (
                  <ChevronDown className="ml-1 size-4" aria-hidden />
                ) : null}
              </button>
              <button
                type="button"
                aria-label={nextLabel}
                onClick={handleNext}
                className={navButtonClass}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>

            {viewMode === 'days' ? (
              <div className="px-2 pb-2">
                <div
                  ref={gridRef}
                  role="grid"
                  aria-label={label}
                  onKeyDown={handleGridKeyDown}
                >
                  <div role="row" className="mb-2 grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        role="columnheader"
                        className="py-1 text-center text-xs font-medium text-[var(--as-muted-fg)]"
                      >
                        {format(addDays(weekdayStart, i), 'EEEEE')}
                      </div>
                    ))}
                  </div>
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} role="row" className="grid grid-cols-7 gap-1">
                      {week.map((day) => {
                        const isSelected = selectedDate
                          ? isSameDay(day, selectedDate)
                          : false
                        const isFocused = isSameDay(day, focusedDay)
                        const outside = !isSameMonth(day, monthStart)
                        const isToday = isSameDay(day, today)
                        const dayDisabled = isDisabled(day)
                        return (
                          <div
                            key={dayKey(day)}
                            role="gridcell"
                            aria-selected={isSelected}
                            className="p-0"
                          >
                            <button
                              type="button"
                              data-day={dayKey(day)}
                              tabIndex={isFocused ? 0 : -1}
                              disabled={dayDisabled}
                              aria-current={isToday ? 'date' : undefined}
                              onClick={() => handleSelect(day)}
                              className={cn(
                                'flex size-8 cursor-pointer items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                                outside
                                  ? 'text-[var(--as-muted-fg)] opacity-50'
                                  : 'text-[var(--as-fg)]',
                                isSelected &&
                                  'bg-[var(--as-primary)] font-medium text-[var(--as-primary-fg)] hover:brightness-110',
                                !isSelected &&
                                  isToday &&
                                  'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] font-medium text-[var(--as-primary)]',
                                !isSelected && !dayDisabled && 'hover:bg-[var(--as-muted)]',
                                dayDisabled &&
                                  'cursor-not-allowed opacity-30 hover:bg-transparent',
                              )}
                            >
                              {format(day, 'd')}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {viewMode === 'months' ? (
              <div className="grid grid-cols-3 gap-2 p-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const isSelected =
                    selectedDate?.getMonth() === i &&
                    selectedDate?.getFullYear() === currentDate.getFullYear()
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCurrentDate(setMonth(currentDate, i))
                        setViewMode('days')
                      }}
                      className={cn(
                        'cursor-pointer rounded-[var(--as-radius)] py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                        isSelected
                          ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
                          : 'text-[var(--as-fg)] hover:bg-[var(--as-muted)]',
                      )}
                    >
                      {format(setMonth(new Date(), i), 'MMM')}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {viewMode === 'years' ? (
              <div className="grid grid-cols-3 gap-2 p-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const year = Math.floor(yearPage / 12) * 12 + i
                  const isSelected = selectedDate?.getFullYear() === year
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setCurrentDate(setYear(currentDate, year))
                        setFocusedDay((current) => setYear(current, year))
                        setViewMode('months')
                      }}
                      className={cn(
                        'cursor-pointer rounded-[var(--as-radius)] py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                        isSelected
                          ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
                          : 'text-[var(--as-fg)] hover:bg-[var(--as-muted)]',
                      )}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
