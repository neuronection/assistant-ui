import * as React from 'react'

import { cn } from '../../lib/utils'
import { Button } from '../button/Button'

export interface ChatMessageEditorLabels {
  save: string
  cancel: string
  ariaLabel: string
}

export interface ChatMessageEditorProps {
  value: string
  onValueChange: (value: string) => void
  /** Save & resend — branches the tree (family `edit` endpoint) and reruns the turn. */
  onSubmit: () => void
  onCancel: () => void
  submitDisabled?: boolean
  rows?: number
  labels?: Partial<ChatMessageEditorLabels>
  className?: string
}

/**
 * Inline user-prompt editor for the edit-and-resend flow (study pattern):
 * controlled textarea, Cmd/Ctrl+Enter saves, Escape cancels.
 */
export const ChatMessageEditor = React.forwardRef<HTMLDivElement, ChatMessageEditorProps>(
  function ChatMessageEditor(
    { value, onValueChange, onSubmit, onCancel, submitDisabled = false, rows = 3, labels, className },
    ref,
  ) {
    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        if (!submitDisabled) {
          onSubmit()
        }
      }
    }

    return (
      <div ref={ref} data-as="chat-message-editor" className={cn('flex w-full flex-col gap-2', className)}>
        <textarea
          value={value}
          rows={rows}
          aria-label={labels?.ariaLabel ?? 'Edit message'}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="w-full resize-y rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        />
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {labels?.cancel ?? 'Cancel'}
          </Button>
          <Button size="sm" disabled={submitDisabled} onClick={onSubmit}>
            {labels?.save ?? 'Save & resend'}
          </Button>
        </div>
      </div>
    )
  },
)
