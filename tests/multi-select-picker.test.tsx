import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  MultiSelectPicker,
  PickerBulkSelect,
  type MultiSelectPickerProps,
  type PickerOption,
  type PickerSelection,
} from '../src/components/multi-select-picker'

const options: PickerOption[] = [
  { value: 'python', label: 'Python', category: 'Engineering' },
  { value: 'typescript', label: 'TypeScript', category: 'Engineering' },
  { value: 'excel', label: 'Excel', category: 'Office' },
  { value: 'nursing', label: 'Nursing', category: 'Health' },
]
const [python, typescript] = options as [PickerOption, PickerOption, ...PickerOption[]]

function Demo(props: Partial<MultiSelectPickerProps>) {
  const [value, setValue] = React.useState<PickerSelection[]>(props.value ?? [])
  return (
    <MultiSelectPicker
      options={options}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next)
        props.onChange?.(next)
      }}
    />
  )
}

describe('MultiSelectPicker type-ahead', () => {
  it('filters options as you type and excludes the current selection', async () => {
    const user = userEvent.setup()
    render(<Demo value={[python]} />)
    const input = screen.getByRole('combobox', { name: 'Search options' })
    await user.type(input, 's')
    expect(await screen.findByRole('option', { name: /TypeScript/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Nursing/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Python/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Excel/ })).not.toBeInTheDocument()
  })

  it('shows the empty label when nothing matches', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.type(screen.getByRole('combobox', { name: 'Search options' }), 'zzz')
    expect(await screen.findByText('No matches')).toBeInTheDocument()
  })

  it('Enter adds the active option and clears the query (keyboard)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Demo onChange={onChange} />)
    const input = screen.getByRole('combobox', { name: 'Search options' })
    await user.type(input, 'nurs')
    await screen.findByRole('option', { name: /Nursing/ })
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith([
      { value: 'nursing', label: 'Nursing', category: 'Health' },
    ])
    expect(input).toHaveValue('')
  })

  it('clicking a result adds it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Demo onChange={onChange} />)
    await user.type(screen.getByRole('combobox', { name: 'Search options' }), 'excel')
    await user.click(await screen.findByRole('option', { name: /Excel/ }))
    expect(onChange).toHaveBeenCalledWith([
      { value: 'excel', label: 'Excel', category: 'Office' },
    ])
  })

  it('Arrow/Home/End move the active option (keyboard)', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const input = screen.getByRole('combobox', { name: 'Search options' })
    await user.type(input, 's')
    const listbox = await screen.findByRole('listbox')
    const activeId = () => input.getAttribute('aria-activedescendant')
    expect(activeId()).toBe(`${listbox.id}-opt-0`)
    await user.keyboard('{ArrowDown}')
    expect(activeId()).toBe(`${listbox.id}-opt-1`)
    await user.keyboard('{ArrowUp}')
    expect(activeId()).toBe(`${listbox.id}-opt-0`)
    await user.keyboard('{End}')
    expect(activeId()).toBe(`${listbox.id}-opt-1`)
    await user.keyboard('{Home}')
    expect(activeId()).toBe(`${listbox.id}-opt-0`)
    expect(within(listbox).getByRole('option', { name: /TypeScript/ })).toHaveAttribute(
      'data-active',
    )
  })

  it('Escape closes the listbox but keeps the query (keyboard)', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const input = screen.getByRole('combobox', { name: 'Search options' })
    await user.type(input, 'nurs')
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('nurs')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('searches through onSearch in server mode', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(async (query: string) =>
      options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
    )
    render(<Demo onSearch={onSearch} />)
    await user.type(screen.getByRole('combobox', { name: 'Search options' }), 'nu')
    expect(await screen.findByRole('option', { name: /Nursing/ })).toBeInTheDocument()
    expect(onSearch).toHaveBeenCalledWith('nu')
    expect(screen.queryByRole('option', { name: /Python/ })).not.toBeInTheDocument()
  })
})

