import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SetupFirstRunCard } from '../src/components/setup-first-run-card/SetupFirstRunCard'

describe('SetupFirstRunCard', () => {
  it('renders the title, body and both actions', () => {
    render(
      <SetupFirstRunCard
        title="Connect an AI provider"
        body="Bring your own key — it stays on this device."
        onSetup={() => {}}
        onDismiss={() => {}}
      />,
    )
    expect(
      screen.getByRole('heading', { name: /connect an ai provider/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Bring your own key — it stays on this device.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set up a provider' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('actions fire from the keyboard', async () => {
    const user = userEvent.setup()
    const onSetup = vi.fn()
    const onDismiss = vi.fn()
    render(
      <SetupFirstRunCard
        title="Connect an AI provider"
        onSetup={onSetup}
        onDismiss={onDismiss}
      />,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Set up a provider' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSetup).toHaveBeenCalledOnce()
    await user.tab()
    await user.keyboard('{Enter}')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('shows the local-probe status line and hides dismiss when not offered', () => {
    render(
      <SetupFirstRunCard
        title="Connect an AI provider"
        localProbing
        onSetup={() => {}}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking for a local engine…',
    )
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })

  it('renders app children between body and actions', () => {
    render(
      <SetupFirstRunCard title="Connect an AI provider" onSetup={() => {}}>
        <p role="status">Ollama detected on this machine.</p>
      </SetupFirstRunCard>,
    )
    expect(
      screen.getByText('Ollama detected on this machine.'),
    ).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SetupFirstRunCard
        title="Connect an AI provider"
        body="Bring your own key."
        onSetup={() => {}}
        onDismiss={() => {}}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
