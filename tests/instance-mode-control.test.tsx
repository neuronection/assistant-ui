import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import type { ComponentProps } from 'react'

import {
  InstanceModeControl,
  describeInstanceModeError,
} from '../src/components/instance-mode-control'


function passwordField(): HTMLElement {
  return screen.getByLabelText('Password')
}

function confirmField(): HTMLElement {
  return screen.getByLabelText('Confirm password')
}

function renderControl(props: Partial<ComponentProps<typeof InstanceModeControl>> = {}) {
  const onSetAuthenticated = vi.fn().mockResolvedValue(undefined)
  const onSetOpen = vi.fn().mockResolvedValue(undefined)
  const result = render(
    <InstanceModeControl
      mode="open"
      onSetAuthenticated={onSetAuthenticated}
      onSetOpen={onSetOpen}
      {...props}
    />,
  )
  return { ...result, onSetAuthenticated, onSetOpen }
}

describe('InstanceModeControl', () => {
  it('shows the open mode with its hint and the enable-login form', () => {
    renderControl()
    expect(screen.getByText('Open — no login')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Enable login' }),
    ).toBeDisabled()
  })

  it('shows the authenticated mode with the disable-login form', () => {
    renderControl({ mode: 'authenticated' })
    expect(screen.getByText('Login required')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disable login' })).toBeInTheDocument()
  })

  it('enables submit only once the password clears the minimum and matches', async () => {
    const user = userEvent.setup()
    const { onSetAuthenticated } = renderControl({ minPasswordLength: 10 })
    const submit = screen.getByRole('button', { name: 'Enable login' })
    expect(submit).toBeDisabled()

    const [password = passwordField(), confirm = confirmField()] = screen.getAllByLabelText(/password/i)
    await user.type(password, 'short')
    expect(submit).toBeDisabled()
    await user.type(password, 'er-secret')
    await user.type(confirm, 'not-the-same')
    expect(submit).toBeDisabled()

    await user.clear(confirm)
    await user.type(confirm, 'shorter-secret')
    expect(submit).toBeEnabled()

    await user.click(submit)
    await waitFor(() => expect(onSetAuthenticated).toHaveBeenCalled())
  })

  it('emits onSetAuthenticated with the draft password', async () => {
    const user = userEvent.setup()
    const { onSetAuthenticated, onSetOpen } = renderControl()
    const [password = passwordField(), confirm = confirmField()] = screen.getAllByLabelText(/password/i)
    await user.type(password, 'brand-new-owner-pw')
    await user.type(confirm, 'brand-new-owner-pw')
    await user.click(screen.getByRole('button', { name: 'Enable login' }))
    await waitFor(() =>
      expect(onSetAuthenticated).toHaveBeenCalledWith('brand-new-owner-pw'),
    )
    expect(onSetOpen).not.toHaveBeenCalled()
  })

  it('requires the explicit acknowledgement before disabling login', async () => {
    const user = userEvent.setup()
    const { onSetOpen } = renderControl({ mode: 'authenticated' })
    const submit = screen.getByRole('button', { name: 'Disable login' })
    await user.type(screen.getByLabelText('Password'), 'current-pw')
    expect(submit).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))
    expect(submit).toBeEnabled()
    await user.click(submit)
    await waitFor(() => expect(onSetOpen).toHaveBeenCalledWith('current-pw'))
  })

  it('blocks the authenticated → open flow on server identity', () => {
    renderControl({ mode: 'authenticated', serverIdentity: true })
    expect(
      screen.getByText('Server instances always require login.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disable login' })).toBeDisabled()
  })

  it('blocks the authenticated → open flow while other accounts exist', () => {
    renderControl({ mode: 'authenticated', otherUserCount: 2 })
    expect(
      screen.getByText('Other accounts exist (2) — remove them before login can be removed.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disable login' })).toBeDisabled()
  })

  it('surfaces rejections as label-driven messages and keeps the draft', async () => {
    const user = userEvent.setup()
    const onSetAuthenticated = vi.fn().mockRejectedValue({ status: 403 })
    render(
      <InstanceModeControl
        mode="open"
        onSetAuthenticated={onSetAuthenticated}
        onSetOpen={vi.fn()}
      />,
    )
    const [password = passwordField(), confirm = confirmField()] = screen.getAllByLabelText(/password/i)
    await user.type(password, 'brand-new-owner-pw')
    await user.type(confirm, 'brand-new-owner-pw')
    await user.click(screen.getByRole('button', { name: 'Enable login' }))
    expect(await screen.findByText('Not allowed.')).toBeInTheDocument()
    expect(password).toHaveValue('brand-new-owner-pw')
  })

  it('reaches every control by keyboard and submits with Enter', async () => {
    const user = userEvent.setup()
    const { onSetAuthenticated } = renderControl()
    await user.tab()
    expect(screen.getByLabelText('Password')).toHaveFocus()
    await user.keyboard('brand-new-owner-pw')
    await user.tab()
    expect(screen.getByLabelText('Confirm password')).toHaveFocus()
    await user.keyboard('brand-new-owner-pw{Enter}')
    await waitFor(() =>
      expect(onSetAuthenticated).toHaveBeenCalledWith('brand-new-owner-pw'),
    )
  })

  it('marks the audit note on both flows', () => {
    const { unmount } = renderControl()
    expect(screen.getByText('This change is recorded in the audit log.')).toBeInTheDocument()
    unmount()
    renderControl({ mode: 'authenticated' })
    expect(screen.getByText('This change is recorded in the audit log.')).toBeInTheDocument()
  })

  it('has no axe violations in either mode', async () => {
    const { container, unmount } = renderControl()
    expect(await axe(container)).toHaveNoViolations()
    unmount()
    const second = renderControl({ mode: 'authenticated', otherUserCount: 1 })
    expect(await axe(second.container)).toHaveNoViolations()
  })

  it('maps unknown rejections through describeInstanceModeError', () => {
    expect(
      describeInstanceModeError(new Error('boom'), {
        errorGeneric: 'generic',
        errorForbidden: 'forbidden',
      }),
    ).toBe('boom')
    expect(
      describeInstanceModeError({ status: 500 }, {
        errorGeneric: 'generic',
        errorForbidden: 'forbidden',
      }),
    ).toBe('generic')
    expect(
      describeInstanceModeError({ status: 403 }, {
        errorGeneric: 'generic',
        errorForbidden: 'forbidden',
      }),
    ).toBe('forbidden')
  })
})
