import type { ReactNode } from 'react'

export interface PickerOption {
  value: string
  label: string
  category?: string | null
}

export type PickerSelection = PickerOption

export type PickerMode = 'single' | 'multi'

export interface PickerBrowseBodyCtx {
  search: string
  onSearchChange: (next: string) => void
  category: string
  onCategoryChange: (next: string) => void
  categories: string[]
  filters: ReactNode
  searchInput: ReactNode
  categorySelect: ReactNode
  /** The bulk-select control (`selectAll` mode only — `null` otherwise). */
  selectAll: ReactNode
  list: ReactNode
  value: PickerSelection[]
  /** Every option matching the current search/category/host filter — the
   * scope a bulk select acts on (not the paginated `list` slice). */
  matching: PickerOption[]
  isSelected: (option: PickerOption) => boolean
  toggle: (option: PickerOption) => void
  /** Bulk toggle scoped to `matching`: selects all when any is missing,
   * drops the `matching` ones only when every one of them is selected. */
  toggleAll: () => void
}

export interface PickerLabels {
  placeholder?: string
  inputLabel?: string
  searchPlaceholder?: string
  browseLabel?: string
  browseTitle?: string
  removeLabel?: string
  addLabel?: string
  addedLabel?: string
  loadMoreLabel?: string
  doneLabel?: string
  closeLabel?: string
  emptyLabel?: string
  searchingLabel?: string
  categoryLabel?: string
  allCategoriesLabel?: string
  selectedCountLabel?: (count: number) => string
  /** Bulk-select control: the check action, labelled with the match count. */
  selectAllLabel?: string
  /** Bulk-select control: the uncheck action (every match already picked). */
  clearSelectionLabel?: string
}

export type ResolvedPickerLabels = Required<PickerLabels>

export function resolvePickerLabels(labels?: PickerLabels): ResolvedPickerLabels {
  return {
    placeholder: labels?.placeholder ?? 'Search options…',
    inputLabel: labels?.inputLabel ?? 'Search options',
    searchPlaceholder: labels?.searchPlaceholder ?? 'Search…',
    browseLabel: labels?.browseLabel ?? 'Browse',
    browseTitle: labels?.browseTitle ?? 'Browse catalog',
    removeLabel: labels?.removeLabel ?? 'Remove',
    addLabel: labels?.addLabel ?? 'Add',
    addedLabel: labels?.addedLabel ?? 'Added',
    loadMoreLabel: labels?.loadMoreLabel ?? 'Load more',
    doneLabel: labels?.doneLabel ?? 'Done',
    closeLabel: labels?.closeLabel ?? 'Close',
    emptyLabel: labels?.emptyLabel ?? 'No matches',
    searchingLabel: labels?.searchingLabel ?? 'Searching…',
    categoryLabel: labels?.categoryLabel ?? 'Category',
    allCategoriesLabel: labels?.allCategoriesLabel ?? 'All categories',
    selectedCountLabel: labels?.selectedCountLabel ?? ((count) => `${count} selected`),
    selectAllLabel: labels?.selectAllLabel ?? 'Select all',
    clearSelectionLabel: labels?.clearSelectionLabel ?? 'Clear selection',
  }
}

export function optionMatchesQuery(option: PickerOption, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    option.label.toLowerCase().includes(needle) ||
    option.value.toLowerCase().includes(needle)
  )
}
