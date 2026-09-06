import * as React from 'react'
import { ArrowDown } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { cn } from '../../lib/utils'
import { ChatMessage } from '../chat-message/ChatMessage'
import { MarkdownSurface } from '../chat-markdown/MarkdownSurface'
import type { ChatMessageView } from '../chat-core/types'

export interface ChatTranscriptLabels {
  log: string
  scrollToBottom: string
  empty: string
  replied: string
}

export interface ChatTranscriptProps {
  items: ChatMessageView[]
  /** Override the default `ChatMessage` + `MarkdownSurface` rendering. */
  renderItem?: (message: ChatMessageView, index: number) => React.ReactNode
  /** Streaming tail — the live turn bubble (or any node). */
  live?: React.ReactNode
  emptyState?: React.ReactNode
  /** Stick to bottom while the user hasn't scrolled away. Default true. */
  autoScroll?: boolean
  /** Distance from the bottom that still counts as "at the bottom". Default 120 px. */
  scrollThresholdPx?: number
  /** Virtualize long transcripts (dynamic row measurement). Default false. */
  virtualized?: boolean
  labels?: Partial<ChatTranscriptLabels>
  className?: string
}

function defaultRenderItem(message: ChatMessageView) {
  return (
    <ChatMessage
      role={message.role}
      status={message.status}
      content={<MarkdownSurface value={message.content} streaming={message.status === 'streaming'} />}
      variants={message.variants}
    />
  )
}

/**
 * The conversation list: `role="log"` with polite turn-completion
 * announcements, stick-to-bottom auto-scroll with a jump-to-latest pill,
 * optional virtualization for thousand-message threads.
 */
export const ChatTranscript = React.forwardRef<HTMLDivElement, ChatTranscriptProps>(
  function ChatTranscript(
    {
      items,
      renderItem = defaultRenderItem,
      live,
      emptyState,
      autoScroll = true,
      scrollThresholdPx = 120,
      virtualized = false,
      labels,
      className,
    },
    ref,
  ) {
    const scrollRef = React.useRef<HTMLDivElement | null>(null)
    const atBottomRef = React.useRef(true)
    const [showJump, setShowJump] = React.useState(false)
    const [announcement, setAnnouncement] = React.useState('')
    const previousCountRef = React.useRef(-1)

    const onScroll = () => {
      const element = scrollRef.current
      if (element === null) {
        return
      }
      const distance = element.scrollHeight - element.scrollTop - element.clientHeight
      const atBottom = distance <= scrollThresholdPx
      atBottomRef.current = atBottom
      setShowJump(element.scrollHeight > element.clientHeight && !atBottom)
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
        const added = items[items.length - 1]
        previousCountRef.current = items.length
        if (added && added.role !== 'user') {
          setAnnouncement(labels?.replied ?? 'Assistant replied')
        }
        return
      }
      previousCountRef.current = items.length
    }, [items, labels])

    const scrollToBottom = () => {
      const element = scrollRef.current
      if (element !== null) {
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
      }
    }

    const rowCount = items.length + (live !== undefined ? 1 : 0)
    const virtualizer = useVirtualizer({
      count: virtualized ? rowCount : 0,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => 120,
      overscan: 8,
      initialRect: { width: 480, height: 600 },
    })

    return (
      <div ref={ref} data-as="chat-transcript" className={cn('relative min-h-0 flex-1', className)}>
        <div
          ref={scrollRef}
          onScroll={onScroll}
          role="log"
          aria-label={labels?.log ?? 'Conversation'}
          aria-busy={live !== undefined}
          className="h-full overflow-y-auto overscroll-contain px-1 py-2"
        >
          {items.length === 0 && live === undefined ? (
            <div className="flex h-full min-h-40 items-center justify-center p-4 text-sm text-[var(--as-muted-fg)]">
              {emptyState ?? (labels?.empty ?? 'Start the conversation')}
            </div>
          ) : virtualized ? (
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map((row) => {
                const isLive = row.index >= items.length
                const node = isLive ? live : renderItem(items[row.index]!, row.index)
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
              {items.map((message, index) => (
                <div key={message.id}>{renderItem(message, index)}</div>
              ))}
              {live !== undefined ? <div data-as="chat-transcript-live">{live}</div> : null}
            </div>
          )}
        </div>
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
        {showJump ? (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label={labels?.scrollToBottom ?? 'Scroll to latest'}
            title={labels?.scrollToBottom ?? 'Scroll to latest'}
            className="absolute bottom-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-2)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    )
  },
)
