import * as React from 'react'
import { Check, ChevronDown, Grid2x2, Minus, MoreHorizontal, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../menu'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { SearchInput } from '../search-input'
import type { FilterFacet, FilterOption, FilterOptionAction, FilterValue } from './types'

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
  remove?: (optionLabel: string) => string
  /** Accessible name of an option row that carries an exact count. */
  optionWithCount?: (optionLabel: string, count: number) => string
  /** Word appended to an excluded option's accessible name. */
  excluded?: string
  /** Phrase appended to a zero-count option's accessible name. */
  noneMatch?: string
  /** Label of the `value:null` bucket. */
  notRecorded?: string
  /** Per-row menu actions. */
  include?: string
  exclude?: string
  clear?: string
  /** Accessible name of a per-row menu trigger. */
  optionMenu?: (optionLabel: string) => string
}

interface FacetChipBaseProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  facet: FilterFacet
  value: FilterValue
  /** Resolved options; defaults to `facet.options`. */
  options?: FilterOption[]
  /** Render the removable row of the current selection. Default `true`. */
  showActivePills?: boolean
  /** Options count above which the popover gains a search box. Default `8`. */
  searchThreshold?: number
  /** Format a count badge; defaults to the runtime locale. */
  formatCount?: (count: number) => React.ReactNode
  /**
   * `popover` (default) opens options in a popover; `inline` renders the
   * options as an always-visible pill row — for compact filter strips.
   */
  variant?: 'popover' | 'inline'
  /** `data-testid` of the root element. */
  testId?: string
  /** `data-testid` of one option (inline pills and popover rows alike). */
  optionTestId?: (optionValue: string | null) => string
  labels?: FacetChipLabels
}

/**
 * Exactly one event seam: the intent form (`onToggleOption`) is burst-safe and
 * preferred for store/reducer hosts; the replacement form (`onValueChange`)
 * is the simple default.
 */
export type FacetChipEventProps =
  | {
      /** Emits the whole next value, computed from the current `value` prop. */
      onValueChange: (value: FilterValue) => void
      onToggleOption?: never
    }
  | {
      /**
       * Emits an intent instead of a replacement value — burst-safe.
       * `optionValue` is the option's value, or the facet id for a `toggle`
       * facet; `action` is the tri-state include/exclude/clear intent.
       */
      onToggleOption: (optionValue: string | null, action: FilterOptionAction) => void
      onValueChange?: never
    }

export type FacetChipProps = FacetChipBaseProps & FacetChipEventProps

type OptionState = 'include' | 'exclude' | 'none'

const TRIGGER_BASE =
  'flex items-center justify-between gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50'

const TRIGGER_IDLE =
  'border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] hover:border-[color-mix(in_srgb,var(--as-primary)_40%,var(--as-border))]'

const TRIGGER_ACTIVE =
  'border-[var(--as-primary)] bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] text-[var(--as-primary)]'

const PILL =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] py-1 pl-2.5 pr-1 text-[11px] font-medium text-[var(--as-primary)]'

const PILL_EXCLUDED =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--as-danger)_12%,transparent)] py-1 pl-2.5 pr-1 text-[11px] font-medium text-[var(--as-danger)]'

const ROW_BASE =
  'flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--as-radius-sm)] px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--as-focus-ring)]'

const ROW_INCLUDE =
  'bg-[color-mix(in_srgb,var(--as-primary)_10%,transparent)] font-medium text-[var(--as-primary)]'

const ROW_EXCLUDE =
  'bg-[color-mix(in_srgb,var(--as-danger)_10%,transparent)] font-medium text-[var(--as-danger)]'

const ROW_IDLE = 'text-[var(--as-fg)] hover:bg-[var(--as-secondary)]'

const MENU_TRIGGER =
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

const TRIGGER_FOCUS = '@trigger'

/** Stable reference for a `string | null` option value. */
export function filterValueKey(value: string | null): string {
  return value === null ? 'null:' : `value:${value}`
}

