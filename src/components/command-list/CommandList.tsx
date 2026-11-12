import * as React from 'react'
import { Search, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { searchScore } from '../../lib/fuzzy'

export interface CommandItem {
  id: string
  label: string
  hint?: string
  icon?: LucideIcon
  /** Extra terms searched alongside `label` and `hint`. */
  keywords?: string[]
  /** Display string already formatted by the app (e.g. "Ctrl K"). */
  shortcut?: string
  disabled?: boolean
  disabledReason?: string
}

export interface CommandGroup {
  id: string
  label: string
  items: CommandItem[]
  /** `'none'` keeps app-ordered/async results untouched by the query. */
  filter?: 'none' | 'fuzzy'
}

export interface CommandSelectContext {
  groupId: string
  query: string
}

export interface CommandListLabels {
  title?: string
  placeholder?: string
  empty?: string
  /** `{count}` is replaced with the visible item count. */
  results?: string
  /** Accessible name for the listbox when no `title` is rendered. */
  listLabel?: string
}

export interface CommandListProps {
  query: string
  onQueryChange: (query: string) => void
  groups: CommandGroup[]
  onSelect: (item: CommandItem, context: CommandSelectContext) => void
  labels?: CommandListLabels
  activeId?: string
  onActiveIdChange?: (id: string) => void
  /** Default `'select'` for inline lists; modal wrappers pass `'focus'`. */
  tabBehavior?: 'select' | 'focus'
  className?: string
}

const DEFAULT_LABELS: Required<
  Pick<CommandListLabels, 'placeholder' | 'empty' | 'results' | 'listLabel'>
> = {
  placeholder: 'Search commands…',
  empty: 'No matching commands.',
  results: '{count} results',
  listLabel: 'Commands',
}

function isIMEComposition(
  event: React.KeyboardEvent<HTMLInputElement>,
  composing: boolean,
): boolean {
  return composing || event.nativeEvent.isComposing || event.keyCode === 229
}

function matchesQuery(item: CommandItem, term: string): boolean {
  for (const target of [item.label, item.hint ?? '', ...(item.keywords ?? [])]) {
    if (target && searchScore(term, target) !== null) {
      return true
    }
  }
  return false
}

interface VisibleEntry {
  item: CommandItem
  groupId: string
}

export const CommandList = React.forwardRef<HTMLInputElement, CommandListProps>(
  function CommandList(
    {
      query,
      onQueryChange,
      groups,
      onSelect,
      labels,
      activeId: activeIdProp,
      onActiveIdChange,
      tabBehavior = 'select',
      className,
    },
    ref,
  ) {
    const autoId = React.useId()
    const listId = `${autoId}-listbox`
    const titleId = `${autoId}-title`
    const isControlled = activeIdProp !== undefined
    const [internalActiveId, setInternalActiveId] = React.useState<string | undefined>(undefined)
    const activeId = isControlled ? activeIdProp : internalActiveId
    const composingRef = React.useRef(false)

    const merged = {
      placeholder: labels?.placeholder ?? DEFAULT_LABELS.placeholder,
      empty: labels?.empty ?? DEFAULT_LABELS.empty,
      results: labels?.results ?? DEFAULT_LABELS.results,
      listLabel: labels?.listLabel ?? DEFAULT_LABELS.listLabel,
    }

    const updateActiveId = React.useCallback(
      (id: string) => {
        if (!isControlled) {
          setInternalActiveId(id)
        }
        onActiveIdChange?.(id)
      },
      [isControlled, onActiveIdChange],
    )

    const filteredGroups = React.useMemo(() => {
      const term = query.trim()
      return groups
        .map((group) => {
          const items =
            group.filter === 'none' || term === ''
              ? group.items
              : group.items.filter((item) => matchesQuery(item, term))
          return { ...group, items }
        })
        .filter((group) => group.items.length > 0)
    }, [groups, query])

    const visibleEntries = React.useMemo<VisibleEntry[]>(
      () =>
        filteredGroups.flatMap((group) =>
          group.items.map((item) => ({ item, groupId: group.id })),
        ),
      [filteredGroups],
    )

    const count = visibleEntries.length
    const visibleKey = visibleEntries
      .map((entry) => `${entry.item.id}:${entry.item.disabled ? '0' : '1'}`)
      .join('|')

    const currentEntry = visibleEntries.find(
      (entry) => entry.item.id === activeId && !entry.item.disabled,
    )
    const firstEnabledId = visibleEntries.find((entry) => !entry.item.disabled)?.item.id
    const resolvedActiveId = currentEntry?.item.id ?? firstEnabledId
    const hasVisibleActive = currentEntry !== undefined

    React.useEffect(() => {
      if (count === 0 || hasVisibleActive || firstEnabledId === undefined) {
        return
      }
      if (firstEnabledId !== activeId) {
        updateActiveId(firstEnabledId)
      }
    }, [
      activeId,
      count,
      firstEnabledId,
      hasVisibleActive,
      updateActiveId,
      visibleKey,
    ])

    const enabledEntries = visibleEntries.filter((entry) => !entry.item.disabled)

    const moveActive = (delta: 1 | -1) => {
      if (enabledEntries.length === 0) {
        return
      }
      const index = enabledEntries.findIndex((entry) => entry.item.id === resolvedActiveId)
      const nextIndex =
        index === -1
          ? delta === 1
            ? 0
            : enabledEntries.length - 1
          : (index + delta + enabledEntries.length) % enabledEntries.length
      updateActiveId(enabledEntries[nextIndex]!.item.id)
    }

    const selectActive = (): boolean => {
      const entry = visibleEntries.find((candidate) => candidate.item.id === resolvedActiveId)
      if (!entry || entry.item.disabled) {
        return false
      }
      onSelect(entry.item, { groupId: entry.groupId, query })
      return true
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isIMEComposition(event, composingRef.current)) {
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveActive(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveActive(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        if (enabledEntries.length > 0) {
          updateActiveId(enabledEntries[0]!.item.id)
        }
      } else if (event.key === 'End') {
        event.preventDefault()
        if (enabledEntries.length > 0) {
          updateActiveId(enabledEntries[enabledEntries.length - 1]!.item.id)
        }
      } else if (event.key === 'Enter') {
        event.preventDefault()
        selectActive()
      } else if (event.key === 'Tab' && tabBehavior === 'select') {
        if (selectActive()) {
          event.preventDefault()
        }
      }
    }

    const activeIndex = visibleEntries.findIndex(
      (entry) => entry.item.id === resolvedActiveId,
    )
    const activeOptionId =
      activeIndex >= 0 ? `${autoId}-opt-${activeIndex}` : undefined
    const resultsText = merged.results.replace(/\{count\}/g, String(count))
    const searchLabel = labels?.title ?? labels?.placeholder ?? 'Search commands'

    let itemIndex = -1

    return (
      <div data-as="command-list" className={cn('flex flex-col', className)}>
        {labels?.title ? (
          <div
            id={titleId}
            role="heading"
            aria-level={2}
            data-as="command-list-title"
            className="px-3 pt-3 text-sm font-semibold text-[var(--as-fg)]"
          >
            {labels.title}
          </div>
        ) : null}
        <div
          data-as="command-list-search"
          className="flex items-center gap-2 border-b border-[var(--as-border)] px-3"
        >
          <Search className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
          <input
            ref={ref}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={activeOptionId}
            aria-label={searchLabel}
            placeholder={merged.placeholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => {
              composingRef.current = true
            }}
            onCompositionEnd={() => {
              composingRef.current = false
            }}
            data-as="command-list-input"
            className="h-11 w-full min-w-0 bg-transparent text-sm text-[var(--as-fg)] outline-none placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          />
        </div>
        <div
          id={listId}
          role="listbox"
          aria-label={labels?.title ? undefined : merged.listLabel}
          aria-labelledby={labels?.title ? titleId : undefined}
          data-as="command-list-listbox"
          className="max-h-80 overflow-y-auto p-1"
        >
          {filteredGroups.map((group, groupIndex) => {
            const headingId = `${autoId}-group-${groupIndex}`
            return (
              <div
                key={group.id}
                role="group"
                aria-labelledby={headingId}
                data-as="command-list-group"
              >
                <div
                  id={headingId}
                  data-as="command-list-group-label"
                  className="px-2 pb-0.5 pt-2 text-xs font-medium uppercase tracking-wide text-[var(--as-muted-fg)]"
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  itemIndex += 1
                  const optionId = `${autoId}-opt-${itemIndex}`
                  const isActive = item.id === resolvedActiveId
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      id={optionId}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={item.disabled || undefined}
                      data-as="command-list-item"
                      data-active={isActive || undefined}
                      data-disabled={item.disabled || undefined}
                      title={item.disabled ? item.disabledReason : undefined}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 text-sm text-[var(--as-fg)] outline-none',
                        isActive && 'bg-[var(--as-secondary)]',
                        item.disabled && 'cursor-not-allowed',
                      )}
                      onMouseMove={item.disabled ? undefined : () => updateActiveId(item.id)}
                      onClick={() => {
                        if (!item.disabled) {
                          onSelect(item, { groupId: group.id, query })
                        }
                      }}
                    >
                      {Icon ? (
                        <Icon className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
                      ) : null}
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span
                          className={cn(
                            'truncate',
                            item.disabled && 'text-[var(--as-muted-fg)]',
                          )}
                        >
                          {item.label}
                        </span>
                        {item.hint ? (
                          <span className="truncate text-xs text-[var(--as-muted-fg)]">
                            {item.hint}
                          </span>
                        ) : null}
                        {item.disabled && item.disabledReason ? (
                          <span className="truncate text-xs text-[color-mix(in_srgb,var(--as-warning)_72%,var(--as-fg))]">
                            {item.disabledReason}
                          </span>
                        ) : null}
                      </span>
                      {item.shortcut ? (
                        <kbd className="shrink-0 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--as-muted-fg)]">
                          {item.shortcut}
                        </kbd>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        {count === 0 ? (
          <div
            role="status"
            data-as="command-list-empty"
            className="px-3 py-6 text-center text-sm text-[var(--as-muted-fg)]"
          >
            {merged.empty}
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            data-as="command-list-results"
            className="sr-only"
          >
            {resultsText}
          </div>
        )}
      </div>
    )
  },
)
