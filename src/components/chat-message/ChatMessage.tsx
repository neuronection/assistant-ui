import * as React from 'react'
import { Copy, Pencil, RotateCcw, TriangleAlert } from 'lucide-react'
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
  onEdit?: () => void
  onRegenerate?: () => void
  onRetry?: () => void
  /** Extra icon actions (app-specific). */
  extras?: ChatMessageAction[]
}

export interface ChatMessageLabels {
  copy: string
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
  labels?: Partial<ChatMessageLabels & ChatMessageEditorLabels & MessageVariantSwitcherLabels>
  compact?: boolean
  className?: string
}

const actionButtonClass =
  'rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-surface-raised)] hover:text-[var(--as-fg)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

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
        className={cn('group/message flex w-full flex-col', isUser ? 'items-end' : 'items-start', className)}
      >
        {attachments ? <div className="mb-1.5 flex w-full flex-wrap justify-end gap-1.5">{attachments}</div> : null}
        <div
          className={cn(
            'relative flex max-w-[92%] flex-col gap-1.5 rounded-[var(--as-radius-lg)] px-3 py-2 text-sm',
            compact && 'px-2.5 py-1.5',
            isUser
              ? 'rounded-br-[var(--as-radius-sm)] bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
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
            <div className="min-w-0">{content}</div>
          )}
          {status === 'interrupted' ? (
            <span className="self-start rounded-full bg-[var(--as-warning)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--as-warning)]">
              {labels?.interrupted ?? 'Stopped'}
            </span>
          ) : null}
          {status === 'error' && error ? (
            <div
              role="alert"
              className="flex flex-col gap-1 rounded-[var(--as-radius)] border border-[var(--as-danger)]/40 bg-[var(--as-danger)]/10 px-2.5 py-1.5 text-xs text-[var(--as-danger)]"
            >
              <span className="font-mono font-semibold uppercase tracking-wide">{error.code}</span>
              <span className="whitespace-pre-wrap break-words">{error.message}</span>
              {error.retryable && actions?.onRetry ? (
                <Button variant="outline" size="sm" className="self-start" onClick={actions.onRetry}>
                  {labels?.retry ?? 'Retry'}
                </Button>
              ) : null}
            </div>
          ) : null}
          {chips ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null}
          {children ? <div className="flex flex-col gap-1.5">{children}</div> : null}
          {showActions && !editing ? (
            <div
              className={cn(
                'absolute top-1 flex items-center gap-0.5 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] p-0.5 opacity-0 shadow-[var(--as-shadow-1)] transition-opacity focus-within:opacity-100 group-hover/message:opacity-100',
                isUser ? '-left-9' : '-right-9',
              )}
            >
              {actions?.onCopy ? (
                <button type="button" className={actionButtonClass} aria-label={labels?.copy ?? 'Copy'} title={labels?.copy ?? 'Copy'} onClick={actions.onCopy}>
                  <Copy className="size-3.5" aria-hidden />
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
        {meta ? <div className="mt-0.5 flex flex-wrap items-center gap-1.5 px-1 text-[10px] text-[var(--as-muted-fg)]">{meta}</div> : null}
        {variants && variants.count > 1 && onSelectVariant ? (
          <MessageVariantSwitcher variants={variants} onSelect={onSelectVariant} labels={switcherLabels} className="mt-0.5 px-1" />
        ) : null}
      </div>
    )
  },
)
