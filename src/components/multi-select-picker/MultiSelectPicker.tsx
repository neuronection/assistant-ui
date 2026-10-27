import * as React from 'react'
import { LayoutGrid, Plus, Search, X, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Portal } from '../portal/Portal'
import { Spinner } from '../spinner/Spinner'
import { PickerBrowseModal } from './PickerBrowseModal'
import {
  optionMatchesQuery,
  resolvePickerLabels,
  type PickerLabels,
  type PickerMode,
  type PickerOption,
  type PickerSelection,
} from './types'

export interface MultiSelectPickerProps {
  value: PickerSelection[]
  onChange: (next: PickerSelection[]) => void
  mode?: PickerMode
  options?: PickerOption[]
  onSearch?: (query: string) => Promise<PickerOption[]>
  onLoadMore?: (
    query: string,
    category: string | null,
    offset: number,
  ) => Promise<PickerOption[]>
  categories?: string[]
  placeholder?: string
  labels?: PickerLabels
  disabled?: boolean
  debounceMs?: number
  minQueryLength?: number
  maxResults?: number
  pageSize?: number
  browseIcon?: LucideIcon
  onBrowseOpenChange?: (open: boolean) => void
  id?: string
  className?: string
}

export const MultiSelectPicker = React.forwardRef<
  HTMLDivElement,
  MultiSelectPickerProps
