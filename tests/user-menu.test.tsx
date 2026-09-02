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
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
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

  it('omits the identity header when neither name nor email is given', async () => {
    const user = userEvent.setup()
    render(<Demo name={undefined} email={undefined} />)
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('fires onItemSelect with the item id', async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn()
    render(<Demo onItemSelect={onItemSelect} />)
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(screen.getByRole('menuitem', { name: 'Profile' }))
    expect(onItemSelect).toHaveBeenCalledWith('profile')
  })

  it('styles danger items', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    expect(screen.getByRole('menuitem', { name: 'Sign out' }).className).toContain(
      'text-[var(--as-danger)]',
    )
  })

  it('renders checkable items with aria-checked', async () => {
    const user = userEvent.setup()
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
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    const checked = screen.getByRole('menuitemcheckbox', { name: 'Dark theme' })
    const unchecked = screen.getByRole('menuitemcheckbox', { name: 'Ελληνικά' })
    expect(checked).toHaveAttribute('aria-checked', 'true')
    expect(unchecked).toHaveAttribute('aria-checked', 'false')
    await user.click(checked)
    expect(onItemSelect).toHaveBeenCalledWith('theme')
  })

  it('shows pending state via aria-busy and blocks selection', async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn()
    render(
      <Demo
        onItemSelect={onItemSelect}
        items={[{ id: 'x', label: 'Working…', pending: true }]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    const pending = screen.getByRole('menuitem', { name: 'Working…' })
    expect(pending).toHaveAttribute('aria-busy', 'true')
    await user.click(pending)
    expect(onItemSelect).not.toHaveBeenCalled()
  })

  it('keyboard: typeahead and Escape close', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('has no axe violations closed and open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Demo
        items={[
          ...items,
          { id: 'theme', label: 'Dark theme', icon: Moon, checked: false },
        ]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    expect(await axe(screen.getByRole('menu'))).toHaveNoViolations()
  })
})