describe('MultiSelectPicker chips', () => {
  it('renders chips and removes one per chip button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Demo value={[python, typescript]} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Remove Python' }))
    expect(onChange).toHaveBeenCalledWith([
      { value: 'typescript', label: 'TypeScript', category: 'Engineering' },
    ])
  })

  it('single mode replaces the selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Demo mode="single" value={[python]} onChange={onChange} />)
    await user.type(screen.getByRole('combobox', { name: 'Search options' }), 'nurs')
    await screen.findByRole('option', { name: /Nursing/ })
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith([
      { value: 'nursing', label: 'Nursing', category: 'Health' },
    ])
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('PickerBrowseModal', () => {
  it('opens from the browse button and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Browse catalog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('toggles rows Add → Added → Add and shows the live count', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const dialog = await (async () => {
      await user.click(screen.getByRole('button', { name: 'Browse' }))
      return screen.findByRole('dialog')
    })()
    expect(within(dialog).getByText('0 selected')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Add Python' }))
    expect(within(dialog).getByRole('button', { name: 'Added Python' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(dialog).getByText('1 selected')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Added Python' }))
    expect(within(dialog).getByRole('button', { name: 'Add Python' })).toBeInTheDocument()
    expect(within(dialog).getByText('0 selected')).toBeInTheDocument()
  })

  it('filters by search and category inside the modal', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByRole('searchbox'), 'nurs')
    expect(within(dialog).getByRole('button', { name: 'Add Nursing' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add Python' })).not.toBeInTheDocument()
    await user.clear(within(dialog).getByRole('searchbox'))
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Category' }), 'Office')
    expect(within(dialog).getByRole('button', { name: 'Add Excel' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add Python' })).not.toBeInTheDocument()
  })

  it('paginates a long option list with Load more', async () => {
    const user = userEvent.setup()
    render(<Demo pageSize={2} />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Load more' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add Nursing' })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Load more' }))
    expect(within(dialog).getByRole('button', { name: 'Add Nursing' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('appends server pages through onLoadMore until exhausted', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(async () => options.slice(0, 2))
    const onLoadMore = vi
      .fn()
      .mockResolvedValueOnce(options.slice(2, 3))
      .mockResolvedValueOnce([])
    render(<Demo onSearch={onSearch} onLoadMore={onLoadMore} />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(
      await within(dialog).findByRole('button', { name: 'Load more' }, { timeout: 2000 }),
    )
    expect(onLoadMore).toHaveBeenCalledWith('', null, 2)
    expect(
      await within(dialog).findByRole('button', { name: 'Add Excel' }),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Load more' }))
    await vi.waitFor(() =>
      expect(within(dialog).queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument(),
    )
  })

  it('single mode picks and closes the modal', async () => {
    const user = userEvent.setup()
    render(<Demo mode="single" />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Add Nursing' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('Done closes the modal', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('MultiSelectPicker slots', () => {
  it('renders renderChipExtra content inside each chip before the label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Demo
        value={[python]}
        onChange={onChange}
        renderChipExtra={(selection) => <span data-testid="chip-extra">{selection.category}</span>}
      />,
    )
    const chip = screen.getByRole('listitem')
    expect(within(chip).getByTestId('chip-extra')).toHaveTextContent('Engineering')
    expect(chip.textContent).toMatch(/EngineeringPython/)
    await user.click(screen.getByRole('button', { name: 'Remove Python' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('showChips=false hides the chip list (host renders selections itself)', () => {
    render(<Demo value={[python, typescript]} showChips={false} />)
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove Python' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Search options' })).toBeInTheDocument()
  })

  it('forwards browseModalProps to the internal browse modal', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(async () => [python])
    render(
      <Demo
        browseModalProps={{
          title: 'Pick a skill',
          onSearch,
          labels: { doneLabel: 'Close it' },
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Pick a skill')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Close it' })).toBeInTheDocument()
    await user.type(within(dialog).getByRole('searchbox'), 'py')
    expect(await within(dialog).findByRole('button', { name: 'Add Python' })).toBeInTheDocument()
    await vi.waitFor(() => expect(onSearch).toHaveBeenCalledWith('py', null))
  })
})

describe('PickerBrowseModal slots', () => {
  it('renderRowContent replaces the row text while the named toggle stays', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        browseModalProps={{
          renderRowContent: (option, selected, ctx) => (
            <div className="flex-1">
              <span>{option.label}</span>
              <em data-testid="row-note">{selected ? 'picked' : option.category}</em>
              <em data-testid="row-query">{ctx.search}</em>
            </div>
          ),
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getAllByTestId('row-note')[0]).toHaveTextContent('Engineering')
    await user.type(within(dialog).getByRole('searchbox'), 'py')
    expect(within(dialog).getAllByTestId('row-query')[0]).toHaveTextContent('py')
    await user.clear(within(dialog).getByRole('searchbox'))
    await user.click(within(dialog).getByRole('button', { name: 'Add Python' }))
    expect(within(dialog).getAllByTestId('row-note')[0]).toHaveTextContent('picked')
    expect(within(dialog).getByRole('button', { name: 'Added Python' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('filterOption narrows the rendered rows without touching pagination', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        browseModalProps={{
          pageSize: 1,
          filterOption: (option) => option.category === 'Engineering',
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Add Python' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add TypeScript' })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add Excel' })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Load more' }))
    expect(within(dialog).getByRole('button', { name: 'Add TypeScript' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add Excel' })).not.toBeInTheDocument()
  })

  it('supports a controlled category with onCategoryChange reports', async () => {
    const user = userEvent.setup()
    const onCategoryChange = vi.fn()
    render(
      <Demo browseModalProps={{ category: 'Office', onCategoryChange }} />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    const select = within(dialog).getByRole('combobox', { name: 'Category' })
    expect(select).toHaveValue('Office')
    await user.selectOptions(select, 'Health')
    expect(onCategoryChange).toHaveBeenCalledWith('Health')
    expect(select).toHaveValue('Office')
  })

  it('renderBody composes the body from the ctx nodes and keeps ctx.toggle working', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        browseModalProps={{
          renderBody: (ctx) => (
            <div>
              <div data-testid="custom-chrome">{ctx.category || 'all'}</div>
              <button type="button" onClick={() => ctx.onSearchChange('py')}>
                run host search
              </button>
              {ctx.searchInput}
              {ctx.list}
            </div>
          ),
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByTestId('custom-chrome')).toHaveTextContent('all')
    expect(within(dialog).queryByRole('combobox', { name: 'Category' })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'run host search' }))
    expect(within(dialog).getByRole('searchbox')).toHaveValue('py')
    await user.click(within(dialog).getByRole('button', { name: 'Add Python' }))
    expect(within(dialog).getByRole('button', { name: 'Added Python' })).toBeInTheDocument()
    expect(within(dialog).getByText('1 selected')).toBeInTheDocument()
  })

  it('a falsy renderBody result falls back to the default body', async () => {
    const user = userEvent.setup()
    render(<Demo browseModalProps={{ renderBody: () => null }} />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('searchbox')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Add Python' })).toBeInTheDocument()
  })

  it('hasMore=false hides the Load more button in server mode', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(async () => options.slice(0, 2))
    const onLoadMore = vi.fn()
    render(
      <Demo
        onSearch={onSearch}
        onLoadMore={onLoadMore}
        browseModalProps={{ hasMore: false }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('button', { name: 'Add Python' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('reloadKey re-runs the current search when host filters change', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(async () => [python])
    const { rerender } = render(
      <Demo browseModalProps={{ onSearch, reloadKey: 'scope-a' }} />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await vi.waitFor(() => expect(onSearch).toHaveBeenCalled())
    const before = onSearch.mock.calls.length
    rerender(<Demo browseModalProps={{ onSearch, reloadKey: 'scope-b' }} />)
    await vi.waitFor(() => expect(onSearch.mock.calls.length).toBeGreaterThan(before))
  })

  it('a slotted modal has no axe violations', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        browseModalProps={{
          renderRowContent: (option) => <span>{option.label}</span>,
          renderBody: (ctx) => (
            <div>
              {ctx.filters}
              {ctx.list}
            </div>
          ),
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await screen.findByRole('dialog')
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('PickerBrowseModal bulk select', () => {
  it('is opt-in: no bulk control unless selectAll is set', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('selects every matching option, reports the count and flips to clear', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Demo onChange={onChange} browseModalProps={{ selectAll: true }} />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    const control = within(dialog).getByRole('checkbox', { name: 'Select all (4)' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    await user.click(control)
    expect(onChange).toHaveBeenLastCalledWith(options)
    expect(within(dialog).getByText('4 selected')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('checkbox', { name: 'Clear selection' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(within(dialog).getByRole('button', { name: 'Added Python' })).toBeInTheDocument()
  })

  it('unchecking clears only the matching options, never the rest', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Demo
        value={[python]}
        onChange={onChange}
        browseModalProps={{ selectAll: true }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Category' }), 'Office')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Select all (1)' }))
    expect(onChange).toHaveBeenLastCalledWith([python, options[2]])
    await user.click(within(dialog).getByRole('checkbox', { name: 'Clear selection' }))
    expect(onChange).toHaveBeenLastCalledWith([python])
  })

  it('scopes the bulk action to the active search and shows the mixed state', async () => {
    const user = userEvent.setup()
    render(<Demo value={[python]} browseModalProps={{ selectAll: true }} />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('checkbox', { name: 'Select all (4)' }),
    ).toHaveAttribute('aria-checked', 'mixed')
    await user.type(within(dialog).getByRole('searchbox'), 'script')
    expect(
      within(dialog).getByRole('checkbox', { name: 'Select all (1)' }),
    ).toHaveAttribute('aria-checked', 'false')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Select all (1)' }))
    expect(within(dialog).getByRole('button', { name: 'Added TypeScript' })).toBeInTheDocument()
    expect(within(dialog).getByText('2 selected')).toBeInTheDocument()
    await user.clear(within(dialog).getByRole('searchbox'))
    expect(within(dialog).getByRole('button', { name: 'Added Python' })).toBeInTheDocument()
  })

  it('records the whole matching page beyond pagination in server mode', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Demo
        pageSize={1}
        onChange={onChange}
        browseModalProps={{ selectAll: true }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: 'Add Nursing' })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('checkbox', { name: 'Select all (4)' }))
    expect(onChange).toHaveBeenLastCalledWith(options)
  })

  it('exposes selectAll + matching + toggleAll to renderBody hosts', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        browseModalProps={{
          selectAll: true,
          renderBody: (ctx) => (
            <div>
              <p data-testid="matching-count">{ctx.matching.length}</p>
              <button type="button" onClick={ctx.toggleAll}>
                host bulk
              </button>
              {ctx.filters}
              {ctx.list}
            </div>
          ),
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByTestId('matching-count')).toHaveTextContent('4')
    await user.click(within(dialog).getByRole('button', { name: 'host bulk' }))
    expect(within(dialog).getByText('4 selected')).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('checkbox', { name: /Select all/ }),
    ).not.toBeInTheDocument()
  })

  it('keeps labels overridable and has no axe violations', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        browseModalProps={{
          selectAll: true,
          labels: {
            selectAllLabel: 'Alle auswählen',
            clearSelectionLabel: 'Auswahl aufheben',
          },
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Alle auswählen (4)' }))
    expect(
      within(dialog).getByRole('checkbox', { name: 'Auswahl aufheben' }),
    ).toBeInTheDocument()
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('PickerBulkSelect (standalone)', () => {
  function Harness({
    count,
    pickedCount,
    onToggle,
  }: {
    count: number
    pickedCount: number
    onToggle: () => void
  }) {
    return (
      <PickerBulkSelect
        count={count}
        pickedCount={pickedCount}
        label={`Select all (${count})`}
        clearLabel="Clear selection"
        onToggle={onToggle}
      />
    )
  }

  it('renders nothing for an empty scope', () => {
    const { container } = render(<Harness count={0} pickedCount={0} onToggle={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('drives the tri-state from the counts and reports the toggle', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const { rerender } = render(<Harness count={5} pickedCount={0} onToggle={onToggle} />)
    expect(screen.getByRole('checkbox', { name: 'Select all (5)' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    rerender(<Harness count={5} pickedCount={2} onToggle={onToggle} />)
    expect(screen.getByRole('checkbox', { name: 'Select all (5)' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    )
    rerender(<Harness count={5} pickedCount={5} onToggle={onToggle} />)
    const all = screen.getByRole('checkbox', { name: 'Clear selection' })
    expect(all).toHaveAttribute('aria-checked', 'true')
    await user.click(all)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('is keyboard-operable as a checkbox and has no axe violations', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<Harness count={3} pickedCount={1} onToggle={onToggle} />)
    const control = screen.getByRole('checkbox', { name: 'Select all (3)' })
    control.focus()
    await user.keyboard('{Enter}')
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('MultiSelectPicker accessibility', () => {
  it('open listbox has no axe violations', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.type(screen.getByRole('combobox', { name: 'Search options' }), 's')
    await screen.findByRole('listbox')
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })

  it('open browse modal has no axe violations', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await screen.findByRole('dialog')
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})
