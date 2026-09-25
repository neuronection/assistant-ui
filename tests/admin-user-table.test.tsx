import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Clock } from 'lucide-react'
import type { ComponentProps } from 'react'

import {
  AdminUserTable,
  describeAdminUserError,
  type AdminUser,
} from '../src/components/admin-user-table'

const users: AdminUser[] = [
  {
    id: 'u-admin',
    email: 'ada@example.com',
    full_name: 'Ada Lovelace',
    is_admin: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    activity_count: 12,
  },
  {
    id: 'u-plain',
    email: 'grace@example.com',
    full_name: '',
    is_admin: false,
    is_active: false,
    created_at: '2026-02-01T00:00:00Z',
    activity_count: 0,
  },
]

function renderTable(props: Partial<ComponentProps<typeof AdminUserTable>> = {}) {
  const onPatch = vi.fn()
  const onResetPassword = vi.fn()
  const onForceLogout = vi.fn()
  const result = render(
    <AdminUserTable
      users={users}
      currentUserId="u-admin"
      onPatch={onPatch}
      onResetPassword={onResetPassword}
      onForceLogout={onForceLogout}
      {...props}
    />,
  )
  return { ...result, onPatch, onResetPassword, onForceLogout }
}

describe('AdminUserTable', () => {
  it('renders email, "(you)" marker, activity count, role and status per row', () => {
    renderTable()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()
    expect(screen.getByText('(you)')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Activity' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]!).getByText('12')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Admin')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Active')).toBeInTheDocument()
    expect(within(rows[2]!).getByText('0')).toBeInTheDocument()
    expect(within(rows[2]!).getByText('User')).toBeInTheDocument()
    expect(within(rows[2]!).getByText('Disabled')).toBeInTheDocument()
  })

  it('shows loading, empty and error states', () => {
    const { rerender } = renderTable({ loading: true, users: [] })
    expect(screen.getByText('Loading users…')).toBeInTheDocument()
    rerender(
      <AdminUserTable
        users={[]}
        currentUserId="u-admin"
        onPatch={vi.fn()}
        onResetPassword={vi.fn()}
        onForceLogout={vi.fn()}
      />,
    )
    expect(screen.getByText('No users')).toBeInTheDocument()
    rerender(
      <AdminUserTable
        users={[]}
        currentUserId="u-admin"
        onPatch={vi.fn()}
        onResetPassword={vi.fn()}
        onForceLogout={vi.fn()}
        error="Boom"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Boom')
  })

  it('promote/demote and activate/deactivate report sparse patches', async () => {
    const user = userEvent.setup()
    const { onPatch } = renderTable()
    await user.click(screen.getByRole('button', { name: 'Remove admin' }))
    expect(onPatch).toHaveBeenCalledWith(users[0], { is_admin: false })
    await user.click(screen.getByRole('button', { name: 'Deactivate' }))
    expect(onPatch).toHaveBeenCalledWith(users[0], { is_active: false })
    await user.click(screen.getByRole('button', { name: 'Make admin' }))
    expect(onPatch).toHaveBeenCalledWith(users[1], { is_admin: true })
    await user.click(screen.getByRole('button', { name: 'Activate' }))
    expect(onPatch).toHaveBeenCalledWith(users[1], { is_active: true })
  })

  it('opens the reset panel focused, enforces the minimum length and submits', async () => {
    const user = userEvent.setup()
    const { onResetPassword } = renderTable()
    await user.click(screen.getAllByRole('button', { name: 'Reset password' })[0]!)
    const input = screen.getByLabelText('New password')
    await waitFor(() => expect(input).toHaveFocus())
    expect(screen.getByText('At least 10 characters')).toBeInTheDocument()
    const submit = screen.getByRole('button', { name: 'Set password' })
    expect(submit).toBeDisabled()
    await user.type(input, 'short')
    expect(submit).toBeDisabled()
    await user.type(input, 'enough-123')
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(onResetPassword).toHaveBeenCalledWith(users[0], 'shortenough-123')
    await screen.findByText('Password for ada@example.com updated — share it out of band.')
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
  })

  it('closes the reset panel on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    renderTable()
    const triggers = screen.getAllByRole('button', { name: 'Reset password' })
    await user.click(triggers[1]!)
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
    await waitFor(() => expect(triggers[1]!).toHaveFocus())
  })

  it('force logout reports the user', async () => {
    const user = userEvent.setup()
    const { onForceLogout } = renderTable()
    await user.click(screen.getAllByRole('button', { name: 'Force logout' })[1]!)
    expect(onForceLogout).toHaveBeenCalledWith(users[1])
  })

  it('surfaces guard-rail 403s as friendly messages', async () => {
    const user = userEvent.setup()
    const { onPatch } = renderTable()
    onPatch.mockRejectedValueOnce({
      status: 403,
      detail: 'Admins cannot demote or deactivate themselves',
    })
    await user.click(screen.getByRole('button', { name: 'Remove admin' }))
    expect(
      await screen.findByText('You cannot change your own role or status.'),
    ).toBeInTheDocument()

    onPatch.mockRejectedValueOnce({ status: 403, detail: 'Cannot remove the last admin' })
    await user.click(screen.getByRole('button', { name: 'Remove admin' }))
    expect(
      await screen.findByText('The last admin cannot be demoted or deactivated.'),
    ).toBeInTheDocument()
  })

  it('surfaces other rejections verbatim and falls back to the generic label', () => {
    expect(
      describeAdminUserError({ status: 422, detail: 'at least 10 characters' }, {
        errorGeneric: 'generic',
        errorForbidden: 'forbidden',
        errorSelf: 'self',
        errorLastAdmin: 'last',
      }),
    ).toBe('at least 10 characters')
    expect(
      describeAdminUserError(new Error('kaboom'), {
        errorGeneric: 'generic',
        errorForbidden: 'forbidden',
        errorSelf: 'self',
        errorLastAdmin: 'last',
      }),
    ).toBe('kaboom')
    expect(
      describeAdminUserError(undefined, {
        errorGeneric: 'generic',
        errorForbidden: 'forbidden',
        errorSelf: 'self',
        errorLastAdmin: 'last',
      }),
    ).toBe('generic')
  })

  it('tabs through row actions and activates one with Enter', async () => {
    const user = userEvent.setup()
    const { onPatch } = renderTable()
    await user.tab()
    expect(screen.getAllByRole('button', { name: 'Remove admin' })[0]).toHaveFocus()
    await user.tab()
    expect(screen.getAllByRole('button', { name: 'Deactivate' })[0]).toHaveFocus()
    await user.tab()
    expect(screen.getAllByRole('button', { name: 'Reset password' })[0]!).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Reset password' })[0]!).toHaveFocus(),
    )
    await user.tab()
    expect(screen.getAllByRole('button', { name: 'Force logout' })[0]).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Make admin' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onPatch).toHaveBeenCalledWith(users[1], { is_admin: true })
  })

  it('submits the reset panel from the keyboard', async () => {
    const user = userEvent.setup()
    const { onResetPassword } = renderTable()
    await user.click(screen.getAllByRole('button', { name: 'Reset password' })[0]!)
    await user.type(screen.getByLabelText('New password'), 'a-valid-password{Enter}')
    expect(onResetPassword).toHaveBeenCalledWith(users[0], 'a-valid-password')
  })

  it('accepts label and icon overrides', async () => {
    const user = userEvent.setup()
    renderTable({
      labels: {
        promote: 'Befördern',
        resetPassword: 'Passwort zurücksetzen',
        resetTitle: (email) => `Neues Passwort für ${email}`,
        empty: 'Keine Nutzer',
      },
      icons: { resetPassword: Clock },
    })
    expect(screen.getByRole('button', { name: 'Befördern' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Passwort zurücksetzen' })[1]!)
    expect(
      screen.getByText('Neues Passwort für grace@example.com'),
    ).toBeInTheDocument()
  })

  it('passes axe in default, loading and reset-panel states', async () => {
    const user = userEvent.setup()
    const { container, unmount } = renderTable()
    expect(await axe(container)).toHaveNoViolations()
    await user.click(screen.getAllByRole('button', { name: 'Reset password' })[0]!)
    expect(await axe(container)).toHaveNoViolations()
    unmount()
    const loading = renderTable({ loading: true, users: [] })
    expect(await axe(loading.container)).toHaveNoViolations()
  })
})
