import * as React from 'react'

import { cn } from '../../lib/utils'

export interface ChatTraceMetaProps {
  /** Model identifier that produced the reply. */
  model?: string
  /** Turn elapsed time (formatted ms below 1 s, then seconds). */
  durationMs?: number
  /** Number of tools the turn executed (renders `N tools`). */
  toolCount?: number
  className?: string
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  return `${(ms / 1000).toFixed(1)} s`
}

/**
 * Compact turn-trace badges ("gpt-5.6 · 1.9 s · 3 tools", career's
 * `TraceMeta`, generalized): renders nothing without data. Reads a
 * normalized view-model — parsing `metadata_json` stays app-side.
 */
export const ChatTraceMeta = React.forwardRef<HTMLDivElement, ChatTraceMetaProps>(
  function ChatTraceMeta({ model, durationMs, toolCount, className }, ref) {
    const hasModel = typeof model === 'string' && model !== ''
    const hasDuration = typeof durationMs === 'number'
    const hasTools = typeof toolCount === 'number' && toolCount > 0
    if (!hasModel && !hasDuration && !hasTools) {
      return null
    }
    return (
      <div
        ref={ref}
        data-as="chat-trace-meta"
        className={cn('mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[var(--as-muted-fg)]', className)}
      >
        {hasModel ? <span>{model}</span> : null}
        {hasDuration ? <span>{formatDuration(durationMs)}</span> : null}
        {hasTools ? (
          <span>
            {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
          </span>
        ) : null}
      </div>
    )
  },
)