export function isDefaultValue(value: FilterValue): boolean {
  if (value.kind === 'toggle') return !value.on
  if (value.kind === 'single') return value.value === ''
  return value.include.length === 0 && value.exclude.length === 0
}

/** The neutral value of a facet — the one a host uses when it has no entry. */
export function defaultFilterValue(facet: FilterFacet): FilterValue {
  if (facet.kind === 'toggle') return { kind: 'toggle', on: false }
  if (facet.kind === 'single') return { kind: 'single', value: '' }
  return { kind: 'multi', include: [], exclude: [] }
}

function multiOf(value: FilterValue): { include: (string | null)[]; exclude: (string | null)[] } {
  if (value.kind === 'multi') return { include: value.include, exclude: value.exclude }
  return { include: [], exclude: [] }
}

function applyAction(
  value: FilterValue,
  optionValue: string | null,
  action: FilterOptionAction,
): FilterValue {
  const current = multiOf(value)
  const include = current.include.filter((entry) => entry !== optionValue)
  const exclude = current.exclude.filter((entry) => entry !== optionValue)
  if (action === 'include') include.push(optionValue)
  if (action === 'exclude') exclude.push(optionValue)
  return { kind: 'multi', include, exclude }
}

function cycleAction(value: FilterValue, optionValue: string | null): FilterOptionAction {
  const current = multiOf(value)
  if (current.include.includes(optionValue)) return 'exclude'
  if (current.exclude.includes(optionValue)) return 'clear'
  return 'include'
}

