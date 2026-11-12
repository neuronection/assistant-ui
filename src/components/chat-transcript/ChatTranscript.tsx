import * as React from 'react'
import { ArrowDown } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { cn } from '../../lib/utils'
import { format } from 'date-fns'
import { Square } from 'lucide-react'
import { ChatMessage } from '../chat-message/ChatMessage'
import { MarkdownSurface } from '../chat-markdown/MarkdownSurface'
import type { ChatMessageView } from '../chat-core/types'
import { ChatSearchField, type ChatSearchFieldLabels } from './ChatSearchField'

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
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export interface ChatTranscriptLabels {
  log: string
  scrollToBottom: string
  newMessages: string
  empty: string
  replied: string
  search: string
  searchPlaceholder: string
  previousMatch: string
  nextMatch: string
  clearSearch: string
  matches: string
  today: string
  yesterday: string
  stop: string
}

export type ChatTranscriptGroupPos = 'single' | 'start' | 'mid' | 'end'

export interface ChatTranscriptSearch {
  query: string
  onQueryChange: (query: string) => void
}

export interface ChatTranscriptProps {
  items: ChatMessageView[]
  /** Override the default `ChatMessage` + `MarkdownSurface` rendering (third arg: group position when `groupConsecutive`; fourth arg: active search query). */
  renderItem?: (message: ChatMessageView, index: number, groupPos?: ChatTranscriptGroupPos, query?: string) => React.ReactNode
  /** Streaming tail — the live turn bubble (or `ChatPending`) or any node. */
  live?: React.ReactNode
  emptyState?: React.ReactNode
  /** Stick to bottom while the user hasn't scrolled away. Default true. */
  autoScroll?: boolean
  /** Distance from the bottom that still counts as "at the bottom". Default 120 px. */
  scrollThresholdPx?: number
  /** Virtualize long transcripts (dynamic row measurement). Default false. */
  virtualized?: boolean
  /**
   * Tighten the spacing between consecutive same-role messages and tag
   * each row with `data-group-pos` (`single | start | mid | end`).
   * Default false.
   */
  groupConsecutive?: boolean
  /** Visual design for the default renderer: paired bubbles (default) or flat assistant prose over the panel surface. */
  design?: 'bubbles' | 'flat'
  /**
   * In-conversation search (plan 101 P2): renders `ChatSearchField`
   * above the log, highlights matches in the default renderer, and
   * jumps between them (Enter/Shift+Enter in the field, or the
   * prev/next buttons). Jump-scrolling requires a non-virtualized
   * transcript; virtualized transcripts highlight visible rows only.
   */
  search?: ChatTranscriptSearch
  /**
   * Today/Yesterday/date chips between day groups (reads
   * `ChatMessageView.createdAt`; rows without one join the previous
   * group). Default false.
   */
  showDateSeparators?: boolean
  /** Custom formatter for older-day chips (default `MMM d, yyyy`). */
  formatDate?: (date: Date) => string
  /** Scroll a message into view and flash it when this changes (branch-tree clicks, citations, deep links). */
  focusMessageId?: string | null
  /** Show a floating stop pill beside the jump pill while a live turn streams and the user scrolled away. */
  onStop?: () => void
  labels?: Partial<ChatTranscriptLabels & ChatSearchFieldLabels>
  className?: string
}

function defaultRenderItem(message: ChatMessageView, design: 'bubbles' | 'flat', query?: string) {
  return (
    <ChatMessage
      role={message.role}
      status={message.status}
      design={design}
      content={<MarkdownSurface value={message.content} streaming={message.status === 'streaming'} query={query} />}
      variants={message.variants}
    />
  )
}

/**
 * The conversation list: `role="log"` with polite turn-completion
 * announcements, stick-to-bottom auto-scroll with an unread-counting
 * jump-to-latest pill, optional consecutive-message grouping, a top
 * fade mask while scrolled into the thread, thin themed scrollbars,
 * and optional virtualization for thousand-message threads.
 */
