import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Input } from '../src/components/input/Input'
import { Textarea } from '../src/components/input/Textarea'
import { Spinner } from '../src/components/spinner/Spinner'

describe('Input', () => {
  it('renders bare input when no label, hint or error is given', () => {
    render(<Input placeholder="Email" />)
    const input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('data-as', 'input')
    expect(input.parentElement?.children).toHaveLength(1)
  })

  it('associates label, hint and error with the input', () => {
    render(<Input label="API key" hint="Stored in keyring" error="Required" />)
    const input = screen.getByLabelText('API key')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('supports uncontrolled typing', async () => {
    const user = userEvent.setup()
    render(<Input label="Model name" />)
    const input = screen.getByLabelText('Model name')
    await user.type(input, 'gpt-5')
    expect(input).toHaveValue('gpt-5')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Input label="Name" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Spinner', () => {
  it('renders hidden from a11y tree without label', () => {
    render(<Spinner />)
    const spinner = document.querySelector('[data-as="spinner"]')
    expect(spinner).not.toBeNull()
    expect(spinner?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('announces label via status role', () => {
    render(<Spinner label="Loading results" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading results')
  })
})

describe('React 18 API compliance', () => {
  it('forwards refs on Input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

describe('Textarea', () => {
  it('renders bare textarea when no label, hint or error is given', () => {
    render(<Textarea placeholder="Notes" />)
    const textarea = screen.getByPlaceholderText('Notes')
    expect(textarea).toHaveAttribute('data-as', 'textarea')
  })

  it('associates label and error with the textarea', () => {
    render(<Textarea label="Summary" error="Required" />)
    expect(screen.getByLabelText('Summary')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('supports typing', async () => {
    const user = userEvent.setup()
    render(<Textarea label="Summary" />)
    await user.type(screen.getByLabelText('Summary'), 'hello')
    expect(screen.getByLabelText('Summary')).toHaveValue('hello')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Textarea label="Summary" hint="Markdown allowed" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
