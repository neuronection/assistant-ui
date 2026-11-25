import { useState, type ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Activity } from 'lucide-react'
import {
  FacetChip,
  defaultFilterValue,
  filterValueKey,
  isDefaultValue,
} from '../src/components/filters/FacetChip'
import { FilterBar } from '../src/components/filters/FilterBar'
import { FilterPills } from '../src/components/filters/FilterPills'
import type { FilterFacet, FilterValue } from '../src/components/filters/types'

const categories: FilterFacet = {
  id: 'category',
  label: 'Category',
  kind: 'multi',
  options: [
    { value: 'labs', label: 'Labs', count: 12, icon: <Activity className="size-4" /> },
    { value: 'imaging', label: 'Imaging', count: 3 },
    { value: 'notes', label: 'Notes' },
  ],
}

const source: FilterFacet = {
  id: 'source',
  label: 'Source',
  kind: 'single',
  options: [
    { value: 'manual', label: 'Manual' },
    { value: 'import', label: 'Import' },
    { value: null, label: 'Not recorded' },
  ],
}

const telemetry: FilterFacet = {
  id: 'telemetry',
  label: 'Telemetry only',
  kind: 'toggle',
}

const honesty: FilterFacet = {
  id: 'phase',
  label: 'Phase',
  kind: 'multi',
  options: [
    { value: 'PHASE_3', label: 'Phase 3', count: 89 },
    { value: null, label: 'Not recorded', count: 1726 },
    { value: 'PHASE_1', label: 'Phase 1', count: 0 },
    { value: 'PHASE_2', label: 'Phase 2', count: 200, countAtLeast: true },
    { value: 'PHASE_4', label: 'Phase 4' },
  ],
}

const manyOptions: FilterFacet = {
  id: 'doctor',
  label: 'Doctor',
  kind: 'multi',
  options: Array.from({ length: 12 }, (_, index) => ({
    value: `doctor-${index}`,
    label: `Doctor ${index}`,
  })),
}

const eightOptions: FilterFacet = {
  id: 'eight',
  label: 'Eight',
  kind: 'multi',
  options: Array.from({ length: 8 }, (_, index) => ({ value: `v${index}`, label: `Value ${index}` })),
}

function multi(include: (string | null)[], exclude: (string | null)[] = []): FilterValue {
  return { kind: 'multi', include, exclude }
}

/** Axe over the whole document with the popover open; `region` fires on the bare harness. */
async function openStateViolations() {
  return axe(document.body, { rules: { region: { enabled: false } } })
}

