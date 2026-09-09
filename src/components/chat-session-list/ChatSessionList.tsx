import * as React from 'react'
import { Download, MessageSquarePlus, Pencil, Search, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

import { cn } from '../../lib/utils'
import { searchScore } from '../../lib/fuzzy'

export interface ChatSessionView {
  id: string
  title: string
  updatedAt?: string | number | Date
  meta?: Record<string, unknown>
}

export interface ChatSessionListLabels {
  search: string
  searchPlaceholder: string
  newChat: string
  rename: string
  delete: string
  export: string
  today: string
  yesterday: string
  earlier: string
  empty: string
  noResults: string
}

export interface ChatSessionListIcons {
  newChat: LucideIcon
  rename: LucideIcon
  delete: LucideIcon
  export: LucideIcon
}

export interface ChatSessionListProps {
  sessions: ChatSessionView[]
  activeId?: string | null
  onSelect: (id: string) => void
  onNew?: () => void
  onRename?: (id: string) => void
  onDelete?: (id: string) => void
  onExport?: (id: string) => void
  searchable?: boolean
  groupByDate?: boolean
  labels?: Partial<ChatSessionListLabels>
  icons?: Partial<ChatSessionListIcons>
  className?: string
}

function toDate(value: string | number | Date | undefined): Date | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'number') {
    return new Date(value)
  }
  return parseISO(value)
}

function bucketOf(date: Date | undefined): 'today' | 'yesterday' | 'earlier' | 'none' {
  if (date === undefined) {
    return 'none'
  }
  if (isToday(date)) {
    return 'today'
  }
  if (isYesterday(date)) {
    return 'yesterday'
  }
  return 'earlier'
}

/**
 * The session list beside a full-page chat (study's `ChatSessionList` +
 * health's history overlay, generalized): fuzzy search, date grouping,
 * active marking, per-session actions (rename/delete/export) via the
 * menu when handlers are provided. All actions stay app-side.
 */
