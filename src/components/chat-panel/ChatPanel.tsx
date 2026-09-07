import * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatPanelVariant = 'page' | 'sidebar' | 'bubble'

export interface ChatPanelProps {
  /** Layout tier: full page (full-bleed shell, centered conversation column), sidebar (dense column), bubble (compact widget body). */
  variant: ChatPanelVariant
  /** Header row: title node + action nodes (session list, branch tree, expand, close). */
  title?: React.ReactNode
  actions?: React.ReactNode
  /** Status strip under the header (connection warnings, context summary). */
  banner?: React.ReactNode
  /** Usually `<ChatTranscript …/>`. */
  transcript: React.ReactNode
  /** Usually `<ChatComposer …/>`. */
  composer?: React.ReactNode
  /** Disclaimer row under the composer (health guidance, etc.). */
  footer?: React.ReactNode
  className?: string
}

/**
 * The composed chat host — the one uniform surface assembly behind the
 * family's three shapes (full page / sidepanel / bubble). Owns layout
 * only; transcript, composer and every feature slot stay app-composed
 * (ADR-006 tier 3, `RichTextEditor` precedent).
 */
export const ChatPanel = React.forwardRef<HTMLDivElement, ChatPanelProps>(
  function ChatPanel({ variant, title, actions, banner, transcript, composer, footer, className }, ref) {
    return (
      <div
        ref={ref}
        data-as="chat-panel"
        data-variant={variant}
        className={cn(
          'flex h-full min-h-0 w-full flex-col bg-[var(--as-surface)] text-[var(--as-fg)]',
          variant === 'bubble' && 'overflow-hidden',
          className,
        )}
      >
        {title !== undefined || actions !== undefined ? (
          <header className="flex shrink-0 items-center gap-2 border-b border-[var(--as-border)] px-3 py-2">
            <div className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</div>
            {actions ? <div className="flex shrink-0 items-center gap-0.5">{actions}</div> : null}
          </header>
        ) : null}
        {banner ? (
          <div data-as="chat-panel-banner" className="shrink-0 px-3 py-1.5 text-xs text-[var(--as-muted-fg)]">
            {banner}
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col',
              variant === 'page' && 'mx-auto max-w-3xl',
            )}
          >
            {transcript}
          </div>
        </div>
        {composer ? (
          <div className="shrink-0 border-t border-[var(--as-border)] p-2">
            <div className={cn(variant === 'page' && 'mx-auto w-full max-w-3xl')}>{composer}</div>
          </div>
        ) : null}
        {footer ? (
          <div className="shrink-0 px-3 pb-2 pt-1 text-center text-[10px] text-[var(--as-muted-fg)]">{footer}</div>
        ) : null}
      </div>
    )
  },
)
