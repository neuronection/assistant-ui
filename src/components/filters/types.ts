import type { ReactNode } from 'react'

/** How a facet is interacted with. */
export type FilterFacetKind = 'toggle' | 'single' | 'multi'

/** One selectable value inside a facet. `null` is the “not recorded” bucket. */
export interface FilterOption {
  value: string | null
  label: string
  /** Optional leading icon — a node, so the host chooses its icon set. */
  icon?: ReactNode
  /** Optional count badge (the host computes it from its data). */
  count?: number
  /** Render the count as `≥N` — the host truncated the bucket. */
  countAtLeast?: boolean
  /** Optional hint shown beside the option. */
  hint?: string
}

/**
 * A facet is a view model: the host resolves options (client- or
 * server-side) and passes labels; the library only renders and reports.
 */
export interface FilterFacet {
  id: string
  label: string
  kind: FilterFacetKind
  icon?: ReactNode
  /** Offer include/exclude/clear on each option row. Default `true` for multi. */
  allowExclude?: boolean
  /** Resolved options. Omit for `toggle` facets. */
  options?: FilterOption[]
  /**
   * Whether the option counts are trustworthy right now. Anything but `ready`
   * withholds every count — a stale number is worse than none. Default `ready`.
   */
  countsState?: 'ready' | 'loading' | 'error'
  /** File under the bar's “More” disclosure. */
  hidden?: boolean
}

/** The current value of one facet. `null` is a real value, not a sentinel string. */
export type FilterValue =
  | { kind: 'toggle'; on: boolean }
  | { kind: 'single'; value: string | null }
  | { kind: 'multi'; include: (string | null)[]; exclude: (string | null)[] }

/** One applied-filter chip in a standalone removable row. */
export interface FilterPillItem {
  key: string
  label: string
}

/** What a tri-state option row asks for: include it, exclude it, or clear it. */
export type FilterOptionAction = 'include' | 'exclude' | 'clear'
