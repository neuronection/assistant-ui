import * as React from 'react'
import { Check, ChevronDown, Grid2x2, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { SearchInput } from '../search-input'
import type { FilterFacet, FilterOption, FilterValue } from './types'

export interface FacetChipLabels {
  /** Shown when the facet has no options at all. */
  noOptions?: string
  /** Shown when the search matches nothing. */
  noMatches?: string
  searchPlaceholder?: string
  searchAriaLabel?: string
  /** Trigger text for a multi facet with more than one selection. */
  selectedCount?: (count: number) => React.ReactNode
  /** Accessible name of an active pill's remove button. */
  removeNamed?: (optionLabel: string) => string
}

export interface FacetChipProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  facet: FilterFacet
  value: FilterValue
  /** Emits the whole next value for this facet. */
  onValueChange: (value: FilterValue) => void
  /** Resolved options; defaults to `facet.options`. */
  options?: FilterOption[]
  /** Render the removable row of the current selection. Default `true`. */
  showActivePills?: boolean
  /** Options count above which the popover gains a search box. Default `8`. */
  searchThreshold?: number
  labels?: FacetChipLabels
}

const TRIGGER_BASE =
  'flex items-center justify-between gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50'

const TRIGGER_IDLE =
  'border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] hover:border-[color-mix(in_srgb,var(--as-primary)_40%,var(--as-border))]'

const TRIGGER_ACTIVE =
  'border-[var(--as-primary)] bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] text-[var(--as-primary)]'

const PILL =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] py-1 pl-2.5 pr-1 text-[11px] font-medium text-[var(--as-primary)]'

function isDefaultValue(facet: FilterFacet, value: FilterValue): boolean {
  if (value.kind === 'toggle') return !value.on
  if (value.kind === 'single') return value.value === ''
  return value.values.length === 0
}

function selectedValues(value: FilterValue): string[] {
  if (value.kind === 'single') return value.value ? [value.value] : []
  if (value.kind === 'multi') return value.values
  return []
}

function nextValue(facet: FilterFacet, value: FilterValue, option: string): FilterValue {
  if (facet.kind === 'toggle') {
    return { kind: 'toggle', on: value.kind === 'toggle' ? !value.on : true }
  }
  if (facet.kind === 'single') {
    const current = value.kind === 'single' ? value.value : ''
    return { kind: 'single', value: current === option ? '' : option }
  }
  const current = value.kind === 'multi' ? value.values : []
  return {
    kind: 'multi',
    values: current.includes(option)
      ? current.filter((entry) => entry !== option)
      : [...current, option],
  }
}

export const FacetChip = React.forwardRef<HTMLDivElement, FacetChipProps>(function FacetChip(
  {
    facet,
    value,
    onValueChange,
    options,
    showActivePills = true,
    searchThreshold = 8,
    labels,
    className,
    ...props
  },
  ref,
) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const resolvedOptions = React.useMemo(
    () => options ?? facet.options ?? [],
    [options, facet.options],
  )
  const selected = selectedValues(value)
  const active = !isDefaultValue(facet, value)

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return resolvedOptions
    return resolvedOptions.filter((option) => option.label.toLowerCase().includes(needle))
  }, [resolvedOptions, query])

  const selectedLabel = (() => {
    if (selected.length === 0) return null
    if (selected.length === 1) {
      return resolvedOptions.find((option) => option.value === selected[0])?.label ?? selected[0]
    }
    return labels?.selectedCount?.(selected.length) ?? `${selected.length} selected`
  })()

  const removeNamed =
    labels?.removeNamed ?? ((optionLabel: string) => `Remove ${optionLabel}`)

  if (facet.kind === 'toggle') {
    const on = value.kind === 'toggle' ? value.on : false
    return (
      <div ref={ref} data-as="facet-chip" className={cn('inline-flex', className)} {...props}>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => onValueChange({ kind: 'toggle', on: !on })}
          className={cn(TRIGGER_BASE, on ? TRIGGER_ACTIVE : TRIGGER_IDLE)}
        >
          {facet.icon ?? <SlidersHorizontal className="size-4 opacity-70" aria-hidden />}
          <span>{facet.label}</span>
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} data-as="facet-chip" className={cn('flex min-w-0 items-center gap-2', className)} {...props}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery('')
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            className={cn(TRIGGER_BASE, active ? TRIGGER_ACTIVE : TRIGGER_IDLE)}
          >
            <span className="flex items-center gap-2">
              {facet.icon ?? <Grid2x2 className="size-4 opacity-70" aria-hidden />}
              <span>{selectedLabel ?? facet.label}</span>
            </span>
            <ChevronDown
              className={cn('size-4 opacity-60 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-64 overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-0 shadow-[var(--as-shadow-pop)]"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {resolvedOptions.length > searchThreshold && (
            <div className="border-b border-[var(--as-border)] p-2">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder={labels?.searchPlaceholder ?? 'Search options'}
                ariaLabel={labels?.searchAriaLabel ?? 'Search options'}
                autoFocus
              />
            </div>
          )}

          <div role="group" aria-label={facet.label} className="max-h-[280px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-[var(--as-muted-fg)]">
                {resolvedOptions.length === 0
                  ? (labels?.noOptions ?? 'No options')
                  : (labels?.noMatches ?? 'No matches')}
              </div>
            ) : (
              filtered.map((option) => {
                const checked = selected.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => onValueChange(nextValue(facet, value, option.value))}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-[var(--as-radius-sm)] px-3 py-2 text-left text-sm transition-colors',
                      checked
                        ? 'bg-[color-mix(in_srgb,var(--as-primary)_10%,transparent)] font-medium text-[var(--as-primary)]'
                        : 'text-[var(--as-fg)] hover:bg-[var(--as-secondary)]',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {option.icon}
                      <span className="truncate">{option.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {option.count !== undefined && (
                        <span className="rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--as-muted-fg)]">
                          {option.count.toLocaleString()}
                        </span>
                      )}
                      {checked && <Check className="size-4 text-[var(--as-primary)]" aria-hidden />}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {showActivePills && selected.length > 0 && (
        <div className="flex max-w-[400px] flex-wrap items-center gap-1.5 overflow-hidden">
          {selected.map((entry) => {
            const option = resolvedOptions.find((candidate) => candidate.value === entry)
            const optionLabel = option?.label ?? entry
            return (
              <span key={entry} className={PILL}>
                {option?.icon}
                <span>{optionLabel}</span>
                <button
                  type="button"
                  onClick={() => onValueChange(nextValue(facet, value, entry))}
                  aria-label={removeNamed(optionLabel)}
                  className="rounded-full p-1 transition-colors hover:bg-[color-mix(in_srgb,var(--as-primary)_18%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
})
