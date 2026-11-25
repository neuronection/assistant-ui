import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Activity } from 'lucide-react'
import { FacetChip } from '../src/components/filters/FacetChip'
import { FilterBar } from '../src/components/filters/FilterBar'
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
  ],
}

const telemetry: FilterFacet = {
  id: 'telemetry',
  label: 'Telemetry only',
  kind: 'toggle',
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

  it('opens a multi facet and emits the merged selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={categories} value={{ kind: 'multi', values: [] }} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const group = screen.getByRole('group', { name: 'Category' })
    const labs = within(group).getByRole('button', { name: /Labs/ })
    expect(labs).toHaveAttribute('aria-pressed', 'false')
    await user.click(labs)
    expect(onValueChange).toHaveBeenCalledWith({ kind: 'multi', values: ['labs'] })
  })

  it('adds and removes values in a multi facet', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetChip facet={categories} value={{ kind: 'multi', values: ['labs'] }} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Labs' }))
    await user.click(within(screen.getByRole('group', { name: 'Category' })).getByRole('button', { name: /Imaging/ }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'multi', values: ['labs', 'imaging'] })
  })

  it('shows the selected count and removable pills', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetChip
        facet={categories}
        value={{ kind: 'multi', values: ['labs', 'imaging'] }}
        onValueChange={onValueChange}
        labels={{ selectedCount: (count) => `${count} selected`, removeNamed: (name) => `Remove ${name}` }}
      />,
    )
    expect(screen.getByRole('button', { name: /2 selected/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Labs' }))
    expect(onValueChange).toHaveBeenCalledWith({ kind: 'multi', values: ['imaging'] })
  })

  it('single facets set the value and clear on a second click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetChip facet={source} value={{ kind: 'single', value: '' }} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Source' }))
    const group = screen.getByRole('group', { name: 'Source' })
    await user.click(within(group).getByRole('button', { name: 'Manual' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'single', value: 'manual' })

    // the popover stays open: re-select the same option to clear it
    rerender(<FacetChip facet={source} value={{ kind: 'single', value: 'manual' }} onValueChange={onValueChange} />)
    await user.click(within(screen.getByRole('group', { name: 'Source' })).getByRole('button', { name: 'Manual' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'single', value: '' })
  })

  it('adds a search box above the threshold and filters options', async () => {
    const user = userEvent.setup()
    render(<FacetChip facet={manyOptions} value={{ kind: 'multi', values: [] }} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Doctor/ }))
    const search = screen.getByRole('textbox', { name: 'Search options' })
    await user.type(search, 'Doctor 1')
    const group = screen.getByRole('group', { name: 'Doctor' })
    expect(within(group).getAllByRole('button')).toHaveLength(3)
    expect(within(group).queryByRole('button', { name: 'Doctor 5' })).not.toBeInTheDocument()
  })

  it('reports the empty states', async () => {
    const user = userEvent.setup()
    const empty: FilterFacet = { id: 'empty', label: 'Empty', kind: 'multi', options: [] }
    render(<FacetChip facet={empty} value={{ kind: 'multi', values: [] }} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Empty/ }))
    expect(screen.getByText('No options')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FacetChip
        facet={categories}
        value={{ kind: 'multi', values: ['labs'] }}
        onValueChange={vi.fn()}
        labels={{ selectedCount: (count) => `${count} selected` }}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FilterBar', () => {
  const values: Record<string, FilterValue> = {
    telemetry: { kind: 'toggle', on: true },
    category: { kind: 'multi', values: ['labs'] },
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

  it('folds hidden facets behind More/Fewer', async () => {
    const user = userEvent.setup()
    renderBar({ facets: [telemetry, { ...categories, hidden: true }] })
    expect(screen.queryByRole('button', { name: 'Labs' })).not.toBeInTheDocument()
    const more = screen.getByRole('button', { name: 'More' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    await user.click(more)
    expect(screen.getByRole('button', { name: 'Labs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fewer' })).toHaveAttribute('aria-expanded', 'true')
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

  it('has no axe violations', async () => {
    const { container } = renderBar()
    expect(await axe(container)).toHaveNoViolations()
  })
})