describe('FacetChip', () => {
  it('renders a toggle facet as a pressed button and flips the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetChip facet={telemetry} value={{ kind: 'toggle', on: false }} onValueChange={onValueChange} />,
    )
    const chip = screen.getByRole('button', { name: 'Telemetry only' })
    expect(chip.closest('[data-as="facet-chip"]')).not.toBeNull()
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(onValueChange).toHaveBeenCalledWith({ kind: 'toggle', on: true })
  })

  it('opens a multi facet and cycles include, exclude, clear on the same row', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetChip facet={categories} value={multi([])} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const group = screen.getByRole('group', { name: 'Category' })
    const labs = within(group).getByRole('checkbox', { name: 'Labs, 12' })
    expect(labs).toHaveAttribute('aria-checked', 'false')
    expect(labs).not.toHaveAttribute('aria-pressed')

    await user.click(labs)
    expect(onValueChange).toHaveBeenLastCalledWith(multi(['labs']))

    rerender(<FacetChip facet={categories} value={multi(['labs'])} onValueChange={onValueChange} />)
    const included = within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', {
      name: 'Labs, 12',
    })
    expect(included).toHaveAttribute('aria-checked', 'true')
    expect(included).not.toHaveAttribute('aria-pressed')

    await user.click(included)
    expect(onValueChange).toHaveBeenLastCalledWith(multi([], ['labs']))

    rerender(<FacetChip facet={categories} value={multi([], ['labs'])} onValueChange={onValueChange} />)
    const excluded = within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', {
      name: 'Labs, 12 (excluded)',
    })
    expect(excluded).toHaveAttribute('aria-checked', 'true')
    expect(excluded).not.toHaveAttribute('aria-pressed')
    expect(excluded).not.toHaveAttribute('aria-checked', 'mixed')

    await user.click(excluded)
    expect(onValueChange).toHaveBeenLastCalledWith(multi([]))
  })

  it('keeps the include and exclude lists disjoint when a value moves between them', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={categories} value={multi(['labs', 'notes'])} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    await user.click(
      within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', { name: 'Labs, 12' }),
    )
    expect(onValueChange).toHaveBeenLastCalledWith(multi(['notes'], ['labs']))
  })

  it('excludes and clears from the keyboard (Enter, Shift+Enter, Delete)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(<FacetChip facet={categories} value={multi([])} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const row = within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', {
      name: 'Imaging, 3',
    })
    row.focus()
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(multi(['imaging']))

    rerender(<FacetChip facet={categories} value={multi([], ['imaging'])} onValueChange={onValueChange} />)
    const excludedRow = within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', {
      name: 'Imaging, 3 (excluded)',
    })
    excludedRow.focus()
    await user.keyboard('{Delete}')
    expect(onValueChange).toHaveBeenLastCalledWith(multi([]))

    rerender(<FacetChip facet={categories} value={multi([])} onValueChange={onValueChange} />)
    const shiftRow = within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', {
      name: 'Imaging, 3',
    })
    shiftRow.focus()
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(onValueChange).toHaveBeenLastCalledWith(multi([], ['imaging']))
  })

  it('opens the per-row menu from Shift+F10 and from touch', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={categories} value={multi([])} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const row = within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', {
      name: 'Imaging, 3',
    })
    row.focus()
    await user.keyboard('{Shift>}{F10}{/Shift}')
    await user.click(await screen.findByRole('menuitem', { name: 'Exclude' }))
    expect(onValueChange).toHaveBeenLastCalledWith(multi([], ['imaging']))

    await user.click(screen.getByRole('button', { name: 'More actions for Labs' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Include' }))
    expect(onValueChange).toHaveBeenLastCalledWith(multi(['labs']))
  })

  it('is burst-safe when the host takes tri-state intents', async () => {
    const user = userEvent.setup()
    const onToggleOption = vi.fn()
    render(<FacetChip facet={categories} value={multi([])} onToggleOption={onToggleOption} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const group = screen.getByRole('group', { name: 'Category' })
    await user.click(within(group).getByRole('checkbox', { name: 'Labs, 12' }))
    await user.click(within(group).getByRole('checkbox', { name: 'Imaging, 3' }))
    expect(onToggleOption.mock.calls).toEqual([
      ['labs', 'include'],
      ['imaging', 'include'],
    ])
  })

  it('renders the null bucket as “not recorded” and keeps it distinct from the string "null"', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const literal: FilterFacet = {
      id: 'phase',
      label: 'Phase',
      kind: 'multi',
      options: [
        { value: null, label: 'missing', count: 1726 },
        { value: 'null', label: 'Literal null', count: 4 },
      ],
    }
    const { rerender } = render(<FacetChip facet={literal} value={multi([])} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Phase/ }))
    const group = screen.getByRole('group', { name: 'Phase' })
    expect(within(group).getByText('Not recorded')).toBeInTheDocument()
    await user.click(within(group).getByRole('checkbox', { name: 'Not recorded, 1,726' }))
    expect(onValueChange).toHaveBeenLastCalledWith(multi([null]))
    expect(filterValueKey(null)).not.toBe(filterValueKey('null'))

    rerender(<FacetChip facet={literal} value={multi([null, 'null'])} onValueChange={onValueChange} />)
    expect(screen.getByRole('button', { name: 'Remove Not recorded' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Literal null' })).toBeInTheDocument()
  })

  it('renders ≥N, renders 0 and keeps a zero-count option selectable', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={honesty} value={multi([])} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Phase/ }))
    const group = screen.getByRole('group', { name: 'Phase' })

    expect(within(group).getByText('≥200')).toBeInTheDocument()
    expect(within(group).getByRole('checkbox', { name: 'Phase 2, ≥200' })).toBeInTheDocument()
    expect(within(group).getByText('0')).toBeInTheDocument()

    const zero = within(group).getByRole('checkbox', { name: 'Phase 1, 0, none match now' })
    expect(zero).not.toHaveAttribute('disabled')
    expect(zero).not.toHaveAttribute('aria-disabled')
    await user.click(zero)
    expect(onValueChange).toHaveBeenLastCalledWith(multi(['PHASE_1']))
  })

  it('shows no count when the option carries none', async () => {
    const user = userEvent.setup()
    render(<FacetChip facet={honesty} value={multi([])} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Phase/ }))
    const row = within(screen.getByRole('group', { name: 'Phase' })).getByRole('checkbox', {
      name: 'Phase 4',
    })
    expect(row.querySelector('.tabular-nums')).toBeNull()
  })

  it('synthesizes a removable pill for a selected value absent from empty options', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const ref = { current: null as HTMLDivElement | null }
    const { container } = render(
      <FacetChip
        ref={ref}
        facet={{ ...categories, options: [] }}
        value={multi(['STALE'])}
        onValueChange={onValueChange}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByRole('button', { name: 'Category: STALE' })).toBeInTheDocument()
    const pill = screen.getByRole('button', { name: 'Remove STALE' })
    expect(pill.closest('[data-as="facet-chip"]')).not.toBeNull()
    expect(container.querySelector('.tabular-nums')).toBeNull()

    await user.click(pill)
    expect(onValueChange).toHaveBeenCalledWith(multi([]))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Category: STALE' }))
  })

  it('focuses the next pill after removal, and the trigger after the last one', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetChip facet={categories} value={multi(['labs', 'imaging'])} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove Labs' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove Imaging' }))

    rerender(
      <FacetChip facet={categories} value={multi(['labs', 'imaging'])} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove Imaging' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Category: 2 selected' }))
  })

  it('renders an excluded pill and removes it without touching the include list', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={categories} value={multi(['notes'], ['labs'])} onValueChange={onValueChange} />)
    expect(screen.getByText('(excluded)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Labs (excluded)' }))
    expect(onValueChange).toHaveBeenCalledWith(multi(['notes']))
  })

  it('single facets set the value and clear on a second click, without a pill', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetChip facet={source} value={{ kind: 'single', value: '' }} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Source' }))
    const group = screen.getByRole('radiogroup', { name: 'Source' })
    const manual = within(group).getByRole('radio', { name: 'Manual' })
    expect(manual).toHaveAttribute('aria-checked', 'false')
    await user.click(manual)
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'single', value: 'manual' })

    rerender(<FacetChip facet={source} value={{ kind: 'single', value: 'manual' }} onValueChange={onValueChange} />)
    expect(screen.queryByRole('button', { name: 'Remove Manual' })).not.toBeInTheDocument()
    await user.click(within(screen.getByRole('radiogroup', { name: 'Source' })).getByRole('radio', { name: 'Manual' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'single', value: '' })
  })

  it('selects the null bucket on a single facet', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={source} value={{ kind: 'single', value: '' }} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: 'Source' }))
    await user.click(
      within(screen.getByRole('radiogroup', { name: 'Source' })).getByRole('radio', { name: 'Not recorded' }),
    )
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'single', value: null })
  })

  it('adds a search box above the threshold and filters options', async () => {
    const user = userEvent.setup()
    render(<FacetChip facet={manyOptions} value={multi([])} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Doctor/ }))
    const search = screen.getByRole('textbox', { name: 'Search options' })
    await user.type(search, 'Doctor 1')
    const group = screen.getByRole('group', { name: 'Doctor' })
    expect(within(group).getAllByRole('checkbox')).toHaveLength(3)
    expect(within(group).queryByRole('checkbox', { name: 'Doctor 5' })).not.toBeInTheDocument()
  })

  it('does not render search at the threshold', async () => {
    const user = userEvent.setup()
    render(<FacetChip facet={eightOptions} value={multi([])} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Eight/ }))
    expect(screen.queryByRole('textbox', { name: 'Search options' })).not.toBeInTheDocument()
  })

  it('reports the empty states', async () => {
    const user = userEvent.setup()
    const empty: FilterFacet = { id: 'empty', label: 'Empty', kind: 'multi', options: [] }
    render(<FacetChip facet={empty} value={multi([])} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Empty/ }))
    expect(screen.getByText('No options')).toBeInTheDocument()
  })

  it('supports the options override, hidden pills and a forwarded ref', async () => {
    const user = userEvent.setup()
    const ref = { current: null as HTMLDivElement | null }
    const override = [{ value: 'custom', label: 'Custom' }]
    render(
      <FacetChip
        ref={ref}
        facet={categories}
        value={multi(['labs'])}
        options={override}
        showActivePills={false}
        onValueChange={vi.fn()}
        className="extra-class"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass('extra-class')
    expect(screen.queryByRole('button', { name: 'Remove Labs' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    expect(screen.getByRole('group', { name: 'Category' })).toHaveTextContent('Custom')
    expect(screen.queryByText('Labs')).not.toBeInTheDocument()
  })

  it('formats counts through the host', async () => {
    const user = userEvent.setup()
    render(
      <FacetChip
        facet={categories}
        value={multi([])}
        onValueChange={vi.fn()}
        formatCount={(count) => `${count}×`}
        labels={{ optionWithCount: (label, count) => `${label} (${count}×)` }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const group = screen.getByRole('group', { name: 'Category' })
    expect(within(group).getByRole('checkbox', { name: 'Labs (12×)' })).toBeInTheDocument()
  })

  it('takes every new string from labels', async () => {
    const user = userEvent.setup()
    const marked: FilterFacet = {
      id: 'phase',
      label: 'Phase',
      kind: 'multi',
      options: [
        { value: null, label: 'x', count: 0 },
        { value: 'a', label: 'A', count: 1 },
      ],
    }
    render(
      <FacetChip
        facet={marked}
        value={multi([], ['a'])}
        onValueChange={vi.fn()}
        labels={{
          excluded: 'ausgeschlossen',
          noneMatch: 'kein Treffer',
          notRecorded: 'nicht erfasst',
          remove: (label) => `${label} entfernen`,
          include: 'Einschließen',
          exclude: 'Ausschließen',
          clear: 'Zurücksetzen',
        }}
      />,
    )
    expect(screen.getByRole('button', { name: 'A entfernen (ausgeschlossen)' })).toBeInTheDocument()
    expect(screen.getByText('(ausgeschlossen)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Phase/ }))
    const group = screen.getByRole('group', { name: 'Phase' })
    expect(within(group).getByText('nicht erfasst')).toBeInTheDocument()
    expect(within(group).getByRole('checkbox', { name: 'nicht erfasst, 0, kein Treffer' })).toBeInTheDocument()
    expect(within(group).getByRole('checkbox', { name: 'A, 1 (ausgeschlossen)' })).toBeInTheDocument()
  })

  it('has no axe violations closed', async () => {
    const { container } = render(
      <FacetChip
        facet={categories}
        value={multi(['labs'], ['imaging'])}
        onValueChange={vi.fn()}
        labels={{ selectedCount: (count) => `${count} selected` }}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with the popover open on every option state', async () => {
    const user = userEvent.setup()
    render(
      <FacetChip facet={honesty} value={multi(['PHASE_3', null], ['PHASE_1'])} onValueChange={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: /^Phase/ }))
    expect(await openStateViolations()).toHaveNoViolations()
  })

  it('is keyboard operable: Enter opens, Tab reaches an option, Enter activates, Escape returns focus', async () => {
    const user = userEvent.setup()
    const onToggleOption = vi.fn()
    render(<FacetChip facet={categories} value={multi([])} onToggleOption={onToggleOption} />)
    const trigger = screen.getByRole('button', { name: /^Category/ })
    trigger.focus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.tab()
    const group = screen.getByRole('group', { name: 'Category' })
    const focused = document.activeElement as HTMLElement
    expect(group.contains(focused)).toBe(true)
    expect(focused).toHaveAttribute('role', 'checkbox')

    await user.keyboard('{Enter}')
    expect(onToggleOption).toHaveBeenCalledTimes(1)
    expect(onToggleOption.mock.calls[0]).toEqual(['labs', 'include'])

    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })

  it('exposes the neutral value helpers', () => {
    expect(defaultFilterValue(telemetry)).toEqual({ kind: 'toggle', on: false })
    expect(defaultFilterValue(source)).toEqual({ kind: 'single', value: '' })
    expect(defaultFilterValue(categories)).toEqual({ kind: 'multi', include: [], exclude: [] })
    expect(isDefaultValue({ kind: 'toggle', on: false })).toBe(true)
    expect(isDefaultValue({ kind: 'single', value: null })).toBe(false)
    expect(isDefaultValue({ kind: 'multi', include: ['labs'], exclude: [] })).toBe(false)
    expect(isDefaultValue({ kind: 'multi', include: [], exclude: ['labs'] })).toBe(false)
    expect(filterValueKey('null')).toBe('value:null')
    expect(filterValueKey(null)).toBe('null:')
  })
})

describe('FilterBar', () => {
  const values: Record<string, FilterValue> = {
    telemetry: { kind: 'toggle', on: true },
    category: multi(['labs']),
  }

  function renderBar(overrides: Partial<ComponentProps<typeof FilterBar>> = {}) {
    const onChange = vi.fn()
    const onClearAll = vi.fn()
    const utils = render(
      <FilterBar
        facets={[telemetry, categories, source]}
        values={values}
        onChange={onChange}
        onClearAll={onClearAll}
        activeCount={2}
        summary="12 of 300"
        {...overrides}
      />,
    )
    return { onChange, onClearAll, ...utils }
  }

  it('renders the visible facets, the clear-all action and the summary', () => {
    renderBar()
    const bar = screen.getByRole('button', { name: 'Telemetry only' }).closest('[data-as="filter-bar"]')
    expect(bar).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
    expect(screen.getByText('12 of 300')).toBeInTheDocument()
  })

  it('routes a facet change with its id', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()
    await user.click(screen.getByRole('button', { name: 'Telemetry only' }))
    expect(onChange).toHaveBeenCalledWith('telemetry', { kind: 'toggle', on: false })
  })

  it('routes an exclude from a bar chip', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()
    await user.click(screen.getByRole('button', { name: 'Category: Labs' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Category' })).getByRole('checkbox', { name: 'Labs, 12' }),
    )
    expect(onChange).toHaveBeenCalledWith('category', multi([], ['labs']))
  })

  it('folds hidden facets behind More/Fewer', async () => {
    const user = userEvent.setup()
    renderBar({ facets: [telemetry, { ...categories, hidden: true }] })
    expect(screen.queryByRole('button', { name: 'Category: Labs' })).not.toBeInTheDocument()
    const more = screen.getByRole('button', { name: 'More' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    await user.click(more)
    expect(screen.getByRole('button', { name: 'Category: Labs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fewer' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('lets the host control the disclosure (an active hidden facet can be revealed)', async () => {
    const onShowHiddenChange = vi.fn()
    const { rerender } = renderBar({
      facets: [telemetry, { ...categories, hidden: true }],
      showHidden: false,
      onShowHiddenChange,
    })
    expect(screen.queryByRole('button', { name: 'Category: Labs' })).not.toBeInTheDocument()
    rerender(
      <FilterBar
        facets={[telemetry, { ...categories, hidden: true }]}
        values={values}
        onChange={vi.fn()}
        onClearAll={vi.fn()}
        activeCount={2}
        showHidden
        onShowHiddenChange={onShowHiddenChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Category: Labs' })).toBeInTheDocument()
  })

  it('hides clear-all when nothing is active and calls back on click', async () => {
    const user = userEvent.setup()
    const { rerender, onClearAll } = renderBar({ activeCount: 0 })
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
    rerender(
      <FilterBar
        facets={[telemetry]}
        values={values}
        onChange={vi.fn()}
        onClearAll={onClearAll}
        activeCount={1}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClearAll).toHaveBeenCalled()
  })

  it('renders no empty summary wrapper for null', () => {
    const { container } = renderBar({ summary: null })
    expect(container.querySelector('.ml-auto')).toBeNull()
  })

  it('passes the pills and count-format controls to the chips', () => {
    renderBar({
      showActivePills: false,
      formatCount: (count) => `${count}×`,
    })
    expect(screen.queryByRole('button', { name: 'Remove Labs' })).not.toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderBar()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FacetChip — inline variant', () => {
  type InlineOverrides = Partial<Omit<ComponentProps<typeof FacetChip>, 'onValueChange' | 'onToggleOption'>>

  function renderInline(overrides: InlineOverrides = {}) {
    const onToggleOption = vi.fn()
    const utils = render(
      <FacetChip
        facet={categories}
        value={multi(['labs'])}
        onToggleOption={onToggleOption}
        variant="inline"
        testId="kinds"
        optionTestId={(value) => `kind-${filterValueKey(value)}`}
        {...overrides}
      />,
    )
    return { onToggleOption, ...utils }
  }

  it('renders the options as an always-visible checkbox row', () => {
    renderInline()
    const row = screen.getByTestId('kinds')
    expect(row).toHaveAttribute('data-as', 'facet-chip')
    expect(screen.getByTestId(`kind-${filterValueKey('labs')}`)).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId(`kind-${filterValueKey('imaging')}`)).toHaveAttribute('aria-checked', 'false')
    expect(screen.queryByRole('button', { name: /^Category/ })).not.toBeInTheDocument()
  })

  it('emits the tri-state intent and never opens a popover', async () => {
    const user = userEvent.setup()
    const { onToggleOption } = renderInline()
    await user.click(screen.getByTestId(`kind-${filterValueKey('imaging')}`))
    expect(onToggleOption).toHaveBeenCalledWith('imaging', 'include')
    expect(screen.queryByRole('group', { name: 'Category' })).not.toBeInTheDocument()
  })

  it('shows include and exclude states and offers the row menu', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetChip
        facet={categories}
        value={multi(['labs'], ['imaging'])}
        onValueChange={onValueChange}
        variant="inline"
        testId="kinds"
        optionTestId={(value) => `kind-${filterValueKey(value)}`}
      />,
    )
    expect(screen.getByTestId(`kind-${filterValueKey('imaging')}`)).toHaveAccessibleName(
      'Imaging, 3 (excluded)',
    )
    await user.click(screen.getByRole('button', { name: 'More actions for Notes' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Exclude' }))
    expect(onValueChange).toHaveBeenCalledWith(multi(['labs'], ['imaging', 'notes']))
  })

  it('renders the count badge in the inline row', () => {
    renderInline()
    const labs = screen.getByTestId(`kind-${filterValueKey('labs')}`)
    expect(within(labs).getByText('12')).toBeInTheDocument()
  })

  it('renders a removable pill for an applied value even with empty options', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetChip
        facet={{ ...categories, options: [] }}
        value={multi(['STALE'])}
        onValueChange={onValueChange}
        variant="inline"
        testId="kinds"
      />,
    )
    const pill = screen.getByRole('button', { name: 'Remove STALE' })
    expect(pill.closest('[data-as="facet-chip"]')).not.toBeNull()
    expect(screen.getByTestId('kinds')).toHaveTextContent('STALE')

    await user.click(pill)
    expect(onValueChange).toHaveBeenCalledWith(multi([]))
  })

  it('moves focus to the first option after removing the last inline pill', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [value, setValue] = useState<FilterValue>(multi(['labs']))
      return (
        <FacetChip
          facet={categories}
          value={value}
          onValueChange={setValue}
          variant="inline"
          testId="kinds"
          optionTestId={(value) => `kind-${filterValueKey(value)}`}
        />
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Remove Labs' }))
    expect(document.activeElement).toBe(screen.getByTestId(`kind-${filterValueKey('labs')}`))
  })

  it('has no axe violations', async () => {
    const { container } = renderInline()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FilterPills', () => {
  const items = [
    { key: 'q', label: 'nurse' },
    { key: 'saved', label: 'Saved only' },
  ]

  it('renders nothing without items', () => {
    const { container } = render(<FilterPills items={[]} onRemove={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders one removable pill per item with an accessible name and test hooks', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <FilterPills
        items={items}
        onRemove={onRemove}
        testId="applied"
        itemTestId={(key) => `applied-${key}`}
        removeLabel={(label) => `Clear ${label}`}
      />,
    )
    expect(screen.getByTestId('applied')).toHaveAttribute('data-as', 'filter-pills')
    expect(screen.getByRole('button', { name: 'Clear nurse' })).toBeInTheDocument()
    await user.click(screen.getByTestId('applied-saved'))
    expect(onRemove).toHaveBeenCalledWith('saved')
  })

  it('defaults the remove label to the pill label', () => {
    render(<FilterPills items={items} onRemove={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Remove nurse' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<FilterPills items={items} onRemove={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
