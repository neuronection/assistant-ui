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
  list: ReactNode
  value: PickerSelection[]
  isSelected: (option: PickerOption) => boolean
  toggle: (option: PickerOption) => void
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
