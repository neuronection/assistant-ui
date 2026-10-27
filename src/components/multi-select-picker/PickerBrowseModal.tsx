import * as React from 'react'
import { Check, Plus, Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { PanelModal } from '../modal/PanelModal'
import { Spinner } from '../spinner/Spinner'
import {
  optionMatchesQuery,
  resolvePickerLabels,
  type PickerLabels,
  type PickerMode,
  type PickerOption,
  type PickerSelection,
} from './types'

export interface PickerBrowseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: PickerSelection[]
  onChange: (next: PickerSelection[]) => void
  mode?: PickerMode
  options?: PickerOption[]
  onSearch?: (query: string, category: string | null) => Promise<PickerOption[]>
  onLoadMore?: (
    query: string,
    category: string | null,
    offset: number,
  ) => Promise<PickerOption[]>
  categories?: string[]
  pageSize?: number
  debounceMs?: number
  title?: string
  labels?: PickerLabels
  className?: string
}

export const PickerBrowseModal = React.forwardRef<
  React.ComponentRef<typeof PanelModal>,
  PickerBrowseModalProps
>(function PickerBrowseModal(
  {
    open,
    onOpenChange,
    value,
    onChange,
    mode = 'multi',
    options,
    onSearch,
    onLoadMore,
    categories,
    pageSize = 50,
    debounceMs = 250,
    title,
    labels,
    className,
    ...props
  },
  ref,
) {
  const resolved = resolvePickerLabels(labels)
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [visible, setVisible] = React.useState(pageSize)
  const [results, setResults] = React.useState<PickerOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const onSearchRef = React.useRef(onSearch)
  onSearchRef.current = onSearch

  const isServer = Boolean(onSearch)

  React.useEffect(() => {
    if (!open) return
    setSearch('')
    setCategory('')
    setVisible(pageSize)
    setResults([])
    setHasMore(true)
    searchRef.current?.focus()
  }, [open, pageSize])

  React.useEffect(() => {
    if (!isServer || !open) return
    let cancelled = false
    const handle = setTimeout(async () => {
      setLoading(true)
      try {
        const found = await onSearchRef.current?.(search.trim(), category || null)
        if (!cancelled) {
          setResults(found ?? [])
          setHasMore(true)
        }
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [isServer, open, search, category, debounceMs])

  const categoryList = React.useMemo(() => {
    if (categories) return categories
    const derived = new Set<string>()
    for (const option of options ?? []) {
      if (option.category) derived.add(option.category)
    }
    return [...derived].sort()
  }, [categories, options])

  const filtered = React.useMemo(
    () =>
      (options ?? []).filter(
        (option) =>
          optionMatchesQuery(option, search) &&
          (!category || (option.category ?? '') === category),
      ),
    [options, search, category],
  )

  const shown = isServer ? results : filtered.slice(0, visible)
  const isSelected = (option: PickerOption) =>
    value.some((entry) => entry.value === option.value)

  const toggle = (option: PickerOption) => {
    if (mode === 'single') {
      onChange([option])
      onOpenChange(false)
      return
    }
    onChange(
      isSelected(option)
        ? value.filter((entry) => entry.value !== option.value)
        : [...value, option],
    )
  }

  const loadMore = async () => {
    if (!isServer) {
      setVisible((count) => count + pageSize)
      return
    }
    if (!onLoadMore || loadingMore) return
    setLoadingMore(true)
    try {
      const next = await onLoadMore(search.trim(), category || null, results.length)
      setResults((prev) => [...prev, ...next])
      setHasMore(next.length > 0)
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const showLoadMore = isServer
    ? Boolean(onLoadMore) && hasMore && !loading && results.length > 0
    : filtered.length > visible

  return (
    <PanelModal
      ref={ref}
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={title ?? resolved.browseTitle}
      closeLabel={resolved.closeLabel}
      bodyClassName="flex min-h-0 flex-1 flex-col gap-2 p-3"
      className={className}
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--as-muted-fg)]">
            {resolved.selectedCountLabel(value.length)}
          </span>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            {resolved.doneLabel}
          </Button>
        </div>
      }
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2 top-1/2 size-3.5 [translate:0_-50%] text-[var(--as-muted-fg)]"
          />
          <input
            ref={searchRef}
            type="text"
            role="searchbox"
            aria-label={resolved.searchPlaceholder}
            placeholder={resolved.searchPlaceholder}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setVisible(pageSize)
            }}
            className="h-8 w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] pl-7 pr-2 text-sm text-[var(--as-fg)] outline-none placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
          />
        </div>
        {categoryList.length > 0 ? (
          <select
            aria-label={resolved.categoryLabel}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              setVisible(pageSize)
            }}
            className="h-8 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 text-sm text-[var(--as-fg)]"
          >
            <option value="">{resolved.allCategoriesLabel}</option>
            {categoryList.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div
        data-as="picker-browse-list"
        className="min-h-0 flex-1 overflow-y-auto rounded-[var(--as-radius)] border border-[var(--as-border)] p-1"
      >
        {loading && shown.length === 0 ? (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-[var(--as-muted-fg)]">
            <Spinner />
            {resolved.searchingLabel}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-2 py-3 text-center text-sm text-[var(--as-muted-fg)]">
            {resolved.emptyLabel}
          </div>
        ) : (
          shown.map((option) => {
            const picked = isSelected(option)
            return (
              <div
                key={option.value}
                data-state={picked ? 'checked' : 'unchecked'}
                className="flex items-center gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 hover:bg-[var(--as-secondary)]"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-[var(--as-fg)]">
                    {option.label}
                  </span>
                  {option.category ? (
                    <span className="truncate text-xs text-[var(--as-muted-fg)]">
                      {option.category}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-pressed={picked}
                  aria-label={`${picked ? resolved.addedLabel : resolved.addLabel} ${option.label}`}
                  onClick={() => toggle(option)}
                  className={cn(
                    'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                    picked
                      ? 'border-[var(--as-primary)] bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] font-medium text-[var(--as-primary)]'
                      : 'border-[var(--as-border)] text-[var(--as-fg)] hover:bg-[var(--as-secondary)]',
                  )}
                >
                  {picked ? (
                    <Check className="size-3" aria-hidden />
                  ) : (
                    <Plus className="size-3" aria-hidden />
                  )}
                  {picked ? resolved.addedLabel : resolved.addLabel}
                </button>
              </div>
            )
          })
        )}
        {showLoadMore ? (
          <button
            type="button"
            onClick={loadMore}
            className="w-full cursor-pointer rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-2 text-sm text-[var(--as-primary)] hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
          >
            {loadingMore ? resolved.searchingLabel : resolved.loadMoreLabel}
          </button>
        ) : null}
      </div>
    </PanelModal>
  )
})