export const ChatTranscript = React.forwardRef<HTMLDivElement, ChatTranscriptProps>(
  function ChatTranscript(
    {
      items,
      renderItem,
      live,
      emptyState,
      autoScroll = true,
      scrollThresholdPx = 120,
      virtualized = false,
      groupConsecutive = false,
      design = 'bubbles',
      search,
      showDateSeparators = false,
      formatDate,
      focusMessageId,
      onStop,
      labels,
      className,
    },
    ref,
  ) {
    const scrollRef = React.useRef<HTMLDivElement | null>(null)
    const atBottomRef = React.useRef(true)
    const lastScrollTopRef = React.useRef(0)
    const lastTouchYRef = React.useRef<number | null>(null)
    const [showJump, setShowJump] = React.useState(false)
    const [fadeTop, setFadeTop] = React.useState(false)
    const [unread, setUnread] = React.useState(0)
    const [announcement, setAnnouncement] = React.useState('')
    const previousCountRef = React.useRef(-1)
    const [searchActive, setSearchActive] = React.useState(0)
    const [flashId, setFlashId] = React.useState<string | null>(null)

    const searchNeedle = search?.query.trim().toLowerCase() ?? ''
    const searchMatches = React.useMemo(() => {
      if (searchNeedle === '') {
        return []
      }
      return items
        .map((message, index) =>
          message.content.toLowerCase().includes(searchNeedle) ? index : -1,
        )
        .filter((index) => index >= 0)
    }, [items, searchNeedle])

    React.useEffect(() => {
      setSearchActive(0)
      if (searchMatches.length > 0) {
        jumpToMatch(0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchNeedle])

    React.useEffect(() => {
      if (flashId === null) {
        return
      }
      const id = window.setTimeout(() => setFlashId(null), 1200)
      return () => window.clearTimeout(id)
    }, [flashId])

    const jumpToMatch = (index: number) => {
      if (searchMatches.length === 0) {
        return
      }
      const bounded = ((index % searchMatches.length) + searchMatches.length) % searchMatches.length
      setSearchActive(bounded)
      const messageIndex = searchMatches[bounded]
      const messageId = messageIndex !== undefined ? items[messageIndex]?.id : undefined
      if (messageId === undefined) {
        return
      }
      setFlashId(messageId)
      if (!virtualized) {
        const row = scrollRef.current?.querySelector(`[data-message-id="${messageId}"]`)
        row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }

    React.useEffect(() => {
      if (focusMessageId === null || focusMessageId === undefined) {
        return
      }
      setFlashId(focusMessageId)
      if (!virtualized) {
        const row = scrollRef.current?.querySelector(`[data-message-id="${focusMessageId}"]`)
        row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }, [focusMessageId, virtualized])

    const dayKey = (message: ChatMessageView): string | null => {
      if (message.createdAt === undefined) {
        return null
      }
      const date = toDate(message.createdAt)
      return date === undefined
        ? null
        : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }

    const dayLabel = (message: ChatMessageView): string | null => {
      if (message.createdAt === undefined) {
        return null
      }
      const date = toDate(message.createdAt)
      if (date === undefined) {
        return null
      }
      const now = new Date()
      const startOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
      const dayDiff = Math.round((startOf(now) - startOf(date)) / 86_400_000)
      if (dayDiff === 0) {
        return labels?.today ?? 'Today'
      }
      if (dayDiff === 1) {
        return labels?.yesterday ?? 'Yesterday'
      }
      return formatDate !== undefined ? formatDate(date) : format(date, 'MMM d, yyyy')
    }

    const onScroll = () => {
      const element = scrollRef.current
      if (element === null) {
        return
      }
      const distance = element.scrollHeight - element.scrollTop - element.clientHeight
      const goingUp = element.scrollTop < lastScrollTopRef.current
      lastScrollTopRef.current = element.scrollTop
      const atBottom = distance <= scrollThresholdPx && !(goingUp && distance > 0)
      atBottomRef.current = atBottom
      setShowJump(element.scrollHeight > element.clientHeight && !atBottom)
      setFadeTop(element.scrollTop > 8)
      if (atBottom) {
        setUnread(0)
      }
    }

    /**
     * Fast streams re-pin the bottom on every render (rAF), which erases
     * a partial upward scroll before it can cross `scrollThresholdPx` —
     * so user scroll-up INTENT cancels stickiness synchronously here
     * (wheel up, touch drag up, scroll-up keys), and any upward scroll
     * event with distance left also breaks it. Scrolling back to the
     * bottom (or the jump pill) re-arms the follow.
     */
    const cancelStick = () => {
      const element = scrollRef.current
      if (element === null) {
        return
      }
      atBottomRef.current = false
      setShowJump(element.scrollHeight > element.clientHeight)
    }

    const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      if (event.deltaY < 0) {
        cancelStick()
      }
    }

    const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
      lastTouchYRef.current = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
      const y = event.touches[0]?.clientY
      if (y === undefined) {
        return
      }
      if (lastTouchYRef.current !== null && y > lastTouchYRef.current) {
        cancelStick()
      }
      lastTouchYRef.current = y
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === 'ArrowUp' ||
        event.key === 'PageUp' ||
        event.key === 'Home' ||
        (event.key === ' ' && event.shiftKey)
      ) {
        cancelStick()
      }
    }

    React.useEffect(() => {
      const element = scrollRef.current
      if (element === null || !autoScroll || !atBottomRef.current) {
        return
      }
      const frame = requestAnimationFrame(() => {
        element.scrollTop = element.scrollHeight
      })
      return () => cancelAnimationFrame(frame)
    })

    React.useEffect(() => {
      if (previousCountRef.current === -1) {
        previousCountRef.current = items.length
        return
      }
      if (items.length > previousCountRef.current) {
        const added = items.slice(previousCountRef.current)
        previousCountRef.current = items.length
        const assistantAdded = added.filter((message) => message.role !== 'user').length
        if (assistantAdded > 0 && !atBottomRef.current) {
          setUnread((count) => count + assistantAdded)
        }
        if (added[added.length - 1]?.role !== 'user') {
          setAnnouncement(labels?.replied ?? 'Assistant replied')
        }
        return
      }
      previousCountRef.current = items.length
    }, [items, labels])

    const scrollToBottom = () => {
      const element = scrollRef.current
      if (element !== null) {
        setUnread(0)
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
      }
    }

    const groupPos = (index: number): ChatTranscriptGroupPos => {
      const role = items[index]?.role
      if (role === undefined || role === 'system') {
        return 'single'
      }
      const prevSame = index > 0 && items[index - 1]?.role === role && items[index - 1]?.role !== 'system'
      const nextSame = index < items.length - 1 && items[index + 1]?.role === role && items[index + 1]?.role !== 'system'
      if (prevSame && nextSame) {
        return 'mid'
      }
      if (prevSame) {
        return 'end'
      }
      if (nextSame) {
        return 'start'
      }
      return 'single'
    }

    const renderRow = (message: ChatMessageView, index: number) => {
      const pos = groupConsecutive ? groupPos(index) : undefined
      const node = renderItem
        ? renderItem(message, index, pos, searchNeedle === '' ? undefined : search?.query.trim())
        : defaultRenderItem(message, design, searchNeedle === '' ? undefined : search?.query.trim())
      const grouped = pos === 'mid' || pos === 'end'
      return (
        <div
          key={message.id}
          data-message-id={message.id}
          data-group-pos={pos}
          data-search-flash={message.id === flashId || undefined}
          className={cn(groupConsecutive && grouped && '-mt-2')}
        >
          {node}
        </div>
      )
    }

    const rowCount = items.length + (live !== undefined ? 1 : 0)
    const virtualizer = useVirtualizer({
      count: virtualized ? rowCount : 0,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => 120,
      overscan: 8,
      initialRect: { width: 480, height: 600 },
    })

    const jumpLabel = labels?.scrollToBottom ?? 'Scroll to latest'
    const jumpFullLabel =
      unread > 0 ? `${jumpLabel} — ${unread} ${labels?.newMessages ?? 'new messages'}` : jumpLabel

    return (
      <div
        ref={ref}
        data-as="chat-transcript"
        data-grouped={groupConsecutive || undefined}
        data-fade-top={fadeTop || undefined}
        className={cn('relative flex min-h-0 flex-1 flex-col', className)}
      >
        {search ? (
          <ChatSearchField
            query={search.query}
            onQueryChange={search.onQueryChange}
            matchCount={searchMatches.length}
            activeIndex={searchActive}
            onPrevious={() => jumpToMatch(searchActive - 1)}
            onNext={() => jumpToMatch(searchActive + 1)}
            labels={
              labels
                ? ({
                    search: labels.search,
                    placeholder: labels.searchPlaceholder,
                    previous: labels.previousMatch,
                    next: labels.nextMatch,
                    clear: labels.clearSearch,
                    matches: labels.matches,
                  } satisfies Partial<ChatSearchFieldLabels>)
                : undefined
            }
            className="mx-1 mb-1 shrink-0"
          />
        ) : null}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onKeyDown={onKeyDown}
          role="log"
          aria-label={labels?.log ?? 'Conversation'}
          aria-busy={live !== undefined}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-2"
        >
          {items.length === 0 && live === undefined ? (
            <div className="flex h-full min-h-40 items-center justify-center p-4 text-sm text-[var(--as-muted-fg)]">
              {emptyState ?? (labels?.empty ?? 'Start the conversation')}
            </div>
          ) : virtualized ? (
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map((row) => {
                const isLive = row.index >= items.length
                const node = isLive ? live : renderRow(items[row.index]!, row.index)
                return (
                  <div
                    key={row.key}
                    data-index={row.index}
                    ref={virtualizer.measureElement}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }}
                    className="px-2 py-1.5"
                  >
                    {node}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-2">
              {items.map((message, index) => {
                const rows: React.ReactNode[] = []
                if (showDateSeparators && index > 0) {
                  const key = dayKey(message)
                  const previousKey = dayKey(items[index - 1]!)
                  if (key !== null && key !== previousKey) {
                    const label = dayLabel(message)
                    if (label !== null) {
                      rows.push(
                        <div key={`day-${key}-${message.id}`} data-as="chat-date-separator" className="flex items-center gap-2 py-1" role="separator" aria-label={label}>
                          <span className="h-px flex-1 bg-[var(--as-border)]" aria-hidden />
                          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">{label}</span>
                          <span className="h-px flex-1 bg-[var(--as-border)]" aria-hidden />
                        </div>,
                      )
                    }
                  }
                }
                rows.push(renderRow(message, index))
                return <React.Fragment key={message.id}>{rows}</React.Fragment>
              })}
              {live !== undefined ? <div data-as="chat-transcript-live">{live}</div> : null}
            </div>
          )}
        </div>
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
        {showJump && live !== undefined && onStop !== undefined ? (
          <button
            type="button"
            onClick={onStop}
            aria-label={labels?.stop ?? 'Stop generating'}
            title={labels?.stop ?? 'Stop generating'}
            className="as-anim-slide-up absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-2)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <Square className="size-3.5" aria-hidden />
          </button>
        ) : null}
        {showJump ? (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label={jumpFullLabel}
            title={jumpFullLabel}
            className="as-anim-slide-up absolute bottom-3 left-1/2 -ml-4 flex size-8 items-center justify-center rounded-full border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-2)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <ArrowDown className="size-4" aria-hidden />
            {unread > 0 ? (
              <span
                aria-hidden
                className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--as-primary)] px-1 text-[10px] font-semibold leading-none text-[var(--as-primary-fg)]"
              >
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
    )
  },
)
