import * as React from 'react'

import { detailValueView } from '../../lib/utils'

/**
 * Structured detail payload (parsed, never raw JSON): objects render as
 * `key: value` rows, arrays as value chips, anything else as preformatted
 * text. Display-only; the JSON string stays view-only (no app joins).
 */
export function DetailValue({ text }: { text: string }) {
  const view = detailValueView(text)
  if (view.kind === 'pairs') {
    return (
      <dl className="mt-0.5 max-h-40 space-y-0.5 overflow-auto">
        {view.entries.map((entry) => (
          <div
            key={entry.key}
            className="flex items-baseline justify-between gap-2 rounded-md bg-[var(--as-muted)] px-2 py-1"
          >
            <dt className="max-w-1/3 shrink-0 truncate text-[10px] uppercase tracking-wide text-[var(--as-muted-fg)]" title={entry.key}>
              {entry.key}
            </dt>
            <dd className="min-w-0 break-words text-right text-[11px] font-medium text-[var(--as-fg)]">
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    )
  }
  if (view.kind === 'items') {
    return (
      <ul className="mt-0.5 flex max-h-40 flex-wrap gap-1 overflow-auto">
        {view.items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="break-all rounded-[var(--as-radius)] bg-[var(--as-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--as-fg)]"
          >
            {item}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <pre className="mt-0 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-[var(--as-radius)] bg-[var(--as-surface-raised)] p-2 font-mono text-[11px] leading-relaxed text-[var(--as-fg)]">
      {text}
    </pre>
  )
}
