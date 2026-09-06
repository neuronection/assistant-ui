import * as React from 'react'

import { cn } from '../../lib/utils'
import { CopyButton } from '../copy-button/CopyButton'

export interface MarkdownCodeBlockLabels {
  copy: string
  code: string
}

export interface MarkdownCodeBlockProps {
  code: string
  language?: string
  showLanguage?: boolean
  labels?: Partial<MarkdownCodeBlockLabels>
  className?: string
}

/**
 * Standalone fenced-code surface: mono block, optional language tag, hover
 * copy. Plain by design — no highlighting engine bundled (apps may wrap or
 * slot their own renderer through `MarkdownSurface.components`).
 */
export const MarkdownCodeBlock = React.forwardRef<HTMLDivElement, MarkdownCodeBlockProps>(
  function MarkdownCodeBlock({ code, language, showLanguage = true, labels, className }, ref) {
    const copyLabel = labels?.copy ?? 'Copy code'
    const codeLabel = labels?.code ?? 'Code'
    return (
      <div
        ref={ref}
        data-as="markdown-code-block"
        className={cn(
          'group/code relative my-3 overflow-hidden rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)]',
          className,
        )}
      >
        {showLanguage && language ? (
          <div className="flex items-center justify-between border-b border-[var(--as-border)] px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
            <span>{language}</span>
            <CopyButton value={code} label={copyLabel} className="opacity-60 transition-opacity group-hover/code:opacity-100" />
          </div>
        ) : (
          <CopyButton
            value={code}
            label={copyLabel}
            className="absolute right-2 top-2 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/code:opacity-100"
          />
        )}
        <pre className={cn('overflow-x-auto p-3 font-mono text-xs leading-relaxed', !showLanguage && 'pt-3')}>
          <code aria-label={language ? `${language} ${codeLabel}` : codeLabel}>{code}</code>
        </pre>
      </div>
    )
  },
)
