import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { RegisterForm } from '../src/components/register-form'

function renderForm(props: Partial<React.ComponentProps<typeof RegisterForm>> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const result = render(<RegisterForm onSubmit={onSubmit} {...props} />)
  return { ...result, onSubmit }
}

afterEach(() => cleanup())

async function fill(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { email?: string; password?: string; confirm?: string; fullName?: string } = {},
) {
  const values = {
    email: 'ada@example.com',
    password: 'a-long-enough-password',
    confirm: 'a-long-enough-password',
    fullName: 'Ada Lovelace',
    ...overrides,
  }
  const fullName = screen.queryByLabelText('Full name')
  if (fullName) await user.type(fullName, values.fullName)
  await user.type(screen.getByLabelText('Email'), values.email)
  await user.type(screen.getByLabelText('Password'), values.password)
  await user.type(screen.getByLabelText('Confirm password'), values.confirm)
}

describe('RegisterForm', () => {
  it('renders email, password and confirm fields with new-password autocomplete', () => {
    renderForm()
    expect(screen.queryByLabelText('Full name')).toBeNull()
    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('autocomplete', 'email')
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('autocomplete', 'new-password')
    expect(password).toHaveAttribute('minLength', '10')
    const confirm = screen.getByLabelText('Confirm password')
    expect(confirm).toHaveAttribute('autocomplete', 'new-password')
    expect(confirm).toHaveAttribute('minLength', '10')
    expect(screen.getByText('At least 10 characters.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('shows the optional full name field behind showFullName and submits it trimmed', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ showFullName: true })
    await fill(user, { fullName: '  Ada Lovelace  ' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(onSubmit).toHaveBeenCalledWith(
      'ada@example.com',
      'a-long-enough-password',
      'Ada Lovelace',
    )
  })

  it('submits without a fullName argument when the field is hidden', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(onSubmit).toHaveBeenCalledWith(
      'ada@example.com',
      'a-long-enough-password',
      undefined,
    )
  })

  it('blocks submit on a confirm mismatch without calling onSubmit', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()
    await fill(user, { confirm: 'a-different-password' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(onSubmit).not.toHaveBeenCalled()
    const confirm = screen.getByLabelText('Confirm password')
    expect(confirm).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
  })

  it('clears the mismatch once either password field changes, then submits', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()
    await fill(user, { confirm: 'a-different-password' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Confirm password'))
    await user.type(screen.getByLabelText('Confirm password'), 'a-long-enough-password')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(onSubmit).toHaveBeenCalledWith(
      'ada@example.com',
      'a-long-enough-password',
      undefined,
    )
  })

  it('toggles visibility on both password fields independently', async () => {
    const user = userEvent.setup()
    renderForm()
    const toggles = screen.getAllByRole('button', { name: 'Show password' })
    await user.click(toggles[0]!)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('type', 'password')
    await user.click(screen.getAllByRole('button', { name: 'Hide password' })[0]!)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('disables everything while loading', () => {
    renderForm({ showFullName: true, loading: true })
    expect(screen.getByLabelText('Full name')).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByLabelText('Confirm password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled()
  })

  it('surfaces the mapped error with role="alert" beside the mismatch slot', () => {
    renderForm({ error: 'Email already registered' })
    expect(screen.getByRole('alert')).toHaveTextContent('Email already registered')
  })

  it('submits from the keyboard with Enter inside the confirm field', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()
    await fill(user)
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('fires onLogin from the switch link and honours loginHref', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    const { rerender } = renderForm()
    expect(
      screen.queryByRole('button', { name: 'Already have an account? Sign in' }),
    ).toBeNull()

    rerender(<RegisterForm onSubmit={vi.fn()} onLogin={onLogin} />)
    await user.click(
      screen.getByRole('button', { name: 'Already have an account? Sign in' }),
    )
    expect(onLogin).toHaveBeenCalledTimes(1)

    rerender(<RegisterForm onSubmit={vi.fn()} loginHref="/login" />)
    expect(
      screen.getByRole('link', { name: 'Already have an account? Sign in' }),
    ).toHaveAttribute('href', '/login')
  })

  it('merges field and label overrides, including hiding the password hint', () => {
    renderForm({
      fields: { confirmPassword: { label: 'Passwort wiederholen' } },
      labels: { submit: 'Konto erstellen', passwordHint: null },
    })
    expect(screen.getByLabelText('Passwort wiederholen')).toBeInTheDocument()
    expect(screen.queryByText('At least 10 characters.')).toBeNull()
    expect(screen.getByRole('button', { name: 'Konto erstellen' })).toBeInTheDocument()
  })

  it('keyboard: Tab runs full name → email → password → toggle → confirm → toggle → submit → link', async () => {
    const user = userEvent.setup()
    renderForm({ showFullName: true, onLogin: () => undefined })
    await user.tab()
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Password')).toHaveFocus()
    await user.tab()
    expect(screen.getAllByRole('button', { name: 'Show password' })[0]!).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Confirm password')).toHaveFocus()
    await user.tab()
    expect(screen.getAllByRole('button', { name: 'Show password' })[1]!).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Create account' })).toHaveFocus()
    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Already have an account? Sign in' }),
    ).toHaveFocus()
  })

  it('has no axe violations idle, with full name, and with an error', async () => {
    const { container } = renderForm({ showFullName: true })
    expect(await axe(container)).toHaveNoViolations()

    cleanup()
    const second = renderForm({ error: 'Email already registered' })
    expect(await axe(second.container)).toHaveNoViolations()
  })
})
