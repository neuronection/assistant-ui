import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ErrorBannerProps {
  message: string | null | undefined
  action?: React.ReactNode
  className?: string
}

export function ErrorBanner({ message, action, className }: ErrorBannerProps) {
  if (!message) {
    return null
  }
  return (
    <div
      role="alert"
      data-as="error-banner"
      className={cn(
        'flex items-center gap-3 rounded-[var(--as-radius)] border border-[var(--as-danger)]/40 bg-[var(--as-danger)]/10 px-3 py-2 text-xs text-[var(--as-danger)]',
        className,
      )}
    >
      <span className="min-w-0 flex-1">{message}</span>
      {action ?? null}
    </div>
  )
}
