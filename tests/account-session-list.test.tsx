import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  AccountSessionList,
  type AccountSessionRow,
} from '../src/components/account-session-list/AccountSessionList'

const labels = { current: 'This device', revoke: 'Revoke', revoking: 'Revoking…' }

const rows: AccountSessionRow[] = [
  {
    id: 'session-1',
    current: true,
    label: 'Chrome on Linux',
    details: ['Created 2026-11-01', 'Last seen 2026-11-13'],
    icon: <span data-testid="icon-1">💻</span>,
    badges: <span data-testid="badge-1">2FA</span>,
  },
  {
    id: 'session-2',
    label: 'Pixel 9',
    details: ['Last seen 2026-11-12'],
    icon: <span data-testid="icon-2">📱</span>,
  },
]

function rowElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-as="account-session-row"]'))
}

describe('AccountSessionList', () => {
  it('renders rows, labels, details, icons and badges', () => {
    const { container } = render(
      <AccountSessionList rows={rows} onRevoke={vi.fn()} labels={labels} />,
    )

    const rendered = rowElements(container)
    expect(rendered).toHaveLength(2)
    expect(within(rendered[0] as HTMLElement).getByText('Chrome on Linux')).toBeInTheDocument()
    expect(within(rendered[1] as HTMLElement).getByText('Pixel 9')).toBeInTheDocument()
    for (const detail of ['Created 2026-11-01', 'Last seen 2026-11-13', 'Last seen 2026-11-12']) {
      expect(screen.getByText(detail)).toBeInTheDocument()
    }
    expect(screen.getByTestId('icon-1')).toBeInTheDocument()
    expect(screen.getByTestId('icon-2')).toBeInTheDocument()
    expect(screen.getByTestId('badge-1')).toHaveTextContent('2FA')
  })

  it('marks only the current row with the current badge', () => {
    const { container } = render(
      <AccountSessionList rows={rows} onRevoke={vi.fn()} labels={labels} />,
    )

    const rendered = rowElements(container)
    expect(rendered[0]).toHaveAttribute('aria-current', 'true')
    expect(rendered[0]).toHaveAttribute('data-current')
    expect(within(rendered[0] as HTMLElement).getByText('This device')).toBeInTheDocument()
    expect(rendered[1]).not.toHaveAttribute('aria-current')
    expect(rendered[1]).not.toHaveAttribute('data-current')
    expect(within(rendered[1] as HTMLElement).queryByText('This device')).toBeNull()
  })

  it('revokes the row id from its button', async () => {
    const user = userEvent.setup()
    const onRevoke = vi.fn()
    const { container } = render(
      <AccountSessionList rows={rows} onRevoke={onRevoke} labels={labels} />,
    )

    const secondRow = rowElements(container)[1] as HTMLElement
    await user.click(within(secondRow).getByRole('button', { name: 'Revoke — Pixel 9' }))
    expect(onRevoke).toHaveBeenCalledWith('session-2')
  })

  it('names each revoke button with its row label', () => {
    const { container } = render(
      <AccountSessionList rows={rows} onRevoke={vi.fn()} labels={labels} />,
    )

    const buttons = screen.getAllByRole('button', { name: /^Revoke — / }) as HTMLElement[]
    const names = buttons.map((button) => button.getAttribute('aria-label'))
    expect(names).toEqual(['Revoke — Chrome on Linux', 'Revoke — Pixel 9'])
    expect(new Set(names).size).toBe(buttons.length)
    for (const button of buttons) {
      expect(button).toHaveTextContent('Revoke')
    }
    expect(within(rowElements(container)[0] as HTMLElement).getByText('Revoke')).toBeInTheDocument()
  })

  it('disables only the busy row and shows the revoking label', () => {
    const { container } = render(
      <AccountSessionList
        rows={rows}
        onRevoke={vi.fn()}
        busyId="session-1"
        labels={labels}
      />,
    )

    const [busyRow, idleRow] = rowElements(container) as [HTMLElement, HTMLElement]
    const busyButton = within(busyRow).getByRole('button', {
      name: 'Revoking… — Chrome on Linux',
    })
    expect(busyButton).toBeDisabled()
    expect(busyButton).toHaveAttribute('aria-busy', 'true')
    expect(busyButton).toHaveAttribute('data-revoking')
    expect(busyButton).toHaveTextContent('Revoking…')
    const idleButton = within(idleRow).getByRole('button', { name: 'Revoke — Pixel 9' })
    expect(idleButton).toBeEnabled()
    expect(idleButton).not.toHaveAttribute('aria-busy')
  })

  it('renders the empty state with the default and custom label', () => {
    const { container, rerender } = render(
      <AccountSessionList rows={[]} onRevoke={vi.fn()} labels={labels} />,
    )
    expect(screen.getByText('No active sessions')).toBeInTheDocument()
    expect(container.querySelector('[data-as="account-session-row"]')).toBeNull()

    rerender(
      <AccountSessionList rows={[]} onRevoke={vi.fn()} labels={{ ...labels, empty: 'No devices' }} />,
    )
    expect(screen.getByText('No devices')).toBeInTheDocument()
  })

  it('renders the header action slot', () => {
    render(
      <AccountSessionList
        rows={rows}
        onRevoke={vi.fn()}
        labels={labels}
        headerAction={<button type="button">Sign out other sessions</button>}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Sign out other sessions' }),
    ).toBeInTheDocument()
  })

  it('revokes from the keyboard with Tab, Enter and Space', async () => {
    const user = userEvent.setup()
    const onRevoke = vi.fn()
    render(<AccountSessionList rows={rows} onRevoke={onRevoke} labels={labels} />)

    const buttons = screen.getAllByRole('button', { name: /^Revoke — / }) as HTMLElement[]
    await user.tab()
    expect(buttons[0]).toHaveFocus()
    await user.tab()
    expect(buttons[1]).toHaveFocus()
    expect(buttons[0]).toHaveAccessibleName('Revoke — Chrome on Linux')
    expect(buttons[1]).toHaveAccessibleName('Revoke — Pixel 9')

    await user.keyboard('{Enter}')
    expect(onRevoke).toHaveBeenLastCalledWith('session-2')

    await user.keyboard(' ')
    expect(onRevoke).toHaveBeenLastCalledWith('session-2')
    expect(onRevoke).toHaveBeenCalledTimes(2)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <AccountSessionList
        rows={rows}
        onRevoke={vi.fn()}
        busyId="session-2"
        labels={labels}
        headerAction={<button type="button">Sign out other sessions</button>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders a revoked row with the signed-out badge and no revoke button', () => {
    const { container } = render(
      <AccountSessionList
        rows={[
          { id: 'session-1', label: 'Chrome on Linux', details: [], revoked: true },
          { id: 'session-2', label: 'Pixel 9', details: [] },
        ]}
        onRevoke={vi.fn()}
        labels={labels}
      />,
    )

    const [revokedRow, activeRow] = rowElements(container) as [HTMLElement, HTMLElement]
    expect(revokedRow).toHaveAttribute('data-revoked')
    expect(revokedRow).toHaveAttribute('data-revocable', 'false')
    expect(within(revokedRow).getByText('Signed out')).toBeInTheDocument()
    expect(
      revokedRow.querySelector('[data-as="account-session-revoked"]'),
    ).toHaveTextContent('Signed out')
    expect(within(revokedRow).queryByRole('button')).toBeNull()

    expect(activeRow).not.toHaveAttribute('data-revoked')
    expect(activeRow).not.toHaveAttribute('data-revocable')
    expect(within(activeRow).queryByText('Signed out')).toBeNull()
    expect(within(activeRow).getByRole('button', { name: 'Revoke — Pixel 9' })).toBeInTheDocument()
  })

  it('keeps revoking the remaining rows when another is revoked', async () => {
    const user = userEvent.setup()
    const onRevoke = vi.fn()
    const { container } = render(
      <AccountSessionList
        rows={[
          { id: 'session-1', label: 'Chrome on Linux', details: [], revoked: true },
          { id: 'session-2', label: 'Pixel 9', details: [] },
          { id: 'session-3', label: 'Safari on macOS', details: [] },
        ]}
        onRevoke={onRevoke}
        labels={labels}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(2)
    const thirdRow = rowElements(container)[2] as HTMLElement
    await user.click(within(thirdRow).getByRole('button', { name: 'Revoke — Safari on macOS' }))
    expect(onRevoke).toHaveBeenCalledWith('session-3')
    expect(onRevoke).toHaveBeenCalledTimes(1)
  })

  it('overrides the signed-out badge through labels.revoked', () => {
    render(
      <AccountSessionList
        rows={[{ id: 'session-1', label: 'Pixel 9', details: [], revoked: true }]}
        onRevoke={vi.fn()}
        labels={{ ...labels, revoked: 'Abgemeldet' }}
      />,
    )

    expect(screen.getByText('Abgemeldet')).toBeInTheDocument()
    expect(screen.queryByText('Signed out')).toBeNull()
  })

  it('hides only the non-revocable row action and keeps the row visible', () => {
    const { container } = render(
      <AccountSessionList
        rows={[
          { id: 'session-1', label: 'Chrome on Linux', details: ['Last seen 2026-11-13'] },
          { id: 'session-2', label: 'Pixel 9', details: [], revocable: false },
        ]}
        onRevoke={vi.fn()}
        labels={labels}
      />,
    )

    const [revocableRow, lockedRow] = rowElements(container) as [HTMLElement, HTMLElement]
    expect(revocableRow).not.toHaveAttribute('data-revocable')
    expect(within(revocableRow).getByRole('button', { name: 'Revoke — Chrome on Linux' })).toBeInTheDocument()

    expect(lockedRow).toHaveAttribute('data-revocable', 'false')
    expect(lockedRow).not.toHaveAttribute('data-revoked')
    expect(within(lockedRow).getByText('Pixel 9')).toBeInTheDocument()
    expect(within(lockedRow).queryByText('Signed out')).toBeNull()
    expect(within(lockedRow).queryByRole('button')).toBeNull()
    expect(screen.getAllByRole('button', { name: /^Revoke — / })).toHaveLength(1)
  })

  it('lets revoked win over revocable', () => {
    const { container } = render(
      <AccountSessionList
        rows={[
          { id: 'session-1', label: 'Chrome on Linux', details: [], revoked: true, revocable: true },
          { id: 'session-2', label: 'Pixel 9', details: [], revoked: true, revocable: false },
        ]}
        onRevoke={vi.fn()}
        labels={labels}
      />,
    )

    for (const row of rowElements(container) as HTMLElement[]) {
      expect(row).toHaveAttribute('data-revoked')
      expect(row).toHaveAttribute('data-revocable', 'false')
      expect(row.querySelector('[data-as="account-session-revoked"]')).toHaveTextContent('Signed out')
      expect(within(row).queryByRole('button')).toBeNull()
    }
    expect(screen.queryAllByRole('button', { name: /^Revoke — / })).toHaveLength(0)
  })

  it('shows both the current and signed-out badges when a row is current and revoked', () => {
    const { container } = render(
      <AccountSessionList
        rows={[
          { id: 'session-1', current: true, label: 'Chrome on Linux', details: [], revoked: true },
        ]}
        onRevoke={vi.fn()}
        labels={labels}
      />,
    )

    const row = rowElements(container)[0] as HTMLElement
    expect(row).toHaveAttribute('aria-current', 'true')
    expect(within(row).getByText('This device')).toBeInTheDocument()
    expect(
      row.querySelector('[data-as="account-session-revoked"]'),
    ).toHaveTextContent('Signed out')
    expect(within(row).queryByRole('button')).toBeNull()
  })

  it('keeps keyboard revocation working when rows are revoked or non-revocable', async () => {
    const user = userEvent.setup()
    const onRevoke = vi.fn()
    render(
      <AccountSessionList
        rows={[
          { id: 'session-1', label: 'Chrome on Linux', details: [], revoked: true },
          { id: 'session-2', label: 'Pixel 9', details: [], revocable: false },
          { id: 'session-3', label: 'Safari on macOS', details: [] },
        ]}
        onRevoke={onRevoke}
        labels={labels}
      />,
    )

    const buttons = screen.getAllByRole('button') as HTMLElement[]
    expect(buttons).toHaveLength(1)
    await user.tab()
    expect(buttons[0]).toHaveFocus()
    expect(buttons[0]).toHaveAccessibleName('Revoke — Safari on macOS')

    await user.keyboard('{Enter}')
    expect(onRevoke).toHaveBeenLastCalledWith('session-3')

    await user.keyboard(' ')
    expect(onRevoke).toHaveBeenLastCalledWith('session-3')
    expect(onRevoke).toHaveBeenCalledTimes(2)
  })

  it('has no axe violations with revoked and non-revocable rows', async () => {
    const { container } = render(
      <AccountSessionList
        rows={[
          { id: 'session-1', current: true, label: 'Chrome on Linux', details: [], revoked: true },
          { id: 'session-2', label: 'Pixel 9', details: [], revocable: false },
          { id: 'session-3', label: 'Safari on macOS', details: [] },
        ]}
        onRevoke={vi.fn()}
        busyId="session-3"
        labels={labels}
        headerAction={<button type="button">Sign out other sessions</button>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
