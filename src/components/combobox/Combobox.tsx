import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { searchScore } from '../../lib/fuzzy'
import { Spinner } from '../spinner/Spinner'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  group?: string
  badge?: string
  disabled?: boolean
}

function defaultFilter(options: ComboboxOption[], term: string): ComboboxOption[] {
  const needle = term.trim()
  if (!needle) {
    return options
  }
  const scored = options.flatMap((option) => {
    let best: number | null = null
    for (const target of [option.label, option.value, option.description ?? '']) {
      const score = searchScore(needle, target)
      if (score !== null && (best === null || score > best)) {
        best = score
      }
    }
    return best === null ? [] : [{ option, score: best as number }]
  })
  scored.sort(
    (a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label),
  )
  return scored.map((entry) => entry.option)
}

/** The option appended when `allowCreate` is on and the search term does
 * not exactly match an existing option. `value` is the raw trimmed term. */
function createOption(
  options: ComboboxOption[],
  term: string,
  createLabel?: (term: string) => string,
): ComboboxOption | null {
  const trimmed = term.trim()
  if (!trimmed) return null
  const needle = trimmed.toLowerCase()
  const exists = options.some(
    (option) =>
      option.value.toLowerCase() === needle ||
      option.label.toLowerCase() === needle,
  )
  if (exists) return null
  return {
    value: trimmed,
    label: createLabel ? createLabel(trimmed) : `Add "${trimmed}"`,
  }
}

