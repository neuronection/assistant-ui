import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SecretOnceBlock } from '../src/components/secret-once-block/SecretOnceBlock'

const secret = 'demo-value_$chars/ok?here'

function withClipboard(result: Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(() => result) },
    configurable: true,
  })
}

function withoutClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: undefined,
    configurable: true,
  })
}

describe('SecretOnceBlock', () => {
  it('renders the secret in a code block and the warning', () => {
    render(<SecretOnceBlock secret={secret} warning="Store it now — it is shown once." />)

    const value = screen.getByText(secret)
    expect(value.tagName).toBe('CODE')
    expect(screen.getByText('Store it now — it is shown once.')).toBeInTheDocument()
  })

  it('copies the exact secret, flips the label and reports success', async () => {
    const user = userEvent.setup()
    withClipboard(Promise.resolve())
    const onCopied = vi.fn()
    const { container } = render(
      <SecretOnceBlock secret={secret} warning="Shown once." onCopied={onCopied} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secret)
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(onCopied).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[data-as="secret-once-block"]')).toHaveAttribute('data-copied')
  })

  it('resets the label to copyLabel after the copied timeout', async () => {
    const user = userEvent.setup()
    withClipboard(Promise.resolve())
    render(
      <SecretOnceBlock
        secret={secret}
        warning="Shown once."
        copyLabel="Copy secret"
        copiedLabel="Copied!"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy secret' }))
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument()
    await waitFor(
      () => expect(screen.getByRole('button', { name: 'Copy secret' })).toBeInTheDocument(),
      { timeout: 3000 },
    )
  })

  it('falls back to execCommand when the clipboard API is unavailable', async () => {
    const user = userEvent.setup()
    withoutClipboard()
    let captured: string | null = null
    const execCommand = vi.fn(() => {
      const textarea = document.querySelector('textarea')
      captured = textarea ? (textarea as HTMLTextAreaElement).value : null
      return true
    })
    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true,
    })

    const onCopied = vi.fn()
    render(<SecretOnceBlock secret={secret} warning="Shown once." onCopied={onCopied} />)
    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(captured).toBe(secret)
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(onCopied).toHaveBeenCalled()
    Reflect.deleteProperty(document, 'execCommand')
  })

  it('copies from the keyboard (Enter)', async () => {
    const user = userEvent.setup()
    withClipboard(Promise.resolve())
    render(<SecretOnceBlock secret={secret} warning="Shown once." />)
    const button = screen.getByRole('button', { name: 'Copy' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secret)
  })

  it('keeps the copy label when the clipboard write fails', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.reject(new Error('denied'))) },
      configurable: true,
    })
    const onCopied = vi.fn()
    render(<SecretOnceBlock secret={secret} warning="Shown once." onCopied={onCopied} />)

    await user.click(screen.getByRole('button', { name: 'Copy' }))
    await waitFor(() => expect(onCopied).not.toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('resets the copied state when the secret changes', async () => {
    const user = userEvent.setup()
    withClipboard(Promise.resolve())
    const { container, rerender } = render(
      <SecretOnceBlock secret="first-secret" warning="Shown once." />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()

    rerender(<SecretOnceBlock secret="second-secret" warning="Shown once." />)
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.getByText('second-secret')).toBeInTheDocument()
    expect(container.querySelector('[data-as="secret-once-block"]')).not.toHaveAttribute(
      'data-copied',
    )

    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith('second-secret')
  })

  it('applies testId to the root element', () => {
    const { container } = render(
      <SecretOnceBlock secret={secret} warning="Shown once." testId="reveal-secret" />,
    )
    const root = screen.getByTestId('reveal-secret')
    expect(root).toBe(container.querySelector('[data-as="secret-once-block"]'))
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SecretOnceBlock secret={secret} warning="Store it now — it is shown once." />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
