import * as React from 'react'
import { Check, Copy, Pencil, RotateCcw, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import type { ChatError, ChatMessageVariants, ChatRole } from '../chat-core/types'
import { ChatMessageEditor, type ChatMessageEditorLabels } from './ChatMessageEditor'
import { MessageVariantSwitcher, type MessageVariantSwitcherLabels } from './MessageVariantSwitcher'

export interface ChatMessageAction {
  key: string
  label: string
  icon?: LucideIcon
  onClick: () => void
  danger?: boolean
}

export interface ChatMessageActions {
  onCopy?: () => void
  /**
   * Controlled copied feedback for the copy action (check morph).
   * Uncontrolled by default: the library shows the check for 1.5 s
   * after each copy click.
   */
  copied?: boolean
  onEdit?: () => void
  onRegenerate?: () => void
  onRetry?: () => void
  /** Extra icon actions (app-specific). */
  extras?: ChatMessageAction[]
  /**
   * Extra node rendered inside the error card next to the Retry button —
   * e.g. an "Open AI settings" link when the error is a not-configured
   * failure. Rendered only while the error card is visible.
   */
  errorExtra?: React.ReactNode
}

export interface ChatMessageLabels {
  copy: string
  copied: string
  edit: string
  regenerate: string
  retry: string
  interrupted: string
  error: string
}

export interface ChatMessageProps {
  role: ChatRole
  /** Usually a `MarkdownSurface`; any node graph renders here. */
  content: React.ReactNode
  /** Thinking block slot (usually `ChatReasoning`). */
  reasoning?: React.ReactNode
  /** Tool cards / HITL cards below the content. */
  children?: React.ReactNode
  status?: 'streaming' | 'done' | 'error' | 'interrupted'
  error?: ChatError
  actions?: ChatMessageActions
  /** Edit-and-resend mode for user messages (renders `ChatMessageEditor`). */
  editing?: false | { value: string; onValueChange: (value: string) => void; onSubmit: () => void; onCancel: () => void; submitDisabled?: boolean }
  variants?: ChatMessageVariants
  onSelectVariant?: (messageId: string) => void
  /** Badge row (model, latency, tokens — app-defined). */
  meta?: React.ReactNode
  /** Deep-link chip row (career references, health citations). */
  chips?: React.ReactNode
  /** Attachment rail above the content. */
  attachments?: React.ReactNode
  /** Leading identity node beside the bubble (user: trailing). Render group-start avatars only when grouping transcripts. */
  avatar?: React.ReactNode
  /**
   * Visual design: `bubbles` (default) — paired role bubbles; `flat` —
   * assistant content renders as prose on the panel surface (user keeps
   * its bubble). Reasoning/tool cards are unaffected.
   */
  design?: 'bubbles' | 'flat'
  labels?: Partial<ChatMessageLabels & ChatMessageEditorLabels & MessageVariantSwitcherLabels>
  compact?: boolean
  className?: string
}

const actionButtonClass =
  'rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-surface-raised)] hover:text-[var(--as-fg)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

const COPIED_FEEDBACK_MS = 1500

/**
 * The family chat bubble: role-aligned, hover action row (copy / edit /
 * regenerate + app extras), variant switcher under branched messages,
 * reasoning and below-content slots, inline edit-and-resend, error +
 * interrupted states. Presentational — state lives app-side.
 */
export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  function ChatMessage(
    {
      role,
      content,
      reasoning,
      children,
      status = 'done',
      error,
      actions,
      editing = false,
      variants,
      onSelectVariant,
      meta,
      chips,
      attachments,
      avatar,
      design = 'bubbles',
      labels,
      compact = false,
      className,
    },
    ref,
  ) {
    const isUser = role === 'user'
    const isSystem = role === 'system'
    const showActions =
      actions !== undefined && (actions.onCopy !== undefined || actions.onEdit !== undefined || actions.onRegenerate !== undefined || (actions.extras?.length ?? 0) > 0)
    const editorLabels = { save: labels?.save, cancel: labels?.cancel, ariaLabel: labels?.ariaLabel }
    const switcherLabels = { group: labels?.group, variantOf: labels?.variantOf, previous: labels?.previous, next: labels?.next }
    const [copiedAt, setCopiedAt] = React.useState<number | null>(null)
    const copied = actions?.copied ?? copiedAt !== null

    React.useEffect(() => {
      if (copiedAt === null) {
        return
      }
      const id = window.setTimeout(() => setCopiedAt(null), COPIED_FEEDBACK_MS)
      return () => window.clearTimeout(id)
    }, [copiedAt])

    const onCopyClick = () => {
      actions?.onCopy?.()
      if (actions?.copied === undefined) {
        setCopiedAt(Date.now())
      }
    }

    if (isSystem) {
      return (
        <div
          ref={ref}
          data-as="chat-message"
          data-role={role}
          className={cn('flex justify-center', className)}
        >
          <div className="rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-1 text-xs text-[var(--as-muted-fg)]">
            {content}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        data-as="chat-message"
        data-role={role}
        data-status={status}
        data-design={design}
        className={cn('as-anim-message-in group/message flex w-full flex-col', isUser ? 'items-end' : 'items-start', className)}
      >
        {attachments ? <div className="mb-1.5 flex w-full flex-wrap justify-end gap-1.5">{attachments}</div> : null}
        {(() => {
          const bubble = (
            <div
              className={cn(
                'relative flex max-w-[92%] flex-col gap-1.5 rounded-[var(--as-radius)] px-3 py-2 text-sm',
                compact && 'px-2.5 py-1.5',
                isUser
                  ? 'rounded-br-[var(--as-radius-sm)] bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
                  : design === 'flat'
                    ? 'max-w-full rounded-bl-[var(--as-radius-sm)] bg-transparent px-0 py-0'
                    : 'rounded-bl-[var(--as-radius-sm)] bg-[var(--as-muted)] text-[var(--as-fg)]',
              )}
            >
              {reasoning ? <div className="not-prose">{reasoning}</div> : null}
              {editing ? (
                <ChatMessageEditor
                  value={editing.value}
                  onValueChange={editing.onValueChange}
                  onSubmit={editing.onSubmit}
                  onCancel={editing.onCancel}
                  submitDisabled={editing.submitDisabled}
                  labels={editorLabels}
                />
              ) : (
                <div
                  key={variants && variants.count > 1 ? `variant-${variants.index}` : undefined}
                  className={cn('min-w-0', variants && variants.count > 1 && 'as-anim-fade-swap')}
                >
                  {content}
                </div>
              )}
              {status === 'interrupted' ? (
                <span className="as-anim-slide-up as-anim-pulse-once [--as-pulse-color:var(--as-warning)] self-start rounded-full bg-[var(--as-warning)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--as-warning)]">
                  {labels?.interrupted ?? 'Stopped'}
                </span>
              ) : null}
              {status === 'error' && error ? (
                <div
                  role="alert"
                  className="as-anim-slide-up flex flex-col gap-1 rounded-[var(--as-radius)] border border-[var(--as-danger)]/40 bg-[var(--as-danger)]/10 px-2.5 py-1.5 text-xs text-[var(--as-danger)]"
                >
                  <span className="font-mono font-semibold uppercase tracking-wide">{error.code}</span>
                  <span className="whitespace-pre-wrap break-words">{error.message}</span>
                  {error.retryable && actions?.onRetry ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button variant="outline" size="sm" className="self-start" onClick={actions.onRetry}>
                        {labels?.retry ?? 'Retry'}
                      </Button>
                      {actions?.errorExtra}
                    </div>
                  ) : actions?.errorExtra ? (
                    <div className="self-start">{actions.errorExtra}</div>
                  ) : null}
                </div>
              ) : null}
              {chips ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null}
              {children ? <div className="flex flex-col gap-1.5">{children}</div> : null}
              {showActions && !editing ? (
                <div
                  data-as="chat-message-actions"
                  className={cn(
                    'absolute top-1 flex items-center gap-0.5 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] p-0.5 shadow-[var(--as-shadow-1)]',
                    isUser ? '-left-9' : '-right-9',
                  )}
                >
                  {actions?.onCopy ? (
                    <button
                      type="button"
                      className={actionButtonClass}
                      aria-label={copied ? (labels?.copied ?? 'Copied') : (labels?.copy ?? 'Copy')}
                      title={copied ? (labels?.copied ?? 'Copied') : (labels?.copy ?? 'Copy')}
                      onClick={onCopyClick}
                    >
                      {copied ? (
                        <Check className="as-anim-fade-swap size-3.5 text-[var(--as-success)]" aria-hidden />
                      ) : (
                        <Copy className="size-3.5" aria-hidden />
                      )}
                    </button>
                  ) : null}
                  {actions?.onEdit ? (
                    <button type="button" className={actionButtonClass} aria-label={labels?.edit ?? 'Edit'} title={labels?.edit ?? 'Edit'} onClick={actions.onEdit}>
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                  {actions?.onRegenerate ? (
                    <button type="button" className={actionButtonClass} aria-label={labels?.regenerate ?? 'Regenerate'} title={labels?.regenerate ?? 'Regenerate'} onClick={actions.onRegenerate}>
                      <RotateCcw className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                  {actions?.extras?.map((extra) => (
                    <button
                      key={extra.key}
                      type="button"
                      className={cn(actionButtonClass, extra.danger && 'hover:text-[var(--as-danger)]')}
                      aria-label={extra.label}
                      title={extra.label}
                      onClick={extra.onClick}
                    >
                      {extra.icon ? <extra.icon className="size-3.5" aria-hidden /> : <TriangleAlert className="size-3.5" aria-hidden />}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
          return avatar !== undefined ? (
            <div className={cn('flex w-full items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
              <div data-as="chat-message-avatar" className="shrink-0 pb-1">
                {avatar}
              </div>
              {bubble}
            </div>
          ) : (
            bubble
          )
        })()}
        {meta ? <div className="mt-0.5 flex flex-wrap items-center gap-1.5 px-1 text-[10px] text-[var(--as-muted-fg)]">{meta}</div> : null}
        {variants && variants.count > 1 && onSelectVariant ? (
          <MessageVariantSwitcher variants={variants} onSelect={onSelectVariant} labels={switcherLabels} className="mt-0.5 px-1" />
        ) : null}
      </div>
    )
  },
)
