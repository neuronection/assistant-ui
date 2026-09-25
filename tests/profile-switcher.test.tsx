import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  ProfileSwitcher,
  type ProfileItem,
} from '../src/components/profile-switcher'

const profiles: ProfileItem[] = [
  { id: 'p-default', name: 'Default', is_default: true },
  { id: 'p-berlin', name: 'Berlin', color: '#3366ff' },
  { id: 'p-cairo', name: 'Cairo' },
]

function renderSwitcher(
  props: Partial<React.ComponentProps<typeof ProfileSwitcher>> = {},
) {
  const onSelect = vi.fn()
  const onCreate = vi.fn()
  const onRename = vi.fn()
  const onDelete = vi.fn()
  const onSetDefault = vi.fn()
  const result = render(
    <ProfileSwitcher
      profiles={profiles}
      currentId="p-default"
      onSelect={onSelect}
      onCreate={onCreate}
      onRename={onRename}
      onDelete={onDelete}
      onSetDefault={onSetDefault}
      {...props}
    />,
  )
  return { ...result, onSelect, onCreate, onRename, onDelete, onSetDefault }
}

afterEach(() => cleanup())

describe('ProfileSwitcher', () => {
  it('renders the current profile on the trigger, panel closed', () => {
    renderSwitcher()
    const trigger = screen.getByRole('button', { name: 'Switch profile' })
    expect(trigger).toHaveTextContent('Default')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('lists profiles with current and default badges when open', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    const dialog = screen.getByRole('dialog', { name: 'Profiles' })
    expect(within(dialog).getByText('Berlin')).toBeInTheDocument()
    expect(within(dialog).getByText('Cairo')).toBeInTheDocument()
    expect(within(dialog).getByText('Current')).toBeInTheDocument()
    // "Default" appears twice inside the panel: the row name + the badge.
    expect(within(dialog).getAllByText('Default')).toHaveLength(2)
  })

  it('fires onSelect with the profile and closes the panel', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    await user.click(screen.getByRole('button', { name: /^Berlin/ }))
    expect(onSelect).toHaveBeenCalledWith(profiles[1])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('creates a profile from the form with a trimmed name (button and Enter)', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    await user.type(screen.getByRole('textbox', { name: 'New profile' }), '  Oslo  ')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith('Oslo')

    await user.type(screen.getByRole('textbox', { name: 'New profile' }), 'Lima')
    await user.keyboard('{Enter}')
    expect(onCreate).toHaveBeenCalledWith('Lima')
  })

  it('never creates from empty or whitespace-only names', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    const input = screen.getByRole('textbox', { name: 'New profile' })
    await user.type(input, '   ')
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    await user.keyboard('{Enter}')
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('renames inline: Enter saves the trimmed draft', async () => {
    const user = userEvent.setup()
    const { onRename } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    await user.click(screen.getByRole('button', { name: 'Rename Berlin' }))
    const input = screen.getByRole('textbox', { name: 'Rename Berlin' })
    expect(input).toHaveFocus()
    await user.clear(input)
    await user.type(input, 'Helsinki{Enter}')
    expect(onRename).toHaveBeenCalledWith(profiles[1], 'Helsinki')
  })

  it('Escape cancels the rename without saving, panel stays open', async () => {
    const user = userEvent.setup()
    const { onRename } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    await user.click(screen.getByRole('button', { name: 'Rename Berlin' }))
    await user.keyboard('{Escape}')
    expect(onRename).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox', { name: 'Rename Berlin' })).toBeNull()
    expect(screen.getByRole('dialog', { name: 'Profiles' })).toBeInTheDocument()
  })

  it('skips the rename round-trip when the name is unchanged', async () => {
    const user = userEvent.setup()
    const { onRename } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    await user.click(screen.getByRole('button', { name: 'Rename Berlin' }))
    await user.keyboard('{Enter}')
    expect(onRename).not.toHaveBeenCalled()
  })

  it('deletes with the owning profile', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    await user.click(screen.getByRole('button', { name: 'Delete Cairo' }))
    expect(onDelete).toHaveBeenCalledWith(profiles[2])
  })

  it('offers set-default only through onSetDefault and never on the default row', async () => {
    const user = userEvent.setup()
    const { onSetDefault } = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(screen.queryByRole('button', { name: /Make Default/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Make Cairo the default profile' }))
    expect(onSetDefault).toHaveBeenCalledWith(profiles[2])

    cleanup()
    renderSwitcher({ onSetDefault: undefined })
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(screen.queryByRole('button', { name: /default profile/ })).toBeNull()
  })

  it('keyboard: Tab reaches the trigger, Enter opens, Escape closes and restores focus', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Switch profile' })).toHaveFocus()
    await user.keyboard('{Enter}')
    const dialog = screen.getByRole('dialog', { name: 'Profiles' })
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Switch profile' })).toHaveFocus()
  })

  it('keyboard: open lands on the first row, Tab runs select → row actions', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(screen.getByRole('button', { name: /^Default/ })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Rename Default' })).toHaveFocus()
    // no set-default action on the default row — delete follows rename
    await user.tab()
    expect(screen.getByRole('button', { name: 'Delete Default' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /^Berlin/ })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Rename Berlin' })).toHaveFocus()
    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Make Berlin the default profile' }),
    ).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Delete Berlin' })).toHaveFocus()
  })

  it('shows loading and empty states', async () => {
    const user = userEvent.setup()
    renderSwitcher({ loading: true })
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(
      within(screen.getByRole('dialog', { name: 'Profiles' })).getByText(
        'Loading profiles…',
      ),
    ).toBeInTheDocument()

    cleanup()
    renderSwitcher({ profiles: [], currentId: null })
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(
      within(screen.getByRole('dialog', { name: 'Profiles' })).getByText(
        'No profiles yet',
      ),
    ).toBeInTheDocument()
  })

  it('surfaces errors with role="alert"', async () => {
    const user = userEvent.setup()
    renderSwitcher({ error: 'Boom' })
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Boom')
  })

  it('merges custom labels over the English defaults', async () => {
    const user = userEvent.setup()
    renderSwitcher({ labels: { trigger: 'Profil wechseln', panelTitle: 'Profile' } })
    await user.click(screen.getByRole('button', { name: 'Profil wechseln' }))
    expect(screen.getByRole('dialog', { name: 'Profile' })).toBeInTheDocument()
  })

  it('has no axe violations closed and open', async () => {
    const user = userEvent.setup()
    const { container } = renderSwitcher()
    expect(await axe(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: 'Switch profile' }))
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations()
  })
})
