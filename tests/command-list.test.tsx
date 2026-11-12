import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { CommandList, type CommandGroup, type CommandItem } from '../src/components/command-list'

const groups: CommandGroup[] = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      {
        id: 'new-note',
        label: 'New note',
        hint: 'Create a blank note',
        keywords: ['write', 'capture'],
        shortcut: 'N',
      },
      {
        id: 'import',
        label: 'Import material',
        hint: 'Upload a PDF',
        keywords: ['upload', 'pdf'],
      },
    ],
  },
  {
    id: 'recents',
    label: 'Recent',
    filter: 'none',
    items: [{ id: 'recent-1', label: 'Algebra notes' }],
  },
]

function Harness({
  onSelect = () => {},
  initialQuery = '',
  activeId,
  onActiveIdChange,
  tabBehavior,
}: {
  onSelect?: (item: CommandItem, context: { groupId: string; query: string }) => void
  initialQuery?: string
  activeId?: string
  onActiveIdChange?: (id: string) => void
  tabBehavior?: 'select' | 'focus'
}) {
  const [query, setQuery] = React.useState(initialQuery)
  return (
    <CommandList
      query={query}
      onQueryChange={setQuery}
      groups={groups}
      onSelect={onSelect}
      activeId={activeId}
      onActiveIdChange={onActiveIdChange}
      tabBehavior={tabBehavior}
      labels={{ title: 'Commands', results: '{count} results' }}
    />
  )
}

function option(label: string): HTMLElement {
  const node = screen.getByText(label).closest('[role="option"]')
  if (!(node instanceof HTMLElement)) {
    throw new Error(`No option for ${label}`)
  }
  return node
}

describe('CommandList', () => {
  it('renders groups, items and the result count', () => {
    render(<Harness />)
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Recent')).toBeInTheDocument()
    expect(screen.getByText('New note')).toBeInTheDocument()
    expect(screen.getByText('3 results')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Commands' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: 'Commands' })).toBeInTheDocument()
  })

  it('filters by label, hint and keywords, keeping app-ordered groups untouched', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Commands' })

    await user.type(input, 'blank')
    expect(screen.getByText('New note')).toBeInTheDocument()
    expect(screen.queryByText('Import material')).not.toBeInTheDocument()
    expect(screen.getByText('Algebra notes')).toBeInTheDocument()
    expect(screen.getByText('2 results')).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'upload')
    expect(screen.getByText('Import material')).toBeInTheDocument()
    expect(screen.queryByText('New note')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'zzzz')
    expect(screen.queryByText('New note')).not.toBeInTheDocument()
    expect(screen.getByText('Algebra notes')).toBeInTheDocument()
    expect(screen.getByText('1 results')).toBeInTheDocument()
  })

  it('renders the empty state and a zero result count', async () => {
    const user = userEvent.setup()
    const withoutAsync: CommandGroup[] = [groups[0]!]
    function EmptyHarness() {
      const [query, setQuery] = React.useState('')
      return (
        <CommandList
          query={query}
          onQueryChange={setQuery}
          groups={withoutAsync}
          onSelect={() => {}}
          labels={{ empty: 'Nothing here', results: '{count} results' }}
        />
      )
    }
    render(<EmptyHarness />)
    await user.type(screen.getByRole('combobox'), 'zzzz')
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('0 results')).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('exposes disabled items but never selects them', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const disabledGroups: CommandGroup[] = [
      {
        id: 'actions',
        label: 'Actions',
        items: [
          { id: 'locked', label: 'Locked action', disabled: true, disabledReason: 'Needs a plan' },
          { id: 'open', label: 'Open action' },
        ],
      },
    ]
    function DisabledHarness() {
      const [query, setQuery] = React.useState('')
      return (
        <CommandList
          query={query}
          onQueryChange={setQuery}
          groups={disabledGroups}
          onSelect={onSelect}
        />
      )
    }
    render(<DisabledHarness />)
    const locked = option('Locked action')
    expect(locked).toHaveAttribute('aria-disabled', 'true')
    expect(locked).toHaveAttribute('title', 'Needs a plan')
    expect(screen.getByText('Needs a plan')).toBeInTheDocument()
    expect(option('Open action')).toHaveAttribute('data-active')

    await user.click(locked)
    expect(onSelect).not.toHaveBeenCalled()

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'open' }),
      { groupId: 'actions', query: '' },
    )
  })

  it('moves the active item with arrows, Home/End and wraps across enabled options', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('combobox')
    await user.click(input)
    expect(option('New note')).toHaveAttribute('data-active')

    await user.keyboard('{ArrowDown}')
    expect(option('Import material')).toHaveAttribute('data-active')
    await user.keyboard('{ArrowDown}')
    expect(option('Algebra notes')).toHaveAttribute('data-active')
    await user.keyboard('{ArrowDown}')
    expect(option('New note')).toHaveAttribute('data-active')
    await user.keyboard('{ArrowUp}')
    expect(option('Algebra notes')).toHaveAttribute('data-active')
    await user.keyboard('{Home}')
    expect(option('New note')).toHaveAttribute('data-active')
    await user.keyboard('{End}')
    expect(option('Algebra notes')).toHaveAttribute('data-active')
  })

  it('selects on click and keeps the active option wired through aria-activedescendant', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    const activeOption = option('New note')
    expect(input).toHaveAttribute('aria-activedescendant', activeOption.id)
    expect(activeOption).toHaveAttribute('aria-selected', 'true')

    await user.click(option('Import material'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'import' }),
      { groupId: 'actions', query: '' },
    )
  })

  it('selects on Enter and reports the group and query', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} initialQuery="import" />)
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'import' }),
      { groupId: 'actions', query: 'import' },
    )
  })

  it('selects on Tab only in select mode', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { unmount } = render(<Harness onSelect={onSelect} />)
    await user.click(screen.getByRole('combobox'))
    await user.tab()
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'new-note' }),
      { groupId: 'actions', query: '' },
    )
    unmount()

    const focusSelect = vi.fn()
    render(<Harness onSelect={focusSelect} tabBehavior="focus" />)
    await user.click(screen.getByRole('combobox'))
    await user.tab()
    expect(focusSelect).not.toHaveBeenCalled()
  })

  it('ignores Enter while an IME composition is active', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    await user.click(input)

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledTimes(1)

    onSelect.mockClear()
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('resets a removed active item to the first visible option when filtering', async () => {
    const user = userEvent.setup()
    const onActiveIdChange = vi.fn()
    render(<Harness activeId="import" onActiveIdChange={onActiveIdChange} />)
    await user.type(screen.getByRole('combobox'), 'new')
    await waitFor(() => expect(onActiveIdChange).toHaveBeenCalledWith('new-note'))
    expect(option('New note')).toHaveAttribute('data-active')
  })

  it('reports active changes for the controlled contract', async () => {
    const user = userEvent.setup()
    const onActiveIdChange = vi.fn()
    render(<Harness activeId="new-note" onActiveIdChange={onActiveIdChange} />)
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}')
    expect(onActiveIdChange).toHaveBeenCalledWith('import')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Harness />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