>(function MultiSelectPicker(
  {
    value,
    onChange,
    mode = 'multi',
    options,
    onSearch,
    onLoadMore,
    categories,
    placeholder,
    labels,
    disabled = false,
    debounceMs = 250,
    minQueryLength = 1,
    maxResults = 10,
    pageSize = 50,
    browseIcon: BrowseIcon = LayoutGrid,
    onBrowseOpenChange,
    id: idProp,
    className,
    ...props
  },
  ref,
) {
  const resolved = resolvePickerLabels(labels)
  const autoId = React.useId()
  const id = idProp ?? autoId
  const listId = `${id}-list`
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const blurTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onSearchRef = React.useRef(onSearch)
  onSearchRef.current = onSearch

  const [query, setQuery] = React.useState('')
  const [serverResults, setServerResults] = React.useState<PickerOption[]>([])
  const [searching, setSearching] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [browseOpen, setBrowseOpen] = React.useState(false)
  const [popperRect, setPopperRect] = React.useState<DOMRect | null>(null)

  const isServer = Boolean(onSearch)
  const queryLongEnough = query.trim().length >= minQueryLength
  const showList = open && queryLongEnough
  const selectedValues = React.useMemo(
    () => new Set(value.map((entry) => entry.value)),
    [value],
  )

  const clientResults = React.useMemo(
    () =>
      (options ?? [])
        .filter((option) => !selectedValues.has(option.value))
        .filter((option) => optionMatchesQuery(option, query))
        .slice(0, maxResults),
    [options, query, selectedValues, maxResults],
  )
  const results = isServer
    ? serverResults.filter((option) => !selectedValues.has(option.value))
    : clientResults
  const active = results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0

  React.useLayoutEffect(() => {
    if (!showList) {
      setPopperRect(null)
      return
    }
    const update = () => {
      const el = wrapRef.current
      if (el) setPopperRect(el.getBoundingClientRect())
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [showList])

  React.useEffect(() => {
    if (!isServer || !queryLongEnough) return
    let cancelled = false
    setSearching(true)
    const handle = setTimeout(async () => {
      try {
        const found = await onSearchRef.current?.(query.trim())
        if (!cancelled) {
          setServerResults(found ?? [])
          setActiveIndex(0)
        }
      } catch {
        if (!cancelled) setServerResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [isServer, query, queryLongEnough, debounceMs])

  const addSelection = (option: PickerOption) => {
    if (mode === 'single') {
      onChange([option])
    } else if (!selectedValues.has(option.value)) {
      onChange([...value, option])
    }
    setQuery('')
    setServerResults([])
    setOpen(false)
    setActiveIndex(0)
  }

  const removeSelection = (selection: PickerSelection) => {
    onChange(value.filter((entry) => entry.value !== selection.value))
  }

  const handleOpenChange = (next: boolean) => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setOpen(next)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!showList && queryLongEnough) {
        handleOpenChange(true)
      } else if (results.length > 0) {
        setActiveIndex((index) => (index + 1) % results.length)
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length > 0) {
        setActiveIndex((index) => (index - 1 + results.length) % results.length)
      }
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(Math.max(results.length - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = results[active]
      if (option) addSelection(option)
    } else if (event.key === 'Escape') {
      if (showList) {
        event.preventDefault()
        handleOpenChange(false)
      }
    } else if (event.key === 'Tab') {
      handleOpenChange(false)
    }
  }

  return (
    <div
      ref={ref}
      data-as="multi-select-picker"
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...props}
    >
      <div ref={wrapRef} className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 [translate:0_-50%] text-[var(--as-muted-fg)]"
        />
        <input
          id={id}
          type="text"
          role="combobox"
          data-as="picker-input"
          aria-label={resolved.inputLabel}
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && results.length > 0 ? `${listId}-opt-${active}` : undefined
          }
          disabled={disabled}
          placeholder={placeholder ?? resolved.placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (queryLongEnough) setOpen(true)
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150)
          }}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] py-2 pl-8 pr-9 text-sm text-[var(--as-fg)] outline-none transition-colors placeholder:text-[var(--as-muted-fg)] focus-visible:border-[var(--as-focus-ring)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          data-as="picker-browse"
          aria-label={resolved.browseLabel}
          title={resolved.browseTitle}
          disabled={disabled}
          onClick={() => {
            setBrowseOpen(true)
            onBrowseOpenChange?.(true)
          }}
          className="absolute right-1.5 top-1/2 cursor-pointer rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] [translate:0_-50%] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BrowseIcon className="size-4" aria-hidden />
        </button>
      </div>

      {showList && popperRect ? (
        <Portal>
          <div
            id={listId}
            role="listbox"
            aria-label={resolved.inputLabel}
            data-as="picker-listbox"
            className="fixed z-[var(--as-z-popover)] max-h-60 overflow-y-auto rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-1 text-[var(--as-fg)] shadow-[var(--as-shadow-3)]"
            style={{
              top: popperRect.bottom + 4,
              left: popperRect.left,
              width: popperRect.width,
            }}
          >
            {searching && results.length === 0 ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-[var(--as-muted-fg)]">
                <Spinner />
                {resolved.searchingLabel}
              </div>
            ) : results.length === 0 ? (
              <div className="px-2 py-3 text-center text-sm text-[var(--as-muted-fg)]">
                {resolved.emptyLabel}
              </div>
            ) : (
              results.map((option, index) => (
                <div
                  key={option.value}
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={false}
                  data-active={index === active || undefined}
                  onMouseMove={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addSelection(option)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 text-sm text-[var(--as-fg)]',
                    index === active && 'bg-[var(--as-secondary)]',
                  )}
                >
                  <Plus className="size-3 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.category ? (
                    <span className="shrink-0 rounded-full bg-[var(--as-secondary)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-secondary-fg)]">
                      {option.category}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Portal>
      ) : null}

      {value.length > 0 ? (
        <ul data-as="picker-chips" className="flex flex-wrap gap-1.5">
          {value.map((selection) => (
            <li
              key={selection.value}
              className="inline-flex items-center gap-1 rounded-[calc(var(--as-radius-sm)-2px)] bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] py-0.5 pl-2.5 pr-1.5 text-xs font-medium text-[var(--as-primary)]"
            >
              <span className="max-w-56 truncate">{selection.label}</span>
              <button
                type="button"
                aria-label={`${resolved.removeLabel} ${selection.label}`}
                disabled={disabled}
                onClick={() => removeSelection(selection)}
                className="cursor-pointer opacity-70 transition-colors hover:text-[var(--as-danger)] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <PickerBrowseModal
        open={browseOpen}
        onOpenChange={(next) => {
          setBrowseOpen(next)
          onBrowseOpenChange?.(next)
        }}
        value={value}
        onChange={onChange}
        mode={mode}
        options={options}
        onSearch={
          onSearch
            ? (queryText) => onSearch(queryText)
            : undefined
        }
        onLoadMore={onLoadMore}
        categories={categories}
        pageSize={pageSize}
        debounceMs={debounceMs}
        labels={labels}
      />
    </div>
  )
})
