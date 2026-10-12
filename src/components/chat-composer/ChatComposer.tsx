import * as React from 'react'
import { ArrowUp, Square } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { searchScore } from '../../lib/fuzzy'

export interface ChatComposerLabels {
  send: string
  stop: string
  placeholder: string
  ariaLabel: string
  dropFiles: string
  commands: string
}

export interface ChatComposerIcons {
  send: LucideIcon
  stop: LucideIcon
}

export interface ChatComposerCommand {
  id: string
  label: string
  hint?: string
  icon?: LucideIcon
}

export interface ChatComposerCommandToken {
  /** Draft offsets of the `trigger + query` token to replace on select. */
  start: number
  end: number
  /** Text typed after the trigger character. */
  query: string
}

export interface ChatComposerCommands {
  /** Palette trigger character — `/` for slash commands, `@` for mentions. Default `/`. */
  trigger?: string
  items: ChatComposerCommand[]
  /** Max visible entries. Default 8. */
  maxItems?: number
  /**
   * Fired when a command is selected (Enter/Tab/click). The app owns the
   * draft edit: replace `value.slice(token.start, token.end)` with the
   * insertion of its choice.
   */
  onSelect: (id: string, token: ChatComposerCommandToken) => void
}

export interface ChatComposerProps {
  value: string
  onValueChange: (value: string) => void
  /** Enter / Send — IME-safe (composition and keyCode 229 are ignored). */
  onSubmit: () => void
  /** A turn is in flight — renders the stop control when `onStop` is provided. Escape stops too. */
  sending?: boolean
  onStop?: () => void
  disabled?: boolean
  /**
   * Overrides the send button's blank-text guard. Apps that allow
   * attachment-only submits (health's image-only "what's what?" turn) pass
   * `true` while ready attachments exist; pass `false` to force-disable.
   * Default: the button enables only when `value.trim() !== ''`. The
   * Enter/form path is unaffected — the app's `onSubmit` stays the guard.
   */
  canSubmit?: boolean
  /**
   * Slash-command / mention palette: opens while the caret touches a
   * `trigger`-started word; ArrowUp/Down move, Enter/Tab select (never
   * submit while open), Escape dismisses. Fuzzy-filtered via `searchScore`.
   */
  commands?: ChatComposerCommands
  /**
   * Previously sent prompts (oldest → newest). ArrowUp on an empty draft
   * recalls the last one; ArrowDown walks back toward the empty draft.
   */
  history?: string[]
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

interface ActiveToken {
  start: number
  end: number
  query: string
}

function tokenAtCaret(value: string, caret: number, trigger: string): ActiveToken | null {
  const pos = Math.min(caret, value.length)
  let start = pos
  while (start > 0 && !/\s/.test(value[start - 1] ?? '')) {
    start -= 1
  }
  const text = value.slice(start, pos)
  if (!text.startsWith(trigger)) {
    return null
  }
  const query = text.slice(trigger.length)
  if (query.includes(trigger)) {
    return null
  }
  return { start, end: pos, query }
}

/**
 * The family chat input: auto-growing IME-safe textarea, send/stop
 * states, attachment/dictation/toolbar slots, drag-drop + paste file
 * wiring, a slash-command/mention palette (`commands`), Escape-to-stop
 * and ArrowUp prompt recall (`history`). Presentational + controlled;
 * transports stay app-side.
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
      canSubmit,
      commands,
      history,
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
    const [multiline, setMultiline] = React.useState(false)
    const multilineRef = React.useRef(false)
    const dragDepth = React.useRef(0)
    const prevSendingRef = React.useRef(sending)
    const [morphTarget, setMorphTarget] = React.useState<'send' | 'stop' | null>(null)
    if (prevSendingRef.current !== sending) {
      prevSendingRef.current = sending
      setMorphTarget(sending ? 'stop' : 'send')
    }
    const [caret, setCaret] = React.useState(0)
    const [paletteDismissed, setPaletteDismissed] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const [historyIndex, setHistoryIndex] = React.useState<number | null>(null)
    const paletteId = React.useId()

    const setTextarea = (element: HTMLTextAreaElement | null) => {
      internalTextareaRef.current = element
      if (typeof textareaRef === 'function') {
        textareaRef(element)
      } else if (textareaRef && typeof textareaRef === 'object') {
        ;(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element
      }
    }

    const syncCaret = () => {
      const element = internalTextareaRef.current
      if (element !== null) {
        setCaret(element.selectionStart ?? 0)
      }
    }

    React.useLayoutEffect(() => {
      const element = internalTextareaRef.current
      if (element === null) {
        return
      }
      const style = window.getComputedStyle(element)
      const lineHeight = Number.parseFloat(style.lineHeight) || 22
      const verticalPadding =
        (Number.parseFloat(style.paddingTop) || 0) + (Number.parseFloat(style.paddingBottom) || 0)
      // The JS cap must mirror the CSS box: a `max-h-*` class wins over
      // the maxRows fallback, otherwise overflowY and the real visible
      // cap disagree and lines clip silently.
      const cap = Number.parseFloat(style.maxHeight) || maxRows * 22
      element.style.height = 'auto'
      // scrollHeight rounds fractional line-heights down (22.75px at
      // text-sm/leading-relaxed), leaving the box ~1px short — the
      // caret then scrolls the hidden-overflow textarea and clips the
      // first line at the box top. The +1 absorbs the rounding; the
      // scrollTop reset guarantees the first line stays visible
      // whenever the whole content fits.
      const next =
        element.scrollHeight > 0 ? Math.min(Math.ceil(element.scrollHeight) + 1, cap) : 0
      element.style.height = next > 0 ? `${next}px` : 'auto'
      const overflowing = element.scrollHeight > element.clientHeight + 1
      element.style.overflowY = overflowing ? 'auto' : 'hidden'
      if (!overflowing && element.scrollTop !== 0) {
        element.scrollTop = 0
      }
      // Hysteresis: apps restyle this row off [data-multiline] (e.g.
      // footer-wrapping the toolbars under a full-width textarea), which
      // changes the textarea's width between the two states. A flag
      // re-measured at whichever width the previous decision produced
      // feeds back into itself and oscillates near the wrap threshold —
      // one keystroke wide, the next squeezed. Once multiline, stay
      // multiline until the draft clears.
      const grew = element.scrollHeight > lineHeight + verticalPadding + 1
      multilineRef.current = value === '' ? false : multilineRef.current || grew
      setMultiline(multilineRef.current)
    }, [value, maxRows])

    const trigger = commands?.trigger ?? '/'
    const token = React.useMemo(
      () => (commands === undefined ? null : tokenAtCaret(value, caret, trigger)),
      [commands, value, caret, trigger],
    )

    const paletteItems = React.useMemo(() => {
      if (commands === undefined || token === null) {
        return []
      }
      const max = commands.maxItems ?? 8
      return commands.items
        .map((item) => ({
          item,
          score: token.query === '' ? 0 : (searchScore(token.query, item.label) ?? searchScore(token.query, item.id)),
        }))
        .filter((entry) => entry.score !== null)
        .sort((a, b) => b.score! - a.score!)
        .slice(0, max)
        .map((entry) => entry.item)
    }, [commands, token])

    const paletteVisible =
      token !== null && paletteItems.length > 0 && !paletteDismissed && !disabled

    React.useEffect(() => {
      setPaletteDismissed(false)
      setActiveIndex(0)
    }, [token?.start, token?.query])

    React.useEffect(() => {
      if (value === '') {
        setHistoryIndex(null)
      }
    }, [value])

    const selectCommand = (command: ChatComposerCommand) => {
      if (token !== null) {
        commands?.onSelect(command.id, { start: token.start, end: token.end, query: token.query })
      }
      setPaletteDismissed(true)
      internalTextareaRef.current?.focus()
    }

    const submit = () => {
      if (disabled || sending) {
        return
      }
      onSubmit()
    }

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
      if (paletteVisible) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setActiveIndex((index) => (index + 1) % paletteItems.length)
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setActiveIndex((index) => (index - 1 + paletteItems.length) % paletteItems.length)
          return
        }
        if ((event.key === 'Enter' || event.key === 'Tab') && !isIMEComposition(event)) {
          event.preventDefault()
          selectCommand(paletteItems[activeIndex] ?? paletteItems[0]!)
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          setPaletteDismissed(true)
          return
        }
      } else if (event.key === 'Escape' && sending && onStop !== undefined) {
        event.preventDefault()
        onStop()
        return
      } else if (
        (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
        history !== undefined &&
        history.length > 0 &&
        (value === '' || historyIndex !== null)
      ) {
        event.preventDefault()
        if (event.key === 'ArrowUp') {
          const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
          setHistoryIndex(next)
          onValueChange(history[next] ?? '')
          setCaret((history[next] ?? '').length)
        } else if (historyIndex !== null) {
          const next = historyIndex + 1
          if (next >= history.length) {
            setHistoryIndex(null)
            onValueChange('')
            setCaret(0)
          } else {
            setHistoryIndex(next)
            onValueChange(history[next] ?? '')
            setCaret((history[next] ?? '').length)
          }
        }
        return
      }
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
    const submitBlocked =
      disabled || sending || (canSubmit === undefined ? value.trim() === '' : !canSubmit)

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
        {suggestions ? <div className="as-anim-slide-up flex flex-wrap gap-1.5">{suggestions}</div> : null}
        {attachments ? <div className="as-anim-slide-up flex flex-wrap gap-1.5">{attachments}</div> : null}
        <div
          data-as="chat-composer-row"
          data-multiline={multiline || undefined}
          data-dragging={dragging || undefined}
          className={cn(
            'relative flex items-end gap-1.5 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5',
            dragging && 'border-dashed border-[var(--as-primary)] bg-[var(--as-primary)]/5',
            disabled && 'opacity-50',
          )}
        >
          {paletteVisible ? (
            <div
              id={paletteId}
              role="listbox"
              aria-label={labels?.commands ?? 'Commands'}
              data-as="chat-composer-commands"
              className="as-anim-slide-up absolute bottom-full left-0 right-0 z-[var(--as-z-popover)] mb-1.5 max-h-56 overflow-y-auto rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-1 shadow-[var(--as-shadow-pop)]"
            >
              {paletteItems.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  id={`${paletteId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectCommand(item)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-[var(--as-radius-sm)] px-2 py-1.5 text-left text-sm transition-colors',
                    index === activeIndex
                      ? 'bg-[var(--as-secondary)] text-[var(--as-secondary-fg)]'
                      : 'text-[var(--as-fg)]',
                  )}
                >
                  {item.icon ? <item.icon className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden /> : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint ? <span className="shrink-0 text-xs text-[var(--as-muted-fg)]">{item.hint}</span> : null}
                </button>
              ))}
            </div>
          ) : null}
          {toolbarStart ? <div className="flex shrink-0 items-center gap-0.5 pb-0.5">{toolbarStart}</div> : null}
          <textarea
            ref={setTextarea}
            value={value}
            rows={1}
            disabled={disabled}
            placeholder={placeholder ?? labels?.placeholder ?? 'Send a message…'}
            aria-label={ariaLabel ?? labels?.ariaLabel ?? 'Message'}
            aria-controls={paletteVisible ? paletteId : undefined}
            aria-activedescendant={
              paletteVisible ? `${paletteId}-option-${activeIndex}` : undefined
            }
            aria-autocomplete={commands !== undefined ? 'list' : undefined}
            onChange={(event) => {
              const next = event.target.value
              if (historyIndex !== null && history?.[historyIndex] !== next) {
                setHistoryIndex(null)
              }
              onValueChange(next)
              syncCaret()
            }}
            onKeyDown={onKeyDown}
            onKeyUp={syncCaret}
            onClick={syncCaret}
            onSelect={syncCaret}
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
              className={cn(
                'mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                morphTarget === 'stop' && 'as-anim-morph-in',
              )}
            >
              <StopIcon className="size-3.5" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              aria-label={labels?.send ?? 'Send message'}
              title={labels?.send ?? 'Send message'}
              disabled={submitBlocked}
              className={cn(
                'mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--as-primary)] text-[var(--as-primary-fg)] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                morphTarget === 'send' && 'as-anim-morph-in',
              )}
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