interface ComboboxListProps {
  id: string
  options: ComboboxOption[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  selected: (value: string) => boolean
  onPick: (option: ComboboxOption) => void
  emptyLabel?: string
  loading?: boolean
  loadingLabel?: string
  listClassName?: string
}

function ComboboxList({
  id,
  options,
  activeIndex,
  onActiveIndexChange,
  selected,
  onPick,
  emptyLabel = 'No matches',
  loading = false,
  loadingLabel = 'Loading…',
  listClassName,
}: ComboboxListProps) {
  const rows: React.ReactNode[] = []
  let currentGroup: string | undefined
  options.forEach((option, index) => {
    if (option.group !== undefined && option.group !== currentGroup) {
      currentGroup = option.group
      rows.push(
        <div
          key={`group-${option.group}-${index}`}
          role="presentation"
          className="px-2 pb-0.5 pt-2 text-xs font-medium tracking-wide text-[var(--as-muted-fg)] uppercase"
        >
          {option.group}
        </div>,
      )
    }
    const isSelected = selected(option.value)
    const isActive = index === activeIndex
    rows.push(
      <div
        key={`${option.value}-${index}`}
        id={`${id}-opt-${index}`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled || undefined}
        data-state={isSelected ? 'checked' : 'unchecked'}
        data-active={isActive || undefined}
        tabIndex={-1}
        className={cn(
          'flex cursor-pointer items-center justify-between gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 text-sm text-[var(--as-fg)] outline-none',
          isActive && 'bg-[var(--as-secondary)]',
          option.disabled && 'pointer-events-none opacity-50',
        )}
        onMouseMove={() => onActiveIndexChange(index)}
        onClick={() => !option.disabled && onPick(option)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{option.label}</span>
            {option.description ? (
              <span className="truncate text-xs text-[var(--as-muted-fg)]">
                {option.description}
              </span>
            ) : null}
          </span>
          {option.badge ? (
            <span className="shrink-0 rounded-full bg-[var(--as-secondary)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-secondary-fg)]">
              {option.badge}
            </span>
          ) : null}
        </span>
        {isSelected ? (
          <Check className="size-4 shrink-0 text-[var(--as-primary)]" aria-hidden />
        ) : null}
      </div>,
    )
  })
  return (
    <div
      id={id}
      role="listbox"
      className={cn('max-h-60 overflow-y-auto p-1', listClassName)}
    >
      {loading ? (
        <div className="flex items-center gap-2 px-2 py-3 text-sm text-[var(--as-muted-fg)]">
          <Spinner />
          {loadingLabel}
        </div>
      ) : options.length === 0 ? (
        <div className="px-2 py-3 text-center text-sm text-[var(--as-muted-fg)]">
          {emptyLabel}
        </div>
      ) : (
        rows
      )}
    </div>
  )
}

interface ComboboxPanelProps {
  listId: string
  options: ComboboxOption[]
  activeIndex: number
  setActiveIndex: (index: number) => void
  selected: (value: string) => boolean
  onPick: (option: ComboboxOption) => void
  search: string
  setSearch: (term: string) => void
  onOpenChange: (open: boolean) => void
  searchPlaceholder: string
  searchLabel?: string
  emptyLabel?: string
  loading?: boolean
  loadingLabel?: string
  multi?: boolean
  panelClassName?: string
}

function ComboboxPanel(props: ComboboxPanelProps) {
  const {
    listId,
    options,
    activeIndex,
    setActiveIndex,
    selected,
    onPick,
    search,
    setSearch,
    onOpenChange,
    searchPlaceholder,
    searchLabel = 'Search options',
    emptyLabel,
    loading,
    loadingLabel,
    multi,
    panelClassName,
  } = props

  const nextEnabled = React.useCallback(
    (from: number, delta: 1 | -1) => {
      for (let step = 1; step <= options.length; step++) {
        const index =
          delta === 1
            ? (from + step) % Math.max(options.length, 1)
            : (from - step + options.length * 2) % Math.max(options.length, 1)
        if (index < options.length && !options[index]?.disabled) {
          return index
        }
      }
      return from
    },
    [options],
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(nextEnabled(activeIndex, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(nextEnabled(activeIndex, -1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(options.findIndex((option) => !option.disabled))
    } else if (event.key === 'End') {
      event.preventDefault()
      const last = [...options].reverse().find((option) => !option.disabled)
      if (last) {
        setActiveIndex(options.lastIndexOf(last))
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = options[activeIndex]
      if (option && !option.disabled) {
        onPick(option)
      }
    } else if (event.key === 'Tab') {
      onOpenChange(false)
    }
  }

  return (
    <PopoverPrimitive.Content
      align="start"
      collisionPadding={8}
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        const panel = event.currentTarget as HTMLElement | null
        const input = panel?.querySelector('input')
        if (input instanceof HTMLInputElement) {
          input.focus()
        }
      }}
      className={cn(
        'as-anim-pop pointer-events-auto z-[var(--as-z-popover)] w-[var(--radix-popover-trigger-width)] min-w-48 overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-3)]',
        panelClassName,
      )}
      data-as="combobox-panel"
    >
      <div className="flex items-center gap-2 border-b border-[var(--as-border)] p-2">
        <Search className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-[var(--as-muted-fg)]"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setActiveIndex(options.findIndex((option) => !option.disabled))
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <ComboboxList
        id={listId}
        options={options}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        selected={selected}
        onPick={onPick}
        emptyLabel={emptyLabel}
        loading={loading}
        loadingLabel={loadingLabel}
      />
      {multi ? (
        <div className="sr-only" role="status">
          {options.length} options
        </div>
      ) : null}
    </PopoverPrimitive.Content>
  )
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  searchLabel?: string
  emptyLabel?: string
  loadingLabel?: string
  loading?: boolean
  disabled?: boolean
  clearable?: boolean
  clearLabel?: string
  /** Offer an "Add …" row for search terms that match no option. */
  allowCreate?: boolean
  /** Custom label for the create row; receives the trimmed term. */
  createLabel?: (term: string) => string
  onSearchChange?: (term: string) => void
  onOpenChange?: (open: boolean) => void
  label?: string
  /** Keep the accessible name from `label` but do not render it visibly. */
  hideLabel?: boolean
  error?: string
  id?: string
  className?: string
  panelClassName?: string
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(
  {
    options,
    value,
    onChange,
    placeholder = 'Select an option…',
    searchPlaceholder = 'Search…',
    searchLabel,
    emptyLabel,
    loadingLabel,
    loading = false,
    disabled = false,
    clearable = false,
    clearLabel = 'Clear',
    allowCreate = false,
    createLabel,
    onSearchChange,
    onOpenChange,
    label,
    hideLabel = false,
    error,
    id: idProp,
    className,
    panelClassName,
  },
  ref,
) {
  const autoId = React.useId()
  const id = idProp ?? (label || error ? autoId : undefined)
  const listId = `${autoId}-list`
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const filtered = onSearchChange ? options : defaultFilter(options, search)
  const created = allowCreate ? createOption(options, search, createLabel) : null
  const panelOptions = created ? [...filtered, created] : filtered
  const selectedOption = options.find((option) => option.value === value)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
    if (next) {
      setActiveIndex(options.findIndex((option) => !option.disabled))
    } else {
      setSearch('')
      setActiveIndex(-1)
    }
  }

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && !hideLabel ? (
        <label htmlFor={id} className="text-sm font-medium leading-none text-[var(--as-fg)]">
          {label}
        </label>
      ) : null}
      <PopoverPrimitive.Root modal open={open} onOpenChange={handleOpenChange}>
        <span className="relative inline-flex w-full">
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              id={id}
              data-as="combobox"
              role="combobox"
              aria-label={typeof label === 'string' ? label : placeholder}
              aria-haspopup="listbox"
              aria-controls={open ? listId : undefined}
              aria-invalid={error ? true : undefined}
              disabled={disabled}
              onKeyDown={(event) => {
                if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                  event.preventDefault()
                  handleOpenChange(true)
                }
              }}
              className={cn(
                'flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)] transition-colors hover:border-[var(--as-fg)]/30 focus-visible:border-[var(--as-focus-ring)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-[var(--as-danger)]',
                clearable && selectedOption && 'pr-14',
              )}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
                {selectedOption ? (
                  <span className="truncate font-medium">{selectedOption.label}</span>
                ) : (
                  <span className="text-[var(--as-muted-fg)]">{placeholder}</span>
                )}
              </span>
              <ChevronDown
                aria-hidden
                className={cn(
                  'size-4 shrink-0 text-[var(--as-muted-fg)] transition-transform',
                  open && 'rotate-180',
                )}
              />
            </button>
          </PopoverPrimitive.Trigger>
          {clearable && selectedOption ? (
            <button
              type="button"
              aria-label={clearLabel}
              className="absolute right-7 top-1/2 [translate:0_-50%] cursor-pointer rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
              onClick={(event) => {
                event.stopPropagation()
                onChange('')
              }}
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </span>
        <PopoverPrimitive.Portal>
          {open ? (
            <ComboboxPanel
              listId={listId}
              options={panelOptions}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              selected={(optionValue) => optionValue === value}
              onPick={(option) => {
                onChange(option.value)
                handleOpenChange(false)
              }}
              search={search}
              setSearch={(term) => {
                setSearch(term)
                onSearchChange?.(term)
              }}
              onOpenChange={handleOpenChange}
              searchPlaceholder={searchPlaceholder}
              searchLabel={searchLabel}
              emptyLabel={emptyLabel}
              loading={loading}
              loadingLabel={loadingLabel}
              panelClassName={panelClassName}
            />
          ) : null}
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {error ? (
        <p role="alert" className="text-xs font-medium text-[var(--as-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
})

export interface ComboboxMultiProps {
  options: ComboboxOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  searchLabel?: string
  emptyLabel?: string
  loadingLabel?: string
  loading?: boolean
  disabled?: boolean
  maxTriggerLabels?: number
  /** Offer an "Add …" row for search terms that match no option. */
  allowCreate?: boolean
  /** Custom label for the create row; receives the trimmed term. */
  createLabel?: (term: string) => string
  onSearchChange?: (term: string) => void
  onOpenChange?: (open: boolean) => void
  label?: string
  error?: string
  id?: string
  className?: string
  panelClassName?: string
}

export const ComboboxMulti = React.forwardRef<HTMLButtonElement, ComboboxMultiProps>(
  function ComboboxMulti(
    {
      options,
      value,
      onChange,
      placeholder = 'Select options…',
      searchPlaceholder = 'Search…',
      searchLabel,
      emptyLabel,
      loadingLabel,
      loading = false,
      disabled = false,
      maxTriggerLabels = 3,
      allowCreate = false,
      createLabel,
      onSearchChange,
      onOpenChange,
      label,
      error,
      id: idProp,
      className,
      panelClassName,
    },
    ref,
  ) {
    const autoId = React.useId()
    const id = idProp ?? (label || error ? autoId : undefined)
    const listId = `${autoId}-list`
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [activeIndex, setActiveIndex] = React.useState(-1)

    const filtered = onSearchChange ? options : defaultFilter(options, search)
    const created = allowCreate ? createOption(options, search, createLabel) : null
    const panelOptions = created ? [...filtered, created] : filtered
    const selectedOptions = options.filter((option) => value.includes(option.value))
    const triggerLabel =
      selectedOptions.length === 0
        ? placeholder
        : selectedOptions.length > maxTriggerLabels
          ? `${selectedOptions.length} selected`
          : selectedOptions.map((option) => option.label).join(', ')

    const handleOpenChange = (next: boolean) => {
      setOpen(next)
      onOpenChange?.(next)
      if (next) {
        setActiveIndex(options.findIndex((option) => !option.disabled))
      } else {
        setSearch('')
        setActiveIndex(-1)
      }
    }

    const toggle = (optionValue: string) => {
      onChange(
        value.includes(optionValue)
          ? value.filter((entry) => entry !== optionValue)
          : [...value, optionValue],
      )
    }

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {label ? (
          <label htmlFor={id} className="text-sm font-medium leading-none text-[var(--as-fg)]">
            {label}
          </label>
        ) : null}
        <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              id={id}
              data-as="combobox-multi"
              role="combobox"
              aria-label={typeof label === 'string' ? label : placeholder}
              aria-haspopup="listbox"
              aria-controls={open ? listId : undefined}
              aria-invalid={error ? true : undefined}
              disabled={disabled}
              onKeyDown={(event) => {
                if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                  event.preventDefault()
                  handleOpenChange(true)
                }
              }}
              className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)] transition-colors hover:border-[var(--as-fg)]/30 focus-visible:border-[var(--as-focus-ring)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {selectedOptions.length === 0 ? (
                  <span className="text-[var(--as-muted-fg)]">{placeholder}</span>
                ) : (
                  triggerLabel
                )}
              </span>
              <ChevronDown
                aria-hidden
                className={cn(
                  'size-4 shrink-0 text-[var(--as-muted-fg)] transition-transform',
                  open && 'rotate-180',
                )}
              />
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            {open ? (
              <ComboboxPanel
                listId={listId}
                options={panelOptions}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                selected={(optionValue) => value.includes(optionValue)}
                onPick={(option) => toggle(option.value)}
                search={search}
                setSearch={(term) => {
                  setSearch(term)
                  onSearchChange?.(term)
                }}
                onOpenChange={handleOpenChange}
                searchPlaceholder={searchPlaceholder}
                searchLabel={searchLabel}
                emptyLabel={emptyLabel}
                loading={loading}
                loadingLabel={loadingLabel}
                multi
                panelClassName={panelClassName}
              />
            ) : null}
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
        {error ? (
          <p role="alert" className="text-xs font-medium text-[var(--as-danger)]">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
