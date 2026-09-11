import * as React from 'react'
import { Check, ChevronDown, TriangleAlert, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn, prettyJson } from '../../lib/utils'
import { Spinner } from '../spinner/Spinner'

export interface ChatToolCardLabels {
  running: string
  done: string
  failed: string
  args: string
  result: string
  details: string
}

export interface ChatToolCardProps {
  name: string
  /** Human title, e.g. "Searching the job catalog". */
  title?: string
  status: 'running' | 'done' | 'failed'
  /** Serialized arguments (JSON string or formatted text). */
  args?: string
  /** Serialized result. */
  result?: string
  /**
   * Custom result view (study's per-tool views, family plan 12 L2).
   * Called with the result string (possibly empty when the tool has no
   * serialized output); when absent the default `<pre>` pane renders.
   */
  renderResult?: (result: string) => React.ReactNode
  durationMs?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  labels?: Partial<ChatToolCardLabels>
  icon?: LucideIcon
  className?: string
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  return `${(ms / 1000).toFixed(1)} s`
}

/**
 * Inline tool-call observation card (study's `ToolCallCard` + health's tool
 * chips, generalized): status, duration, expandable args/result. The
 * inspector stays app-side (health opens its own modal from `onOpenChange`
 * or wrapping markup).
 */
export const ChatToolCard = React.forwardRef<HTMLDivElement, ChatToolCardProps>(
  function ChatToolCard(
    {
      name,
      title,
      status,
      args,
      result,
      renderResult,
      durationMs,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      labels,
      icon: Icon = Wrench,
      className,
    },
    ref,
  ) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const isControlled = openProp !== undefined
    const open = isControlled ? openProp : uncontrolledOpen
    const regionId = React.useId()
    const expandable = Boolean(args || result || renderResult)

    const toggle = () => {
      if (!expandable) {
        return
      }
      const next = !open
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    }

    const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggle()
      }
    }

    const statusLabel =
      status === 'running' ? (labels?.running ?? 'Running') : status === 'done' ? (labels?.done ?? 'Done') : (labels?.failed ?? 'Failed')

    const Header = (expandable ? 'button' : 'div') as 'button'
    const headerProps: React.ComponentPropsWithoutRef<'button'> = expandable
      ? {
          type: 'button',
          'aria-expanded': open,
          'aria-controls': regionId,
          onClick: toggle,
          onKeyDown,
        }
      : {}

    return (
      <div
        ref={ref}
        data-as="chat-tool-card"
        data-status={status}
        className={cn(
          'rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] text-xs',
          className,
        )}
      >
        <Header
          {...headerProps}
          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <Icon className="size-3.5 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-[var(--as-fg)]">{title ?? name}</span>
            {title ? <span className="ml-1.5 font-mono text-[var(--as-muted-fg)]">{name}</span> : null}
          </span>
          {durationMs !== undefined ? (
            <span className="shrink-0 tabular-nums text-[var(--as-muted-fg)]">{formatDuration(durationMs)}</span>
          ) : null}
          <span
            role={status === 'running' ? 'status' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1',
              status === 'done' && 'text-[var(--as-success)]',
              status === 'failed' && 'text-[var(--as-danger)]',
              status === 'running' && 'text-[var(--as-muted-fg)]',
            )}
          >
            {status === 'running' ? (
              <Spinner size="sm" />
            ) : status === 'done' ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <TriangleAlert className="size-3.5" aria-hidden />
            )}
            <span className="sr-only">{statusLabel}</span>
          </span>
          {expandable ? (
            <ChevronDown className={cn('size-3.5 shrink-0 text-[var(--as-muted-fg)] transition-transform', open && 'rotate-180')} aria-hidden />
          ) : null}
        </Header>
        {expandable && open ? (
          <div id={regionId} className="flex flex-col gap-2 border-t border-[var(--as-border)] px-2.5 py-2">
            {args ? (
              <div>
                <p className="mb-1 font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">{labels?.args ?? 'Arguments'}</p>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-[var(--as-radius-sm)] bg-[var(--as-surface-raised)] p-2 font-mono text-[11px] leading-relaxed">
                  {prettyJson(args)}
                </pre>
              </div>
            ) : null}
            {result || renderResult ? (
              <div>
                <p className="mb-1 font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">{labels?.result ?? 'Result'}</p>
                {renderResult ? (
                  renderResult(result ?? '')
                ) : (
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-[var(--as-radius-sm)] bg-[var(--as-surface-raised)] p-2 font-mono text-[11px] leading-relaxed">
                    {prettyJson(result ?? '')}
                  </pre>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  },
)
