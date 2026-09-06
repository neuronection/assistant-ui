import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { ChatMessageVariants } from '../chat-core/types'
import { cn } from '../../lib/utils'

export interface MessageVariantSwitcherLabels {
  group: string
  variantOf: (index: number, count: number) => string
  previous: string
  next: string
}

export interface MessageVariantSwitcherProps {
  variants: ChatMessageVariants
  /** Flip the parent's active-child pointer to the sibling id (family `select` endpoint). */
  onSelect: (messageId: string) => void
  labels?: Partial<MessageVariantSwitcherLabels>
  className?: string
}

/**
 * The `‹ n/N ›` sibling-variant switcher under a branched message
 * (study's inline switcher, family branching contract).
 */
export const MessageVariantSwitcher = React.forwardRef<HTMLDivElement, MessageVariantSwitcherProps>(
  function MessageVariantSwitcher({ variants, onSelect, labels, className }, ref) {
    const { index, count, siblingIds } = variants
    const previousId = index > 1 ? siblingIds[index - 2] : undefined
    const nextId = index < count ? siblingIds[index] : undefined

    const select = (event: React.MouseEvent<HTMLButtonElement>, messageId: string | undefined) => {
      event.stopPropagation()
      if (messageId !== undefined) {
        onSelect(messageId)
      }
    }

    return (
      <div
        ref={ref}
        role="group"
        aria-label={labels?.group ?? 'Message variants'}
        data-as="message-variant-switcher"
        className={cn('flex items-center gap-0.5 text-xs text-[var(--as-muted-fg)]', className)}
      >
        <button
          type="button"
          disabled={previousId === undefined}
          aria-label={labels?.previous ?? 'Previous variant'}
          title={labels?.previous ?? 'Previous variant'}
          onClick={(event) => select(event, previousId)}
          className="rounded-[var(--as-radius-sm)] p-0.5 transition-colors hover:bg-[var(--as-surface-raised)] hover:text-[var(--as-fg)] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
        </button>
        <span className="tabular-nums" title={labels?.variantOf?.(index, count) ?? `Variant ${index} of ${count}`}>
          {index}/{count}
        </span>
        <button
          type="button"
          disabled={nextId === undefined}
          aria-label={labels?.next ?? 'Next variant'}
          title={labels?.next ?? 'Next variant'}
          onClick={(event) => select(event, nextId)}
          className="rounded-[var(--as-radius-sm)] p-0.5 transition-colors hover:bg-[var(--as-surface-raised)] hover:text-[var(--as-fg)] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <ChevronRight className="size-3.5" aria-hidden />
        </button>
      </div>
    )
  },
)
