import * as React from 'react'

import { cn } from '../../lib/utils'
import { DetailValue } from '../detail-value/DetailValue'
import {
  FieldChips,
  isStructuredList,
  valueText,
  type FieldDiffValue,
} from './FieldDiff'

/** Rows whose value is empty render nothing on a create card. */
function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }
  if (typeof value === 'string') {
    return value.trim() === ''
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0
  }
  return false
}

/** Collections (native arrays or JSON-array strings) render as chips. */
function isArrayish(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.startsWith('[') && trimmed.endsWith(']')
  }
  return false
}

export interface FieldSummaryProps {
  rows: FieldDiffValue[]
  className?: string
}

/**
 * Non-diff summary of a new item on a HITL create card: non-empty fields
 * as label/value rows, long text as a prose block. `create` ops have no
 * before-state — the classic diff grid renders every unset field as
 * `— → value` noise, empty rows are skipped entirely here.
 */
export function FieldSummary({ rows, className }: FieldSummaryProps) {
  const filled = rows.filter((row) => !isBlank(row.after))
  if (filled.length === 0) {
    return null
  }
  return (
    <div className={cn('flex flex-col gap-1.5', className)} data-field-count={filled.length}>
      {filled.map((row) => {
        const heading = row.label ?? row.field
        if (isStructuredList(row.after)) {
          return (
            <div key={row.field} data-as="hitl-field-summary" data-field={row.field}>
              <p className="font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
                {heading}
              </p>
              <FieldChips value={row.after} />
            </div>
          )
        }
        if (isArrayish(row.after)) {
          return (
            <div key={row.field} data-as="hitl-field-summary" data-field={row.field}>
              <p className="font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
                {heading}
              </p>
              <DetailValue
                text={
                  typeof row.after === 'string'
                    ? row.after
                    : JSON.stringify(row.after)
                }
              />
            </div>
          )
        }
        const long = typeof row.after === 'string' && row.after.length > 80
        if (long) {
          return (
            <div key={row.field} data-as="hitl-field-summary" data-field={row.field}>
              <p className="font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
                {heading}
              </p>
              <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-[var(--as-fg)]">
                {valueText(row.after)}
              </p>
            </div>
          )
        }
        return (
          <div
            key={row.field}
            data-as="hitl-field-summary"
            data-field={row.field}
            className="grid grid-cols-[minmax(6rem,auto)_1fr] items-baseline gap-2"
          >
            <span className="min-w-0 truncate text-[var(--as-muted-fg)]" title={heading}>
              {heading}
            </span>
            <span className="min-w-0 break-words text-right font-medium text-[var(--as-fg)]">
              {valueText(row.after)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
