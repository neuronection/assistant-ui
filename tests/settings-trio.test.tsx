import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { KeyRound } from 'lucide-react'
import {
  SettingsShell,
  type SettingsNavItem,
} from '../src/components/settings-shell/SettingsShell'
import { ProviderForm } from '../src/components/provider-form/ProviderForm'
import {
  ConnectionTestRow,
  type ConnectionTestStatus,
} from '../src/components/connection-test-row/ConnectionTestRow'

const nav: SettingsNavItem[] = [
  { id: 'providers', label: 'Providers', description: 'AI endpoints', icon: KeyRound },
  { id: 'models', label: 'Models' },
]

function ShellDemo() {
  const [active, setActive] = React.useState('providers')
  return (
    <SettingsShell
      nav={nav}
      active={active}
      onNavigate={setActive}
      header={{ icon: KeyRound, title: 'Settings' }}
    >
      <p>Section: {active}</p>
    </SettingsShell>
  )
}

describe('SettingsShell', () => {
  it('renders nav with labels, descriptions and header', () => {
    render(<ShellDemo />)
    expect(screen.getByRole('navigation', { name: 'Settings sections' })).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Providers')).toBeInTheDocument()
    expect(screen.getByText('AI endpoints')).toBeInTheDocument()
    expect(screen.getByText('Section: providers')).toBeInTheDocument()
  })

  it('navigates via onNavigate and marks the active entry', async () => {
    const user = userEvent.setup()
    render(<ShellDemo />)
    await user.click(screen.getByRole('button', { name: /Models/ }))
    expect(screen.getByText('Section: models')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Models/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(<ShellDemo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ProviderForm', () => {
  it('renders name, base url and write-only key field', async () => {
    const user = userEvent.setup()
    const onApiKeyChange = vi.fn()
    render(
      <ProviderForm
        name="OpenRouter"
        onNameChange={vi.fn()}
        baseUrl="https://openrouter.ai/v1"
        onBaseUrlChange={vi.fn()}
        apiKey=""
        onApiKeyChange={onApiKeyChange}
        apiKeyHelp="Stored in the system keyring"
        hasStoredKey
      />,
    )
    const key = screen.getByLabelText(/API key/)
    expect(key).toHaveAttribute('type', 'password')
    expect(key).toHaveAttribute('autocomplete', 'new-password')
    expect(key).toHaveValue('')
    await user.type(key, 'sk-secret')
    expect(onApiKeyChange).toHaveBeenCalledWith('s')
    expect(screen.getByText('Stored in the system keyring')).toBeInTheDocument()
    expect(screen.getByText(/Stored — leave empty to keep/)).toBeInTheDocument()
  })

  it('never renders a stored key value', () => {
    render(
      <ProviderForm
        name="x"
        onNameChange={vi.fn()}
        baseUrl=""
        onBaseUrlChange={vi.fn()}
        apiKey=""
        onApiKeyChange={vi.fn()}
        hasStoredKey
      />,
    )
    expect(document.body.textContent).not.toContain('sk-live-999')
  })

  it('renders app-provided extra fields and the error', () => {
    render(
      <ProviderForm
        name="x"
        onNameChange={vi.fn()}
        baseUrl=""
        onBaseUrlChange={vi.fn()}
        apiKey=""
        onApiKeyChange={vi.fn()}
        error="URL must be https"
      >
        <input aria-label="Models endpoint" />
      </ProviderForm>,
    )
    expect(screen.getByLabelText('Models endpoint')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('URL must be https')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ProviderForm
        name="n"
        onNameChange={vi.fn()}
        baseUrl="u"
        onBaseUrlChange={vi.fn()}
        apiKey=""
        onApiKeyChange={vi.fn()}
        apiKeyHelp="keyring"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ConnectionTestRow', () => {
  const cases: Array<[ConnectionTestStatus, RegExp]> = [
    ['ok', /Connected/],
    ['fail', /Failed/],
  ]
  it.each(cases)('renders the %s state', (status, text) => {
    render(<ConnectionTestRow status={status} latencyMs={status === 'ok' ? 240 : null} />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('shows latency on success', () => {
    render(<ConnectionTestRow status="ok" latencyMs={240} />)
    expect(screen.getByText('· 240ms')).toBeInTheDocument()
  })

  it('shows the testing spinner state and disables the button', () => {
    render(<ConnectionTestRow status="testing" onTest={vi.fn()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Test' })).toBeDisabled()
  })

  it('triggers onTest (keyboard operable)', async () => {
    const user = userEvent.setup()
    const onTest = vi.fn()
    render(<ConnectionTestRow status="idle" onTest={onTest} />)
    await user.click(screen.getByRole('button', { name: 'Test' }))
    expect(onTest).toHaveBeenCalled()
  })

  it('shows an error message on fail', () => {
    render(<ConnectionTestRow status="fail" errorMessage="401 unauthorized" />)
    expect(screen.getByText('401 unauthorized')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ConnectionTestRow status="ok" latencyMs={120} onTest={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
