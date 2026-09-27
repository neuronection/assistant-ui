import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Globe, LogOut, Moon, Settings } from 'lucide-react'
import { UserMenu, type UserMenuItem } from '../src/components/user-menu/UserMenu'

const items: UserMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: Settings },
  { id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' },
]

function Demo(
  props: Partial<React.ComponentProps<typeof UserMenu>> & {
    items?: UserMenuItem[]
  },
) {
  return (
    <UserMenu
      name="Ilias Sdryom"
      email="ilias@neuronection.com"
      items={items}
      onItemSelect={vi.fn()}
      {...props}
    />
  )
}

function openMenu() {
  return userEvent.setup().click(screen.getByRole('button', { name: 'Open user menu' }))
}

afterEach(() => cleanup())

describe('UserMenu', () => {
  it('renders trigger with name and email, menu closed initially', () => {
    render(<Demo />)
    expect(screen.getByRole('button', { name: 'Open user menu' })).toBeInTheDocument()
    expect(screen.getByText('Ilias Sdryom')).toBeInTheDocument()
    expect(screen.getByText('ilias@neuronection.com')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens on click and renders the identity header inside the panel', async () => {
    render(<Demo />)
    await openMenu()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    // name appears both in the trigger and the panel header
    expect(screen.getAllByText('Ilias Sdryom')).toHaveLength(2)
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
  })

  it('derives initials from the name when no avatar is given', () => {
    render(<Demo email="x@y.z" />)
    expect(screen.getByText('IS')).toBeInTheDocument()
  })

  it('uses provided initials verbatim', () => {
    render(<Demo initials="XY" email={undefined} />)
    expect(screen.getByText('XY')).toBeInTheDocument()
  })

  it('falls back to a glyph disc without name/initials', () => {
    const { container } = render(<Demo name={undefined} email={undefined} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('uses the avatar image when avatarUrl is provided', () => {
    render(<Demo avatarUrl="/avatar.png" />)
    expect(screen.getByRole('button', { name: 'Open user menu' }).querySelector('img')).toHaveAttribute(
      'src',
      '/avatar.png',
    )
  })

  it('accepts the structured `user` prop', async () => {
    render(
      <Demo user={{ name: 'Maria Papadopoulou', email: 'maria@health-assistant.io' }} />,
    )
    await openMenu()
    expect(screen.getAllByText('Maria Papadopoulou')).toHaveLength(2)
    expect(screen.getAllByText('maria@health-assistant.io')).toHaveLength(2)
  })

  it('prefers `user` fields over the legacy flat props', async () => {
    render(
      <Demo user={{ name: 'Maria Papadopoulou', email: 'maria@health-assistant.io' }} />,
    )
    await openMenu()
    expect(screen.queryByText('Ilias Sdryom')).toBeNull()
    expect(screen.getAllByText('Maria Papadopoulou')).toHaveLength(2)
  })

  it('renders the role badge when a role is given', async () => {
    render(<Demo user={{ email: 'a@b.c', role: 'ADMIN' }} roleBadge="Administrator" />)
    await openMenu()
    const badge = screen.getByText('Administrator')
    expect(badge.className).toContain('rounded-full')
    // the badge prefers the translated label over the raw role string
    expect(screen.queryByText('ADMIN')).toBeNull()
  })

  it('falls back to the raw role when no roleBadge label is given', async () => {
    render(<Demo user={{ email: 'a@b.c', role: 'ADMIN' }} />)
    await openMenu()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('renders the switcher slot above the identity block', async () => {
    render(
      <Demo
        switcher={<button type="button">Workspace: Home</button>}
        labels={{ account: 'Account' }}
      />,
    )
    await openMenu()
    const menu = screen.getByRole('menu')
    const switcherButton = screen.getByRole('button', { name: 'Workspace: Home' })
    expect(menu).toContainElement(switcherButton)
    // the switcher sits before the identity header ("Account") in the panel
    expect(
      switcherButton.compareDocumentPosition(screen.getByText('Account')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders the status pill with the requested tone', async () => {
    render(<Demo status={{ label: 'Synced', tone: 'success' }} />)
    await openMenu()
    const pill = screen.getByText('Synced').closest('[data-as="user-menu-status"]')
    expect(pill).not.toBeNull()
    expect(pill!.className).toContain('text-[var(--as-success)]')
  })

  it('renders theme rows for the provided labels and reports the picked id', async () => {
    const onThemeChange = vi.fn()
    render(
      <Demo
        theme="light"
        onThemeChange={onThemeChange}
        themeLabels={{ light: 'Light theme', dark: 'Dark theme', system: 'System theme' }}
      />,
    )
    await openMenu()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Light theme' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'System theme' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await userEvent.setup().click(screen.getByRole('menuitemcheckbox', { name: 'Dark theme' }))
    expect(onThemeChange).toHaveBeenCalledWith('dark')
  })

  it('toggles a single-option theme row (Dark Mode only)', async () => {
    const onThemeChange = vi.fn()
    render(<Demo theme="dark" onThemeChange={onThemeChange} themeLabels={{ dark: 'Dark Mode' }} />)
    await openMenu()
    const dark = screen.getByRole('menuitemcheckbox', { name: 'Dark Mode' })
    expect(dark).toHaveAttribute('aria-checked', 'true')
    // selecting the active single option turns it off
    await userEvent.setup().click(dark)
    expect(onThemeChange).toHaveBeenCalledWith('light')
  })

  it('renders language rows as checkable items', async () => {
    const onLanguageChange = vi.fn()
    render(
      <Demo
        language="en"
        onLanguageChange={onLanguageChange}
        languages={[
          { id: 'en', label: 'English' },
          { id: 'el', label: 'Ελληνικά' },
        ]}
      />,
    )
    await openMenu()
    expect(screen.getByRole('menuitemcheckbox', { name: 'English' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await userEvent.setup().click(screen.getByRole('menuitemcheckbox', { name: 'Ελληνικά' }))
    expect(onLanguageChange).toHaveBeenCalledWith('el')
  })

  it('renders the logout row with the given label and danger tone', async () => {
    const onLogout = vi.fn()
    render(<Demo onLogout={onLogout} logoutLabel="Log out" items={[]} />)
    await openMenu()
    const logout = screen.getByRole('menuitem', { name: 'Log out' })
    expect(logout.className).toContain('text-[var(--as-danger)]')
    await userEvent.setup().click(logout)
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('defaults the logout label to English', async () => {
    render(<Demo onLogout={() => {}} items={[]} />)
    await openMenu()
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
  })

  it('keeps the identity header when only a role is given', async () => {
    render(<Demo name={undefined} email={undefined} user={{ role: 'ADMIN' }} />)
    await openMenu()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('omits the identity header when neither name nor email is given', async () => {
    render(<Demo name={undefined} email={undefined} />)
    await openMenu()
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('fires onItemSelect with the item id', async () => {
    const onItemSelect = vi.fn()
    render(<Demo onItemSelect={onItemSelect} />)
    await openMenu()
    await userEvent.setup().click(screen.getByRole('menuitem', { name: 'Profile' }))
    expect(onItemSelect).toHaveBeenCalledWith('profile')
  })

  it('styles danger items', async () => {
    render(<Demo />)
    await openMenu()
    expect(screen.getByRole('menuitem', { name: 'Sign out' }).className).toContain(
      'text-[var(--as-danger)]',
    )
  })

  it('renders checkable items with aria-checked', async () => {
    const onItemSelect = vi.fn()
    render(
      <Demo
        onItemSelect={onItemSelect}
        items={[
          { id: 'theme', label: 'Dark theme', icon: Moon, checked: true },
          { id: 'lang', label: 'Ελληνικά', icon: Globe, checked: false },
        ]}
      />,
    )
    await openMenu()
    const checked = screen.getByRole('menuitemcheckbox', { name: 'Dark theme' })
    const unchecked = screen.getByRole('menuitemcheckbox', { name: 'Ελληνικά' })
    expect(checked).toHaveAttribute('aria-checked', 'true')
    expect(unchecked).toHaveAttribute('aria-checked', 'false')
    await userEvent.setup().click(checked)
    expect(onItemSelect).toHaveBeenCalledWith('theme')
  })

  it('shows pending state via aria-busy and blocks selection', async () => {
    const onItemSelect = vi.fn()
    render(
      <Demo
        onItemSelect={onItemSelect}
        items={[{ id: 'x', label: 'Working…', pending: true }]}
      />,
    )
    await openMenu()
    const pending = screen.getByRole('menuitem', { name: 'Working…' })
    expect(pending).toHaveAttribute('aria-busy', 'true')
    await userEvent.setup().click(pending)
    expect(onItemSelect).not.toHaveBeenCalled()
  })

  it('keyboard: typeahead and Escape close', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('keyboard: arrows move focus between items and close returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const trigger = screen.getByRole('button', { name: 'Open user menu' })
    await user.click(trigger)
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })

  it('typing in a switcher-slot input is not hijacked by menu typeahead', async () => {
    const user = userEvent.setup()
    render(
      <Demo
        switcher={
          <div>
            <input type="text" aria-label="Search workspaces" />
            <button type="button">Workspace: Home</button>
          </div>
        }
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    const input = screen.getByLabelText('Search workspaces')
    await user.click(input)
    await user.keyboard('profile')
    expect(input).toHaveValue('profile')
    expect(input).toHaveFocus()
    // menu items are still reachable and selectable afterwards
    await user.click(screen.getByRole('menuitem', { name: 'Profile' }))
  })

  it('has no axe violations closed and open', async () => {
    const { container } = render(
      <Demo
        user={{ name: 'Ilias Sdryom', email: 'ilias@neuronection.com', role: 'ADMIN' }}
        roleBadge="Administrator"
        // presentational switcher content — a `menu` expects menuitem
        // descendants, so app-owned interactive switchers inside the slot
        // are the app's axe surface (see docs/accessibility.md)
        switcher={<div>Workspace: Neuronection</div>}
        status={{ label: 'Synced', tone: 'success' }}
        theme="light"
        onThemeChange={() => {}}
        themeLabels={{ light: 'Light theme', dark: 'Dark theme' }}
        language="en"
        onLanguageChange={() => {}}
        languages={[
          { id: 'en', label: 'English' },
          { id: 'el', label: 'Ελληνικά' },
        ]}
        onLogout={() => {}}
        labels={{ account: 'Account' }}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open user menu' }))
    expect(await axe(screen.getByRole('menu'))).toHaveNoViolations()
  })
})