export const ChatSessionList = React.forwardRef<HTMLDivElement, ChatSessionListProps>(
  function ChatSessionList(
    {
      sessions,
      activeId,
      onSelect,
      onNew,
      onRename,
      onDelete,
      onExport,
      searchable = true,
      groupByDate = true,
      labels,
      icons,
      className,
    },
    ref,
  ) {
    const [query, setQuery] = React.useState('')
    const NewIcon = icons?.newChat ?? MessageSquarePlus
    const RenameIcon = icons?.rename ?? Pencil
    const DeleteIcon = icons?.delete ?? Trash2
    const ExportIcon = icons?.export ?? Download

    const filtered = React.useMemo(() => {
      const trimmed = query.trim()
      if (trimmed === '') {
        return sessions
      }
      return sessions
        .map((session) => ({
          session,
          score: searchScore(trimmed, session.title),
        }))
        .filter((entry) => entry.score !== null)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .map((entry) => entry.session)
    }, [sessions, query])

    const groups = React.useMemo(() => {
      if (!groupByDate) {
        return [{ key: 'all', label: null as string | null, sessions: filtered }]
      }
      const ordered = [...filtered].sort((a, b) => {
        const dateA = toDate(a.updatedAt)?.getTime() ?? 0
        const dateB = toDate(b.updatedAt)?.getTime() ?? 0
        return dateB - dateA
      })
      const byBucket = new Map<string, ChatSessionView[]>()
      for (const session of ordered) {
        const bucket = bucketOf(toDate(session.updatedAt))
        const list = byBucket.get(bucket) ?? []
        list.push(session)
        byBucket.set(bucket, list)
      }
      const order = ['today', 'yesterday', 'earlier', 'none']
      return order
        .filter((bucket) => byBucket.has(bucket))
        .map((bucket) => ({
          key: bucket,
          label:
            bucket === 'today'
              ? (labels?.today ?? 'Today')
              : bucket === 'yesterday'
                ? (labels?.yesterday ?? 'Yesterday')
                : bucket === 'earlier'
                  ? (labels?.earlier ?? 'Earlier')
                  : null,
          sessions: byBucket.get(bucket) ?? [],
        }))
    }, [filtered, groupByDate, labels])

    return (
      <div ref={ref} data-as="chat-session-list" className={cn('flex h-full min-h-0 w-full flex-col gap-2', className)}>
        <div className="flex items-center gap-2">
          {searchable ? (
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--as-muted-fg)]" aria-hidden />
              <input
                type="search"
                role="searchbox"
                value={query}
                aria-label={labels?.search ?? 'Search conversations'}
                placeholder={labels?.searchPlaceholder ?? 'Search…'}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] py-1.5 pe-2 ps-8 text-xs text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
              />
            </div>
          ) : null}
          {onNew ? (
            <button
              type="button"
              onClick={onNew}
              aria-label={labels?.newChat ?? 'New conversation'}
              title={labels?.newChat ?? 'New conversation'}
              className="flex size-7 shrink-0 items-center justify-center rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <NewIcon className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-[var(--as-muted-fg)]">{labels?.empty ?? 'No conversations yet'}</p>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-3 text-xs text-[var(--as-muted-fg)]">{labels?.noResults ?? 'No matches'}</p>
        ) : (
          <div role="list" aria-label={labels?.search ?? 'Conversations'} className="min-h-0 flex-1 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.key} className="mb-2">
                {group.label ? (
                  <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
                    {group.label}
                  </p>
                ) : null}
                {group.sessions.map((session) => {
                  const isActive = session.id === activeId
                  const date = toDate(session.updatedAt)
                  const actions =
                    onRename || onDelete || onExport
                      ? [
                          onRename
                            ? {
                                key: 'rename',
                                label: labels?.rename ?? 'Rename',
                                icon: <RenameIcon className="size-3.5" aria-hidden />,
                                onSelect: () => onRename(session.id),
                              }
                            : null,
                          onExport
                            ? {
                                key: 'export',
                                label: labels?.export ?? 'Export',
                                icon: <ExportIcon className="size-3.5" aria-hidden />,
                                onSelect: () => onExport(session.id),
                              }
                            : null,
                          onDelete
                            ? {
                                key: 'delete',
                                label: labels?.delete ?? 'Delete',
                                icon: <DeleteIcon className="size-3.5" aria-hidden />,
                                onSelect: () => onDelete(session.id),
                                danger: true,
                              }
                            : null,
                        ].filter((item): item is NonNullable<typeof item> => item !== null)
                      : []
                  return (
                    <div
                      key={session.id}
                      role="listitem"
                      aria-current={isActive ? 'true' : undefined}
                      data-active={isActive || undefined}
                      className={cn(
                        'group/session flex cursor-pointer items-center gap-2 rounded-[var(--as-radius)] px-2 py-1.5 text-xs transition-colors hover:bg-[var(--as-surface-raised)]',
                        isActive && 'bg-[var(--as-surface-raised)] font-medium text-[var(--as-fg)]',
                      )}
                      onClick={() => onSelect(session.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelect(session.id)
                        }
                      }}
                      tabIndex={0}
                    >
                      <span className="min-w-0 flex-1 truncate text-[var(--as-fg)]">{session.title}</span>
                      {date ? (
                        <span className="shrink-0 text-[10px] text-[var(--as-muted-fg)]">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </span>
                      ) : null}
                      {actions.length > 0 ? (
                        <span
                          role="group"
                          aria-label={labels?.rename ?? 'Conversation actions'}
                          className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/session:opacity-100"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          {actions.map((action) => (
                            <button
                              key={action.key}
                              type="button"
                              aria-label={action.label}
                              title={action.label}
                              onClick={action.onSelect}
                              className={cn(
                                'rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-surface)] hover:text-[var(--as-fg)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                                action.danger && 'hover:text-[var(--as-danger)]',
                              )}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </span>
                      ) : null}
                     </div>
                   )
                 })}
                </div>
              ))
            }
          </div>
        )}
      </div>
    )
  },
)
