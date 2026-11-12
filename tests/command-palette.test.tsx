import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { CommandPalette } from '../src/components/command-palette'
import type { CommandGroup, CommandItem } from '../src/components/command-list'

const groups: CommandGroup[] = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'new-note', label: 'New note' },
      { id: 'import', label: 'Import material' },
    ],
  },
]

function Harness({
  onSelect = () => {},
  onOpenChange,
}: {
  onSelect?: (item: CommandItem) => void
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open palette
      </button>
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          onOpenChange?.(next)
        }}
        query={query}
        onQueryChange={setQuery}
        groups={groups}
        onSelect={onSelect}
        ariaLabel="Command palette"
      />
    </>
  )
}

describe('CommandPalette', () => {
  it('opens as a modal, names the dialog and focuses the search field', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus())
  })

  it('selects the active command, closes and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    render(<Harness onSelect={onSelect} onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole('button', { name: 'Open palette' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'new-note' }),
      { groupId: 'actions', query: '' },
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('Escape closes and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open palette' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('ignores Escape while an IME composition is active', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    await screen.findByRole('dialog')
    const input = screen.getByRole('combobox')

    fireEvent.compositionStart(input)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.compositionEnd(input)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes via the close button', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes on an overlay click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    await screen.findByRole('dialog')
    const overlay = document.body.querySelector('[data-as="modal-overlay"]')
    expect(overlay).toBeInstanceOf(HTMLElement)
    await user.click(overlay as HTMLElement)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('does not select on Tab in the modal focus mode and traps focus in the dialog', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    await screen.findByRole('dialog')
    const input = screen.getByRole('combobox')
    await waitFor(() => expect(input).toHaveFocus())

    await user.tab()
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()

    await user.tab()
    expect(input).toHaveFocus()
  })

  it('has no axe violations when open', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    await screen.findByRole('dialog')
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
