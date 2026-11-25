import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Activity } from 'lucide-react'
import { FacetChip, defaultFilterValue, isDefaultValue } from '../src/components/filters/FacetChip'
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

const eightOptions: FilterFacet = {
  id: 'eight',
  label: 'Eight',
  kind: 'multi',
  options: Array.from({ length: 8 }, (_, index) => ({ value: `v${index}`, label: `Value ${index}` })),
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

  it('opens a multi facet and emits the merged selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FacetChip facet={categories} value={{ kind: 'multi', values: [] }} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const group = screen.getByRole('group', { name: 'Category' })
    const labs = within(group).getByRole('button', { name: 'Labs, 12' })
    expect(labs).toHaveAttribute('aria-pressed', 'false')
    await user.click(labs)
    expect(onValueChange).toHaveBeenCalledWith({ kind: 'multi', values: ['labs'] })
  })

  it('adds and removes values in a multi facet', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetChip facet={categories} value={{ kind: 'multi', values: [] }} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    await user.click(within(screen.getByRole('group', { name: 'Category' })).getByRole('button', { name: /Imaging/ }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'multi', values: ['imaging'] })

    rerender(
      <FacetChip facet={categories} value={{ kind: 'multi', values: ['imaging', 'notes'] }} onValueChange={onValueChange} />,
    )
    await user.click(within(screen.getByRole('group', { name: 'Category' })).getByRole('button', { name: /Imaging/ }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'multi', values: ['notes'] })
  })

  it('is burst-safe when the host takes intents', async () => {
    const user = userEvent.setup()
    const onToggleOption = vi.fn()
    render(
      <FacetChip
        facet={categories}
        value={{ kind: 'multi', values: [] }}
        onValueChange={vi.fn()}
        onToggleOption={onToggleOption}
      />,
    )
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    const group = screen.getByRole('group', { name: 'Category' })
    // two activations with no re-render in between: the intent seam keeps both
    await user.click(within(group).getByRole('button', { name: /Labs/ }))
    await user.click(within(group).getByRole('button', { name: /Imaging/ }))
    expect(onToggleOption.mock.calls).toEqual([
      ['labs', true],
      ['imaging', true],
    ])
  })

  it('shows the selected count and removable pills for a multi facet', async () => {
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
    expect(screen.getByRole('button', { name: 'Category: 2 selected' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Labs' }))
    expect(onValueChange).toHaveBeenCalledWith({ kind: 'multi', values: ['imaging'] })
  })

  it('single facets set the value and clear on a second click, without a pill', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetChip facet={source} value={{ kind: 'single', value: '' }} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Source' }))
    const group = screen.getByRole('group', { name: 'Source' })
    await user.click(within(group).getByRole('button', { name: 'Manual' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ kind: 'single', value: 'manual' })

    rerender(<FacetChip facet={source} value={{ kind: 'single', value: 'manual' }} onValueChange={onValueChange} />)
    expect(screen.queryByRole('button', { name: 'Remove Manual' })).not.toBeInTheDocument()
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

  it('does not render search at the threshold', async () => {
    const user = userEvent.setup()
    render(<FacetChip facet={eightOptions} value={{ kind: 'multi', values: [] }} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Eight/ }))
    expect(screen.queryByRole('textbox', { name: 'Search options' })).not.toBeInTheDocument()
  })

  it('reports the empty states', async () => {
    const user = userEvent.setup()
    const empty: FilterFacet = { id: 'empty', label: 'Empty', kind: 'multi', options: [] }
    render(<FacetChip facet={empty} value={{ kind: 'multi', values: [] }} onValueChange={vi.fn()} />)
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
        value={{ kind: 'multi', values: ['labs'] }}
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
        value={{ kind: 'multi', values: [] }}
        onValueChange={vi.fn()}
        formatCount={(count) => `${count}×`}
        labels={{ optionWithCount: (label, count) => `${label} (${count}×)` }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    expect(
      within(screen.getByRole('group', { name: 'Category' })).getByRole('button', { name: 'Labs (12×)' }),
    ).toBeInTheDocument()
  })

  it('has no axe violations closed', async () => {
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

  it('has no axe violations with the popover open', async () => {
    const user = userEvent.setup()
    render(<FacetChip facet={categories} value={{ kind: 'multi', values: [] }} onValueChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^Category/ }))
    expect(await openStateViolations()).toHaveNoViolations()
  })

  it('is keyboard operable: Enter opens, Tab reaches an option, Enter activates, Escape returns focus', async () => {
    const user = userEvent.setup()
    const onToggleOption = vi.fn()
    render(
      <FacetChip
        facet={categories}
        value={{ kind: 'multi', values: [] }}
        onValueChange={vi.fn()}
        onToggleOption={onToggleOption}
      />,
    )
    const trigger = screen.getByRole('button', { name: /^Category/ })
    trigger.focus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.tab()
    const group = screen.getByRole('group', { name: 'Category' })
    const focused = document.activeElement as HTMLElement
    expect(group.contains(focused)).toBe(true)
    expect(focused.tagName).toBe('BUTTON')

    await user.keyboard('{Enter}')
    expect(onToggleOption).toHaveBeenCalledTimes(1)
    expect(onToggleOption.mock.calls[0]?.[1]).toBe(true)

    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })

  it('exposes the neutral value helpers', () => {
    expect(defaultFilterValue(telemetry)).toEqual({ kind: 'toggle', on: false })
    expect(defaultFilterValue(source)).toEqual({ kind: 'single', value: '' })
    expect(defaultFilterValue(categories)).toEqual({ kind: 'multi', values: [] })
    expect(isDefaultValue({ kind: 'toggle', on: false })).toBe(true)
    expect(isDefaultValue({ kind: 'multi', values: ['labs'] })).toBe(false)
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
