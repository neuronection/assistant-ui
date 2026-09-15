import * as React from 'react'
import { ArrowRight } from 'lucide-react'

import { cn } from '../../lib/utils'
import { TextDiffView } from '../text-diff-view/TextDiffView'

export interface FieldDiffValue {
  field: string
  label?: string
  before?: unknown
  after?: unknown
}

export interface FieldDiffLabels {
  from?: string
  to?: string
}

/** Value rendering: null reads as em-dash, everything else as text. */
export function valueText(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function isLongText(...values: unknown[]): boolean {
  return values.some(
    (value) => typeof value === 'string' && value.length > 80,
  )
}

export interface FieldDiffProps {
  row: FieldDiffValue
  labels?: Partial<FieldDiffLabels>
  className?: string
}

/**
 * One field-level before → after row of a HITL proposal card. Long-text
 * pairs (either side > 80 chars) render through `TextDiffView` instead of
 * the inline row.
 */
export function FieldDiff({ row, labels, className }: FieldDiffProps) {
  const heading = row.label ?? row.field
  if (isLongText(row.before, row.after)) {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <p className="font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
          {heading}
        </p>
        <TextDiffView
          original={valueText(row.before)}
          suggested={valueText(row.after)}
          showHeader={false}
          bodyClassName="max-h-48"
        />
      </div>
    )
  }
  return (
    <div
      data-as="hitl-field-diff"
      data-field={row.field}
      className={cn(
        'grid grid-cols-[minmax(6rem,auto)_auto_minmax(6rem,1fr)] items-baseline gap-2',
        className,
      )}
    >
      <span className="min-w-0 truncate text-[var(--as-muted-fg)]" title={heading}>
        {heading}
      </span>
      <span className="min-w-0 break-words text-[var(--as-fg)]">
        <span className="sr-only">{labels?.from ?? 'from'} </span>
        {valueText(row.before)}
      </span>
      <span className="min-w-0 break-words font-medium text-[var(--as-fg)]">
        <ArrowRight
          className="mr-1 inline size-3 shrink-0 align-baseline text-[var(--as-muted-fg)]"
          aria-hidden
        />
        <span className="sr-only">{labels?.to ?? 'to'} </span>
        {valueText(row.after)}
      </span>
    </div>
  )
}
