import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CopyButtonProps
  extends Omit<React.ComponentProps<'button'>, 'value' | 'children'> {
  value: string
  label?: string
  size?: number
  hideWhenEmpty?: boolean
  copiedDuration?: number
  onCopied?: () => void
  onCopyError?: (error: unknown) => void
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

export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      value,
      label = 'Copy',
      size = 14,
      hideWhenEmpty = true,
      copiedDuration = 1500,
      onCopied,
      onCopyError,
      className,
      onClick,
      ...props
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

    if (hideWhenEmpty && !value) return null

    const Icon = copied ? Check : Copy

    return (
      <button
        ref={ref}
        type="button"
        data-as="copy-button"
        data-copied={copied || undefined}
        aria-label={label}
        title={label}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || !value) return
          event.preventDefault()
          event.stopPropagation()
          writeClipboard(value).then(
            () => {
              setCopied(true)
              if (timer.current) clearTimeout(timer.current)
              timer.current = setTimeout(() => setCopied(false), copiedDuration)
              onCopied?.()
            },
            (error) => {
              onCopyError?.(error)
            },
          )
        }}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-[var(--as-radius-sm)] p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
          copied && 'text-[var(--as-success)] hover:text-[var(--as-success)]',
          className,
        )}
        {...props}
      >
        <Icon style={{ width: size, height: size }} aria-hidden />
      </button>
    )
  },
)