export const FacetChip = React.forwardRef<HTMLDivElement, FacetChipProps>(function FacetChip(
  {
    facet,
    value,
    onValueChange,
    onToggleOption,
    options,
    showActivePills = true,
    searchThreshold = 8,
    formatCount,
    variant = 'popover',
    testId,
    optionTestId,
    labels,
    className,
    ...props
  },
  ref,
) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [openMenuKey, setOpenMenuKey] = React.useState<string | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const pillRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const pendingFocusRef = React.useRef<string | null>(null)

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  const resolvedOptions = React.useMemo(
    () => options ?? facet.options ?? [],
    [options, facet.options],
  )
  const includeValues = value.kind === 'multi' ? value.include : []
  const excludeValues = value.kind === 'multi' ? value.exclude : []
  const active = !isDefaultValue(value)
  const excludeEnabled = facet.kind === 'multi' && (facet.allowExclude ?? true)

  const excludedWord = labels?.excluded ?? 'excluded'
  const noneMatchWord = labels?.noneMatch ?? 'none match now'
  const notRecordedLabel = labels?.notRecorded ?? 'Not recorded'
  const removeNamed = labels?.remove ?? ((optionLabel: string) => `Remove ${optionLabel}`)
  const includeWord = labels?.include ?? 'Include'
  const excludeWord = labels?.exclude ?? 'Exclude'
  const clearWord = labels?.clear ?? 'Clear'
  const optionMenuNamed =
    labels?.optionMenu ?? ((optionLabel: string) => `More actions for ${optionLabel}`)

  const displayLabel = (option: FilterOption) =>
    option.value === null ? notRecordedLabel : option.label

  const labelFor = (entry: string | null) => {
    const option = resolvedOptions.find((candidate) => candidate.value === entry)
    if (option) return displayLabel(option)
    return entry === null ? notRecordedLabel : String(entry)
  }

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return resolvedOptions
    return resolvedOptions.filter((option) =>
      (option.value === null ? notRecordedLabel : option.label).toLowerCase().includes(needle),
    )
  }, [resolvedOptions, query, notRecordedLabel])

  const stateFor = (optionValue: string | null): OptionState => {
    if (facet.kind === 'single') {
      return value.kind === 'single' && value.value !== '' && value.value === optionValue
        ? 'include'
        : 'none'
    }
    if (includeValues.includes(optionValue)) return 'include'
    if (excludeValues.includes(optionValue)) return 'exclude'
    return 'none'
  }

  const countToString = (count: number) => {
    const formatted = formatCount?.(count)
    return typeof formatted === 'string' || typeof formatted === 'number'
      ? String(formatted)
      : count.toLocaleString()
  }

  const countText = (count: number) => formatCount?.(count) ?? count.toLocaleString()

  const optionName = (option: FilterOption, state: OptionState) => {
    let name = displayLabel(option)
    if (option.count !== undefined) {
      name = option.countAtLeast
        ? `${name}, \u2265${countToString(option.count)}`
        : (labels?.optionWithCount?.(displayLabel(option), option.count) ??
          `${name}, ${countToString(option.count)}`)
      if (option.count === 0) name = `${name}, ${noneMatchWord}`
    }
    if (option.hint) name = `${name}, ${option.hint}`
    if (state === 'exclude') name = `${name} (${excludedWord})`
    return name
  }

  const selectedLabel = (() => {
    const entries = [...includeValues, ...excludeValues]
    if (entries.length === 0) return null
    if (entries.length === 1) {
      const entry = entries[0]
      const label = labelFor(entry!)
      return includeValues.length === 0 ? `${label} (${excludedWord})` : label
    }
    return labels?.selectedCount?.(entries.length) ?? `${entries.length} selected`
  })()

  const choose = (optionValue: string | null, action: FilterOptionAction) => {
    if (onToggleOption) {
      onToggleOption(optionValue, action)
      return
    }
    onValueChange!(applyAction(value, optionValue, action))
  }

  const activate = (optionValue: string | null) => {
    if (facet.kind === 'single') {
      const current = value.kind === 'single' ? value.value : ''
      const clearing = current !== '' && current === optionValue
      const next = clearing ? '' : optionValue
      if (onToggleOption) {
        onToggleOption(optionValue, clearing ? 'clear' : 'include')
        return
      }
      onValueChange!({ kind: 'single', value: next })
      return
    }
    choose(optionValue, cycleAction(value, optionValue))
  }

  const onOptionKeyDown = (event: React.KeyboardEvent<HTMLElement>, optionValue: string | null) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (facet.kind === 'single') {
        activate(optionValue)
        return
      }
      choose(optionValue, stateFor(optionValue) === 'include' ? 'clear' : 'include')
      return
    }
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      if (!excludeEnabled) return
      choose(optionValue, stateFor(optionValue) === 'exclude' ? 'clear' : 'exclude')
      return
    }
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      activate(optionValue)
      return
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      if (facet.kind === 'single') {
        if (onToggleOption) onToggleOption(optionValue, 'clear')
        else onValueChange!({ kind: 'single', value: '' })
        return
      }
      choose(optionValue, 'clear')
      return
    }
    if (event.key === 'F10' && event.shiftKey && excludeEnabled) {
      event.preventDefault()
      setOpenMenuKey(filterValueKey(optionValue))
    }
  }

  const pillKey = (entry: string | null, state: OptionState) =>
    `${state}:${filterValueKey(entry)}`

  const pills = [
    ...includeValues.map((entry) => ({ entry, state: 'include' as const })),
    ...excludeValues.map((entry) => ({ entry, state: 'exclude' as const })),
  ]

  const removePill = (entry: string | null, state: OptionState) => {
    const orderedKeys = pills.map((pill) => pillKey(pill.entry, pill.state))
    const index = orderedKeys.indexOf(pillKey(entry, state))
    const nextKey = index >= 0 ? (orderedKeys[index + 1] ?? null) : null
    pendingFocusRef.current = nextKey ?? TRIGGER_FOCUS
    const nextNode = nextKey ? pillRefs.current.get(nextKey) : null
    if (nextNode) nextNode.focus()
    else triggerRef.current?.focus()
    choose(entry, 'clear')
  }

  const activePills =
    showActivePills && facet.kind === 'multi' && pills.length > 0 ? (
      <div className="flex max-w-[400px] flex-wrap items-center gap-1.5">
        {pills.map(({ entry, state }) => {
          const option = resolvedOptions.find((candidate) => candidate.value === entry)
          const optionLabel = labelFor(entry)
          const key = pillKey(entry, state)
          return (
            <span key={key} className={state === 'exclude' ? PILL_EXCLUDED : PILL}>
              {option?.icon}
              <span>{optionLabel}</span>
              {state === 'exclude' ? <span>({excludedWord})</span> : null}
              <button
                type="button"
                ref={(node) => {
                  if (node) pillRefs.current.set(key, node)
                  else pillRefs.current.delete(key)
                }}
                onClick={() => removePill(entry, state)}
                aria-label={
                  state === 'exclude'
                    ? `${removeNamed(optionLabel)} (${excludedWord})`
                    : removeNamed(optionLabel)
                }
                className="rounded-full p-1 transition-colors hover:bg-[color-mix(in_srgb,var(--as-primary)_18%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          )
        })}
      </div>
    ) : null

  React.useLayoutEffect(() => {
    const target = pendingFocusRef.current
    if (target === null) return
    pendingFocusRef.current = null
    if (target === TRIGGER_FOCUS) {
      const fallback =
        triggerRef.current ??
        rootRef.current?.querySelector<HTMLElement>('[role="checkbox"], [role="radio"]') ??
        rootRef.current
      fallback?.focus()
      return
    }
    const node = pillRefs.current.get(target)
    if (node) node.focus()
    else triggerRef.current?.focus()
  }, [value, pills.length])

  if (facet.kind === 'toggle') {
    const on = value.kind === 'toggle' ? value.on : false
    return (
      <div ref={ref} data-as="facet-chip" data-testid={testId} className={cn('inline-flex', className)} {...props}>
        <button
          type="button"
          aria-pressed={on}
          onClick={() =>
            onToggleOption
              ? onToggleOption(facet.id, on ? 'clear' : 'include')
              : onValueChange!({ kind: 'toggle', on: !on })
          }
          className={cn(TRIGGER_BASE, on ? TRIGGER_ACTIVE : TRIGGER_IDLE)}
        >
          {facet.icon ?? <SlidersHorizontal className="size-4 opacity-70" aria-hidden />}
          <span>{facet.label}</span>
        </button>
      </div>
    )
  }

  const countBadge = (option: FilterOption) =>
    option.count !== undefined ? (
      <span
        aria-hidden
        className="rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--as-muted-fg)]"
      >
        <bdi dir="ltr">
          {option.countAtLeast ? '\u2265' : null}
          {countText(option.count)}
        </bdi>
      </span>
    ) : null

  const stateIcon = (state: OptionState) => {
    if (state === 'include') return <Check className="size-4 text-[var(--as-primary)]" aria-hidden />
    if (state === 'exclude') return <Minus className="size-4 text-[var(--as-danger)]" aria-hidden />
    return null
  }

  const optionMenu = (option: FilterOption, state: OptionState, compact: boolean) => {
    if (!excludeEnabled) return null
    const key = filterValueKey(option.value)
    const optionTestIdValue = optionTestId?.(option.value)
    return (
      <Menu
        open={openMenuKey === key}
        onOpenChange={(next) => setOpenMenuKey(next ? key : null)}
      >
        <MenuTrigger asChild>
          <button
            type="button"
            aria-label={optionMenuNamed(displayLabel(option))}
            data-testid={optionTestIdValue ? `${optionTestIdValue}-menu` : undefined}
            className={cn(MENU_TRIGGER, compact ? 'size-5 max-sm:min-h-11 max-sm:w-11' : 'size-7')}
          >
            <MoreHorizontal className={compact ? 'size-3' : 'size-4'} aria-hidden />
          </button>
        </MenuTrigger>
        <MenuContent align="end" side="bottom" className="min-w-40">
          <MenuItem icon={Check} onSelect={() => choose(option.value, 'include')}>
            {includeWord}
          </MenuItem>
          <MenuItem icon={Minus} onSelect={() => choose(option.value, 'exclude')}>
            {excludeWord}
          </MenuItem>
          <MenuItem icon={X} disabled={state === 'none'} onSelect={() => choose(option.value, 'clear')}>
            {clearWord}
          </MenuItem>
        </MenuContent>
      </Menu>
    )
  }

  if (variant === 'inline') {
    return (
      <div
        ref={setRootRef}
        tabIndex={-1}
        data-as="facet-chip"
        data-testid={testId}
        className={cn('flex flex-wrap items-center gap-1.5', className)}
        {...props}
      >
        <div
          role={facet.kind === 'single' ? 'radiogroup' : 'group'}
          aria-label={facet.label}
          className="flex flex-wrap items-center gap-1.5"
        >
          {resolvedOptions.map((option) => {
            const state = stateFor(option.value)
            return (
              <span key={filterValueKey(option.value)} className="inline-flex items-center">
                <div
                  role={facet.kind === 'single' ? 'radio' : 'checkbox'}
                  tabIndex={0}
                  aria-checked={state !== 'none'}
                  aria-label={optionName(option, state)}
                  data-testid={optionTestId?.(option.value)}
                  onClick={() => activate(option.value)}
                  onKeyDown={(event) => onOptionKeyDown(event, option.value)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors max-sm:min-h-11 max-sm:px-3 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                    state === 'include'
                      ? 'border-[var(--as-primary)] bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
                      : state === 'exclude'
                        ? 'border-[var(--as-danger)] bg-[color-mix(in_srgb,var(--as-danger)_12%,transparent)] text-[var(--as-danger)]'
                        : 'border-[var(--as-border)] text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]',
                  )}
                >
                  {option.icon}
                  {displayLabel(option)}
                  {countBadge(option)}
                  {state === 'exclude' ? <Minus className="size-3" aria-hidden /> : null}
                </div>
                {optionMenu(option, state, true)}
              </span>
            )
          })}
        </div>
        {activePills}
      </div>
    )
  }

  return (
    <div
      ref={setRootRef}
      data-as="facet-chip"
      data-testid={testId}
      className={cn('flex min-w-0 items-center gap-2', className)}
      {...props}
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery('')
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-label={selectedLabel ? `${facet.label}: ${selectedLabel}` : undefined}
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
          aria-label={facet.label}
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

          <div
            role={facet.kind === 'single' ? 'radiogroup' : 'group'}
            aria-label={facet.label}
            className="max-h-[280px] overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-[var(--as-muted-fg)]">
                {resolvedOptions.length === 0
                  ? (labels?.noOptions ?? 'No options')
                  : (labels?.noMatches ?? 'No matches')}
              </div>
            ) : (
              filtered.map((option) => {
                const state = stateFor(option.value)
                return (
                  <div key={filterValueKey(option.value)} className="flex items-center gap-1">
                    <div
                      role={facet.kind === 'single' ? 'radio' : 'checkbox'}
                      tabIndex={0}
                      aria-checked={state !== 'none'}
                      aria-label={optionName(option, state)}
                      data-testid={optionTestId?.(option.value)}
                      onClick={() => activate(option.value)}
                      onKeyDown={(event) => onOptionKeyDown(event, option.value)}
                      className={cn(
                        ROW_BASE,
                        state === 'include'
                          ? ROW_INCLUDE
                          : state === 'exclude'
                            ? ROW_EXCLUDE
                            : ROW_IDLE,
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {option.icon}
                        <span className="truncate">{displayLabel(option)}</span>
                        {option.hint ? (
                          <span className="truncate text-xs font-normal text-[var(--as-muted-fg)]">
                            {option.hint}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {countBadge(option)}
                        {stateIcon(state)}
                      </span>
                    </div>
                    {optionMenu(option, state, false)}
                  </div>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {activePills}
    </div>
  )
})
