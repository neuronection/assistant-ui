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
    await user.click(within(secondRow).getByRole('button', { name: 'Revoke' }))
    expect(onRevoke).toHaveBeenCalledWith('session-2')
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
    const busyButton = within(busyRow).getByRole('button', { name: 'Revoking…' })
    expect(busyButton).toBeDisabled()
    expect(busyButton).toHaveAttribute('aria-busy', 'true')
    expect(busyButton).toHaveAttribute('data-revoking')
    const idleButton = within(idleRow).getByRole('button', { name: 'Revoke' })
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

    const buttons = screen.getAllByRole('button', { name: 'Revoke' }) as HTMLElement[]
    await user.tab()
    expect(buttons[0]).toHaveFocus()
    await user.tab()
    expect(buttons[1]).toHaveFocus()

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
})
