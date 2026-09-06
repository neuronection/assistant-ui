import * as React from 'react'
import { ArrowUp, Square } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface ChatComposerLabels {
  send: string
  stop: string
  placeholder: string
  ariaLabel: string
  dropFiles: string
}

export interface ChatComposerIcons {
  send: LucideIcon
  stop: LucideIcon
}

export interface ChatComposerProps {
  value: string
  onValueChange: (value: string) => void
  /** Enter / Send — IME-safe (composition and keyCode 229 are ignored). */
  onSubmit: () => void
  /** A turn is in flight — renders the stop control when `onStop` is provided. */
  sending?: boolean
  onStop?: () => void
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
  /** Auto-grow cap before the textarea scrolls. Default 8. */
  maxRows?: number
  /** Leading slot inside the input row (attach menu, equation, draw…). */
  toolbarStart?: React.ReactNode
  /** Trailing slot inside the input row (dictation, tools…). */
  toolbarEnd?: React.ReactNode
  /** Attachment rail above the input (usually `FileQueue` / chips). */
  attachments?: React.ReactNode
  /** Suggestion chips / context strip above everything. */
  suggestions?: React.ReactNode
  /** Drag-drop + paste wiring for file attachments. */
  onAttachFiles?: (files: File[]) => void
  labels?: Partial<ChatComposerLabels>
  icons?: Partial<ChatComposerIcons>
  textareaRef?: React.Ref<HTMLTextAreaElement>
  className?: string
}

function isIMEComposition(event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229
}

/**
 * The family chat input: auto-growing IME-safe textarea, send/stop
 * states, attachment/dictation/toolbar slots, drag-drop + paste file
 * wiring. Presentational + controlled; transports stay app-side.
 */
export const ChatComposer = React.forwardRef<HTMLFormElement, ChatComposerProps>(
  function ChatComposer(
    {
      value,
      onValueChange,
      onSubmit,
      sending = false,
      onStop,
      disabled = false,
      placeholder,
      ariaLabel,
      maxRows = 8,
      toolbarStart,
      toolbarEnd,
      attachments,
      suggestions,
      onAttachFiles,
      labels,
      icons,
      textareaRef,
      className,
    },
    ref,
  ) {
    const internalTextareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [dragging, setDragging] = React.useState(false)
    const dragDepth = React.useRef(0)

    const setTextarea = (element: HTMLTextAreaElement | null) => {
      internalTextareaRef.current = element
      if (typeof textareaRef === 'function') {
        textareaRef(element)
      } else if (textareaRef && typeof textareaRef === 'object') {
        ;(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element
      }
    }

    React.useLayoutEffect(() => {
      const element = internalTextareaRef.current
      if (element === null) {
        return
      }
      element.style.height = 'auto'
      const cap = maxRows * 22
      element.style.height = element.scrollHeight > 0 ? `${Math.min(element.scrollHeight, cap)}px` : 'auto'
      element.style.overflowY = element.scrollHeight > cap ? 'auto' : 'hidden'
    }, [value, maxRows])

    const submit = () => {
      if (disabled || sending) {
        return
      }
      onSubmit()
    }

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return
      }
      if (isIMEComposition(event)) {
        return
      }
      event.preventDefault()
      submit()
    }

    const emitFiles = (fileList: FileList | null | undefined) => {
      const files = fileList ? Array.from(fileList) : []
      if (files.length > 0) {
        onAttachFiles?.(files)
      }
    }

    const dragCounterHandlers = {
      onDragEnter: (event: React.DragEvent) => {
        if (onAttachFiles === undefined || !event.dataTransfer.types.includes('Files')) {
          return
        }
        event.preventDefault()
        dragDepth.current += 1
        setDragging(true)
      },
      onDragOver: (event: React.DragEvent) => {
        if (onAttachFiles === undefined || !event.dataTransfer.types.includes('Files')) {
          return
        }
        event.preventDefault()
      },
      onDragLeave: () => {
        if (dragDepth.current > 0) {
          dragDepth.current -= 1
          if (dragDepth.current === 0) {
            setDragging(false)
          }
        }
      },
      onDrop: (event: React.DragEvent) => {
        if (onAttachFiles === undefined) {
          return
        }
        event.preventDefault()
        dragDepth.current = 0
        setDragging(false)
        emitFiles(event.dataTransfer.files)
      },
    }

    const SendIcon = icons?.send ?? ArrowUp
    const StopIcon = icons?.stop ?? Square
    const showStop = sending && onStop !== undefined

    return (
      <form
        ref={ref}
        data-as="chat-composer"
        data-sending={sending}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className={cn('flex w-full flex-col gap-2', className)}
        {...dragCounterHandlers}
      >
        {suggestions ? <div className="flex flex-wrap gap-1.5">{suggestions}</div> : null}
        {attachments ? <div className="flex flex-wrap gap-1.5">{attachments}</div> : null}
        <div
          data-dragging={dragging || undefined}
          className={cn(
            'flex items-end gap-1.5 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 transition-colors focus-within:border-[var(--as-primary)]',
            dragging && 'border-dashed border-[var(--as-primary)] bg-[var(--as-primary)]/5',
            disabled && 'opacity-50',
          )}
        >
          {toolbarStart ? <div className="flex shrink-0 items-center gap-0.5 pb-0.5">{toolbarStart}</div> : null}
          <textarea
            ref={setTextarea}
            value={value}
            rows={1}
            disabled={disabled}
            placeholder={placeholder ?? labels?.placeholder ?? 'Send a message…'}
            aria-label={ariaLabel ?? labels?.ariaLabel ?? 'Message'}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={onKeyDown}
            onPaste={(event) => emitFiles(event.clipboardData.files)}
            className="max-h-40 min-h-[1.5rem] w-full flex-1 resize-none bg-transparent px-1 py-1 text-sm leading-relaxed text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-none disabled:cursor-not-allowed"
          />
          {toolbarEnd ? <div className="flex shrink-0 items-center gap-0.5 pb-0.5">{toolbarEnd}</div> : null}
          {showStop ? (
            <button
              type="button"
              aria-label={labels?.stop ?? 'Stop generating'}
              title={labels?.stop ?? 'Stop generating'}
              onClick={onStop}
              className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <StopIcon className="size-3.5" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              aria-label={labels?.send ?? 'Send message'}
              title={labels?.send ?? 'Send message'}
              disabled={disabled || value.trim() === '' || sending}
              className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--as-primary)] text-[var(--as-primary-fg)] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <SendIcon className="size-4" aria-hidden />
            </button>
          )}
        </div>
        {dragging && onAttachFiles ? (
          <p className="text-xs text-[var(--as-muted-fg)]" role="status">
            {labels?.dropFiles ?? 'Drop files to attach'}
          </p>
        ) : null}
      </form>
    )
  },
)
