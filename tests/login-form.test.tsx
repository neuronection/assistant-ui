import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { LoginForm } from '../src/components/login-form'

function renderForm(props: Partial<React.ComponentProps<typeof LoginForm>> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const result = render(<LoginForm onSubmit={onSubmit} {...props} />)
  return { ...result, onSubmit }
}

afterEach(() => cleanup())

describe('LoginForm', () => {
  it('renders labelled email and password fields with autocomplete wiring', () => {
    renderForm()
    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('autocomplete', 'email')
    expect(email).toBeRequired()
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
    expect(password).toBeRequired()
    expect(password).toHaveAttribute('minLength', '10')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('submits the trimmed email with the password as typed', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()
    await user.type(screen.getByLabelText('Email'), '  ada@example.com  ')
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onSubmit).toHaveBeenCalledWith('ada@example.com', 'correct-horse-battery')
  })

  it('submits from the keyboard with Enter inside the password field', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('ada@example.com', 'correct-horse-battery')
  })

  it('honours a custom minPasswordLength on the password field', () => {
    renderForm({ minPasswordLength: 4 })
    expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '4')
  })

  it('toggles password visibility with a labelled, pressed-tracked button', async () => {
    const user = userEvent.setup()
    renderForm()
    const password = screen.getByLabelText('Password')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('disables fields and submit while the app-controlled loading is true', () => {
    renderForm({ loading: true })
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled()
  })

  it('disables submit while the onSubmit promise is pending', async () => {
    const user = userEvent.setup()
    let release: (() => void) | undefined
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (release = resolve)),
    )
    render(<LoginForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
    release!()
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled(),
    )
  })

  it('surfaces the mapped error with role="alert"', () => {
    renderForm({ error: 'Invalid email or password' })
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('renders no links by default and fires onRegister when given', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()
    const { rerender } = renderForm()
    expect(screen.queryByRole('button', { name: /account/i })).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()

    rerender(<LoginForm onSubmit={vi.fn()} onRegister={onRegister} />)
    await user.click(screen.getByRole('button', { name: 'Need an account? Create one' }))
    expect(onRegister).toHaveBeenCalledTimes(1)
  })

  it('renders href links when registerHref/forgotHref are given', () => {
    renderForm({ registerHref: '/register', forgotHref: '/forgot' })
    expect(screen.getByRole('link', { name: 'Need an account? Create one' })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot',
    )
  })

  it('merges field and label overrides over the English defaults', () => {
    renderForm({
      fields: { email: { label: 'E-Mail' }, password: { label: 'Passwort' } },
      labels: { submit: 'Anmelden' },
    })
    expect(screen.getByLabelText('E-Mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Passwort')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anmelden' })).toBeInTheDocument()
  })

  it('keyboard: Tab runs email → password → toggle → submit → register link', async () => {
    const user = userEvent.setup()
    renderForm({ onRegister: () => undefined })
    await user.tab()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Password')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveFocus()
    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Need an account? Create one' }),
    ).toHaveFocus()
  })

  it('has no axe violations idle, loading and with an error', async () => {
    const { container } = renderForm()
    expect(await axe(container)).toHaveNoViolations()

    cleanup()
    const second = renderForm({ loading: true, error: 'Invalid email or password' })
    expect(await axe(second.container)).toHaveNoViolations()
  })
})
