import type { ReactNode } from 'react'

/** How a facet is interacted with. */
export type FilterFacetKind = 'toggle' | 'single' | 'multi'

/** One selectable value inside a facet. */
export interface FilterOption {
  value: string
  label: string
  /** Optional leading icon — a node, so the host chooses its icon set. */
  icon?: ReactNode
  /** Optional count badge (the host computes it from its data). */
  count?: number
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
  /** Resolved options. Omit for `toggle` facets. */
  options?: FilterOption[]
  /** File under the bar's “More” disclosure. */
  hidden?: boolean
}

/** The current value of one facet. */
export type FilterValue =
  | { kind: 'toggle'; on: boolean }
  | { kind: 'single'; value: string }
  | { kind: 'multi'; values: string[] }
