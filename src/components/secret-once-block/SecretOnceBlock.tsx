import * as React from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'

import { cn } from '../../lib/utils'

const COPIED_DURATION = 1500

export interface SecretOnceBlockProps {
  secret: string
  warning: string
  copyLabel?: string
  copiedLabel?: string
  onCopied?: () => void
  testId?: string
  className?: string
}

function writeClipboard(value: string): Promise<void> {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(value)
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Presentational secret-once body (plan 60 D5): the shown-once value in a
 * breaking monospace block, the host's warning copy and a real copy button
 * with transient copied feedback. Modal chrome, secret minting and storage
 * stay app-side.
 */
export const SecretOnceBlock = React.forwardRef<HTMLDivElement, SecretOnceBlockProps>(
  function SecretOnceBlock(
    {
      secret,
      warning,
      copyLabel = 'Copy',
      copiedLabel = 'Copied',
      onCopied,
      testId,
      className,
    },
    ref,
  ) {
    const [copied, setCopied] = React.useState(false)
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current)
      },
      [],
    )

    const handleCopy = () => {
      writeClipboard(secret).then(
        () => {
          setCopied(true)
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), COPIED_DURATION)
          onCopied?.()
        },
        () => {},
      )
    }

    const Icon = copied ? Check : Copy

    return (
      <div
        ref={ref}
        data-as="secret-once-block"
        data-testid={testId}
        data-copied={copied || undefined}
        className={cn('flex w-full flex-col gap-2', className)}
      >
        <code
          data-as="secret-once-value"
          className="block max-h-40 overflow-auto break-all rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-muted)] px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[var(--as-fg)]"
        >
          {secret}
        </code>
        <div className="flex items-start gap-1.5 text-xs text-[var(--as-fg)]">
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0 text-[var(--as-warning)]"
            aria-hidden
          />
          <p data-as="secret-once-warning" className="m-0 min-w-0 flex-1">
            {warning}
          </p>
        </div>
        <div>
          <button
            type="button"
            data-as="secret-once-copy"
            onClick={handleCopy}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2 py-1 text-xs font-medium text-[var(--as-fg)] transition-colors hover:bg-[var(--as-muted)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
              copied && 'text-[var(--as-success)] hover:text-[var(--as-success)]',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
        </div>
      </div>
    )
  },
)
