import * as React from 'react'
import { cn } from '../../lib/utils'
import { Modal, ModalContent, ModalTitle } from '../modal'
import {
  CommandList,
  type CommandListProps,
} from '../command-list'

export interface CommandPaletteProps extends CommandListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ariaLabel?: string
  closeLabel?: string
}

export const CommandPalette = React.forwardRef<HTMLInputElement, CommandPaletteProps>(
  function CommandPalette(
    {
      open,
      onOpenChange,
      query,
      onQueryChange,
      groups,
      onSelect,
      labels,
      activeId,
      onActiveIdChange,
      tabBehavior = 'focus',
      ariaLabel = 'Command palette',
      closeLabel = 'Close',
      className,
    },
    ref,
  ) {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const previouslyFocusedRef = React.useRef<HTMLElement | null>(null)
    const restoreTimerRef = React.useRef<number | null>(null)
    const composingRef = React.useRef(false)

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    React.useEffect(
      () => () => {
        if (restoreTimerRef.current !== null) {
          window.clearTimeout(restoreTimerRef.current)
        }
      },
      [],
    )

    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent
          size="lg"
          padding="none"
          closeLabel={closeLabel}
          aria-describedby={undefined}
          className="overflow-hidden"
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={() => {
            composingRef.current = false
          }}
          onEscapeKeyDown={(event) => {
            if (composingRef.current || event.isComposing || event.keyCode === 229) {
              event.preventDefault()
            }
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            if (restoreTimerRef.current !== null) {
              window.clearTimeout(restoreTimerRef.current)
              restoreTimerRef.current = null
            }
            const active = document.activeElement
            if (active instanceof HTMLElement && active !== document.body) {
              previouslyFocusedRef.current = active
            }
            inputRef.current?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const target = previouslyFocusedRef.current
            previouslyFocusedRef.current = null
            if (target) {
              restoreTimerRef.current = window.setTimeout(() => {
                restoreTimerRef.current = null
                target.focus({ preventScroll: true })
              }, 0)
            }
          }}
        >
          <ModalTitle className="sr-only">{ariaLabel}</ModalTitle>
          <div
            data-as="command-palette"
            className={cn(
              'flex min-h-0 flex-col [&_[data-as=command-list-search]]:pr-12',
              className,
            )}
          >
            <CommandList
              ref={setRefs}
              query={query}
              onQueryChange={onQueryChange}
              groups={groups}
              labels={labels}
              activeId={activeId}
              onActiveIdChange={onActiveIdChange}
              tabBehavior={tabBehavior}
              onSelect={(item, context) => {
                onSelect(item, context)
                onOpenChange(false)
              }}
            />
          </div>
        </ModalContent>
      </Modal>
    )
  },
)
