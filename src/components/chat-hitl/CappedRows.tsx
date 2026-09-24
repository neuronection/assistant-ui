import * as React from 'react'

import { cn } from '../../lib/utils'
import type { HitlDensity } from './FieldDiff'

/** Rows shown before the "Show all" affordance in compact density. */
export const COMPACT_ROW_LIMIT = 3

export interface CappedRowsLabels {
  /** `{count}` is replaced with the total row count. */
  showAll?: string
  showFewer?: string
}

const DEFAULT_SHOW_ALL = 'Show all {count} fields'
const DEFAULT_SHOW_FEWER = 'Show fewer'

/**
 * Progressive-disclosure wrapper for a list of HITL rows: compact density
 * caps the visible rows behind a toggle, full density renders everything.
 * Never silently truncates — the expander is always the escape hatch.
 */
export function CappedRows({
  rows,
  density = 'full',
  labels,
}: {
  rows: React.ReactNode[]
  density?: HitlDensity
  labels?: CappedRowsLabels
}) {
  const [expanded, setExpanded] = React.useState(false)
  const total = rows.length
  React.useEffect(() => {
    setExpanded(false)
  }, [total])
  if (density !== 'compact' || total <= COMPACT_ROW_LIMIT) {
    return <>{rows}</>
  }
  const showAll = (labels?.showAll ?? DEFAULT_SHOW_ALL).replace(
    '{count}',
    String(total),
  )
  const showFewer = labels?.showFewer ?? DEFAULT_SHOW_FEWER
  return (
    <>
      {expanded ? rows : rows.slice(0, COMPACT_ROW_LIMIT)}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        data-hitl-action="toggle-rows"
        className={cn(
          'self-start rounded-[var(--as-radius)] text-[var(--as-muted-fg)] underline-offset-2 transition-colors hover:text-[var(--as-fg)] hover:underline',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
        )}
      >
        {expanded ? showFewer : showAll}
      </button>
    </>
  )
}
