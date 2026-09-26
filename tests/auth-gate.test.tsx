import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { AuthGate, type AuthGateStatus } from '../src/components/auth-gate'

function renderGate(
  props: Partial<React.ComponentProps<typeof AuthGate>> = {},
  boot: () => Promise<boolean> = vi.fn().mockResolvedValue(true),
) {
  const result = render(
    <AuthGate
      boot={boot}
      login={
        <div>
          <label htmlFor="gate-email">Email</label>
          <input id="gate-email" type="email" />
        </div>
      }
      {...props}
    >
      <div>
        <span>the app</span>
        <button type="button">app action</button>
      </div>
    </AuthGate>,
  )
  return result
}

afterEach(() => cleanup())

describe('AuthGate', () => {
  it('renders the splash while the boot flow is pending', () => {
    renderGate({}, () => new Promise(() => {}))
    expect(screen.getByRole('status')).toHaveTextContent('Checking session…')
    expect(screen.queryByText('the app')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('renders children once a session is established', async () => {
    const boot = vi.fn().mockResolvedValue(true)
    renderGate({}, boot)
    await waitFor(() => expect(screen.getByText('the app')).toBeInTheDocument())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    expect(boot).toHaveBeenCalledTimes(1)
  })

  it('renders the login surface when the boot lands anonymous', async () => {
    const boot = vi.fn().mockResolvedValue(false)
    renderGate({}, boot)
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument())
    expect(screen.queryByText('the app')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('treats a rejecting boot as anonymous instead of wedging on checking', async () => {
    const boot = vi.fn().mockRejectedValue(new Error('offline'))
    renderGate({}, boot)
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('re-runs the machine when resetKey changes — anonymous back to authenticated', async () => {
    const boot = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const { rerender } = renderGate({ resetKey: 0 }, boot)
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument())
    rerender(
      <AuthGate boot={boot} resetKey={1} login={<div>login stub</div>}>
        <span>the app</span>
      </AuthGate>,
    )
    await waitFor(() => expect(screen.getByText('the app')).toBeInTheDocument())
    expect(boot).toHaveBeenCalledTimes(2)
  })

  it('re-runs the machine when resetKey changes — mid-session 401 back to the login surface', async () => {
    const boot = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const { rerender } = renderGate({ resetKey: 'boot' }, boot)
    await waitFor(() => expect(screen.getByText('the app')).toBeInTheDocument())
    rerender(
      <AuthGate boot={boot} resetKey="401" login={<div>login stub</div>}>
        <span>the app</span>
      </AuthGate>,
    )
    await waitFor(() => expect(screen.getByText('login stub')).toBeInTheDocument())
    expect(screen.queryByText('the app')).not.toBeInTheDocument()
    expect(boot).toHaveBeenCalledTimes(2)
  })

  it('does not re-run the boot when only the boot prop identity changes', async () => {
    const boot = vi.fn().mockResolvedValue(true)
    const { rerender } = renderGate({}, boot)
    await waitFor(() => expect(screen.getByText('the app')).toBeInTheDocument())
    rerender(
      <AuthGate boot={() => Promise.resolve(false)} login={<div>login stub</div>}>
        <span>the app</span>
      </AuthGate>,
    )
    await waitFor(() => {
      // a render settled without a machine re-run
      expect(screen.getByText('the app')).toBeInTheDocument()
    })
    expect(boot).toHaveBeenCalledTimes(1)
  })

  it('honours a custom checking node and label override', () => {
    renderGate(
      {
        checking: <div>custom splash</div>,
        labels: { checking: 'Sitzung wird geprüft…' },
      },
      () => new Promise(() => {}),
    )
    expect(screen.getByText('custom splash')).toBeInTheDocument()
    expect(screen.queryByText('Checking session…')).not.toBeInTheDocument()

    cleanup()
    renderGate({ labels: { checking: 'Sitzung wird geprüft…' } }, () => new Promise(() => {}))
    expect(screen.getByRole('status')).toHaveTextContent('Sitzung wird geprüft…')
  })

  it('reports every machine transition through onStatusChange', async () => {
    const seen: AuthGateStatus[] = []
    const boot = vi.fn().mockResolvedValue(false)
    renderGate({ onStatusChange: (status) => seen.push(status) }, boot)
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument())
    expect(seen).toEqual(['checking', 'anonymous'])
  })

  it('keeps children focusables keyboard-reachable once authenticated', async () => {
    const user = userEvent.setup()
    renderGate()
    await waitFor(() => expect(screen.getByText('the app')).toBeInTheDocument())
    await user.tab()
    expect(screen.getByRole('button', { name: 'app action' })).toHaveFocus()
  })

  it('exposes no focusable content from the checking splash', () => {
    renderGate({}, () => new Promise(() => {}))
    expect(document.querySelectorAll('button, a, input, [tabindex]').length).toBe(0)
  })

  it('marks its wrapper with data-as and merges className', async () => {
    const ref = React.createRef<HTMLDivElement>()
    const boot = vi.fn().mockResolvedValue(false)
    render(
      <AuthGate ref={ref} boot={boot} login={<div>login stub</div>} className="relative z-10">
        <span>the app</span>
      </AuthGate>,
    )
    await waitFor(() => expect(screen.getByText('login stub')).toBeInTheDocument())
    const wrapper = ref.current
    expect(wrapper).not.toBeNull()
    expect(wrapper).toHaveAttribute('data-as', 'auth-gate')
    expect(wrapper).toHaveClass('relative', 'z-10')
  })

  it('is axe-clean in the checking state', async () => {
    const { container } = renderGate({}, () => new Promise(() => {}))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('is axe-clean on the login surface', async () => {
    const boot = vi.fn().mockResolvedValue(false)
    const { container } = renderGate({}, boot)
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument())
    expect(await axe(container)).toHaveNoViolations()
  })

  it('is axe-clean when authenticated', async () => {
    const { container } = renderGate()
    await waitFor(() => expect(screen.getByText('the app')).toBeInTheDocument())
    expect(await axe(container)).toHaveNoViolations()
  })
})
