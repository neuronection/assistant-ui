import * as React from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { FacetChip, defaultFilterValue, type FacetChipLabels } from './FacetChip'
import type { FilterFacet, FilterValue } from './types'

export interface FilterBarLabels extends FacetChipLabels {
  more?: string
  fewer?: string
  clearAll?: string
}

export interface FilterBarProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  facets: FilterFacet[]
  /** Current value per facet id; a missing entry means “at its default”. */
  values: Record<string, FilterValue | undefined>
  onChange: (facetId: string, value: FilterValue) => void
  onClearAll: () => void
  /** Number of facets currently away from their default — shows “Clear all”. */
  activeCount: number
  /** Host-formatted summary (e.g. “12 of 300”); rendered end-aligned. */
  summary?: React.ReactNode
  /** Options count above which a popover gains a search box. */
  searchThreshold?: number
  /** Passed to every chip; `false` hides the active-value pills row. */
  showActivePills?: boolean
  /** Format a count badge in every chip. */
  formatCount?: (count: number) => React.ReactNode
  /** Controlled “More” disclosure; omit to let the bar own it. */
  showHidden?: boolean
  onShowHiddenChange?: (next: boolean) => void
  labels?: FilterBarLabels
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  {
    facets,
    values,
    onChange,
    onClearAll,
    activeCount,
    summary,
    searchThreshold,
    showActivePills,
    formatCount,
    showHidden,
    onShowHiddenChange,
    labels,
    className,
    ...props
  },
  ref,
) {
  const [uncontrolledShowHidden, setUncontrolledShowHidden] = React.useState(false)
  const hiddenOpen = showHidden ?? uncontrolledShowHidden
  const setHiddenOpen = (next: boolean) => {
    if (showHidden === undefined) setUncontrolledShowHidden(next)
    onShowHiddenChange?.(next)
  }

  const { visible, hidden } = React.useMemo(() => {
    const shown: FilterFacet[] = []
    const folded: FilterFacet[] = []
    for (const facet of facets) (facet.hidden ? folded : shown).push(facet)
    return { visible: shown, hidden: folded }
  }, [facets])

  const renderFacet = (facet: FilterFacet) => (
    <FacetChip
      key={facet.id}
      facet={facet}
      value={values[facet.id] ?? defaultFilterValue(facet)}
      onValueChange={(value) => onChange(facet.id, value)}
      searchThreshold={searchThreshold}
      showActivePills={showActivePills}
      formatCount={formatCount}
      labels={labels}
    />
  )

  return (
    <div
      ref={ref}
      data-as="filter-bar"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {visible.map(renderFacet)}

      {hidden.length > 0 && (
        <>
          {hiddenOpen && hidden.map(renderFacet)}
          <button
            type="button"
            onClick={() => setHiddenOpen(!hiddenOpen)}
            aria-expanded={hiddenOpen}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--as-muted-fg)] transition-colors hover:border-[color-mix(in_srgb,var(--as-primary)_40%,var(--as-border))] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <MoreHorizontal className="size-4" aria-hidden />
            <span>{hiddenOpen ? (labels?.fewer ?? 'Fewer') : (labels?.more ?? 'More')}</span>
          </button>
        </>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-[var(--as-muted-fg)] transition-colors hover:bg-[color-mix(in_srgb,var(--as-danger)_12%,transparent)] hover:text-[var(--as-danger)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <X className="size-4" aria-hidden />
          <span>{labels?.clearAll ?? 'Clear all'}</span>
        </button>
      )}

      {summary != null && (
        <span className="ml-auto whitespace-nowrap text-xs font-medium tabular-nums text-[var(--as-muted-fg)]">
          {summary}
        </span>
      )}
    </div>
  )
})
