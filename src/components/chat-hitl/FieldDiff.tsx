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

/** True when the value is a list of plain objects — the structured
 * collection diff rows (plan 99): skills/achievements/links render as
 * chips instead of JSON strings. Scalar string lists render as before. */
export function isStructuredList(
  value: unknown,
): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (entry) => typeof entry === 'object' && entry !== null && !Array.isArray(entry),
    )
  )
}

/** Chip caption of one structured entry: label first, role/level as a
 * suffix — skills keep their per-item role, achievements their text. */
export function chipLabel(entry: Record<string, unknown>): string {
  const base =
    entry.skill_label ?? entry.skill_key ?? entry.text ?? entry.url ?? entry.label
  const bits: string[] = []
  if (typeof entry.role_in_item === 'string' && entry.role_in_item) {
    bits.push(String(entry.role_in_item))
  }
  if (typeof entry.level_claim === 'number') {
    bits.push(`lvl ${entry.level_claim}`)
  }
  const left = typeof base === 'string' ? base : valueText(base)
  if (!left) {
    return ''
  }
  return bits.length > 0 ? `${left} (${bits.join(' · ')})` : left
}

export function FieldChips({ value }: { value: unknown }) {
  if (!isStructuredList(value)) {
    return null
  }
  return (
    <ul className="flex flex-wrap gap-1" data-as="hitl-field-chips">
      {value.map((entry, index) => (
        <li
          key={index}
          className="rounded-[var(--as-radius)] border border-[var(--as-border)] px-1.5 py-0.5 text-[var(--as-fg)]"
        >
          {chipLabel(entry)}
        </li>
      ))}
    </ul>
  )
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
  const structured =
    isStructuredList(row.before) || isStructuredList(row.after)
  if (structured) {
    return (
      <div
        data-as="hitl-field-diff"
        data-field={row.field}
        className={cn('flex flex-col gap-1', className)}
      >
        <p className="font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
          {heading}
        </p>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <span className="sr-only">{labels?.from ?? 'from'} </span>
            {isStructuredList(row.before) ? (
              <FieldChips value={row.before} />
            ) : (
              <span className="break-words text-[var(--as-muted-fg)]">
                {valueText(row.before)}
              </span>
            )}
          </div>
          <ArrowRight
            className="mt-1 size-3 shrink-0 text-[var(--as-muted-fg)]"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <span className="sr-only">{labels?.to ?? 'to'} </span>
            {isStructuredList(row.after) ? (
              <FieldChips value={row.after} />
            ) : (
              <span className="break-words font-medium text-[var(--as-fg)]">
                {valueText(row.after)}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
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
