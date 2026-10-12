import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  ProviderSetupForm,
  DEFAULT_SETUP_ERROR_COPY,
  type ProviderSetupFormError,
  type ProviderSetupFormPreset,
  type ProviderSetupFormValue,
} from '../src/components/provider-setup-form/ProviderSetupForm'

const preset: ProviderSetupFormPreset = {
  name: 'OpenAI',
  keyUrl: 'https://platform.openai.com/api-keys',
  steps: ['Open {url}', 'Create a key', 'Paste it below'],
  freeTierNote: 'Free tier available.',
  fixedBase: false,
  baseUrl: 'https://api.openai.com/v1',
}

type Change = (value: ProviderSetupFormValue) => void

function FormDemo({
  preset: presetProp = preset,
  initialValue,
  error,
  onValueChange,
}: {
  preset?: ProviderSetupFormPreset
  initialValue?: Partial<ProviderSetupFormValue>
  error?: ProviderSetupFormError | null
  onValueChange?: Change
}) {
  const [value, setValue] = React.useState<ProviderSetupFormValue>({
    name: 'OpenAI',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    ...initialValue,
  })
  const handleChange: Change = (next) => {
    setValue(next)
    onValueChange?.(next)
  }
  return (
    <ProviderSetupForm
      preset={presetProp}
      value={value}
      onChange={handleChange}
      onSubmit={() => {}}
      onCancel={() => {}}
      error={error}
    />
  )
}

describe('ProviderSetupForm', () => {
  it('renders the guided checklist with {url} substituted and copy buttons, plus the key link and free-tier note', () => {
    render(<FormDemo />)
    expect(screen.getByText('Open https://platform.openai.com/api-keys')).toBeInTheDocument()
    expect(screen.getByText('Create a key')).toBeInTheDocument()
    const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
    expect(copyButtons).toHaveLength(3)
    expect(
      screen.getByRole('link', { name: /get an api key/i }),
    ).toHaveAttribute('href', 'https://platform.openai.com/api-keys')
    expect(screen.getByText('Free tier available.')).toBeInTheDocument()
  })

  it('key field is write-only: password + autoComplete new-password', () => {
    render(<FormDemo />)
    const keyField = screen.getByLabelText('API key')
    expect(keyField).toHaveAttribute('type', 'password')
    expect(keyField).toHaveAttribute('autoComplete', 'new-password')
  })

  it('local presets render the keyless note instead of the key field', () => {
    render(
      <FormDemo
        preset={{ ...preset, local: true }}
        initialValue={{ apiKey: '' }}
      />,
    )
    expect(screen.queryByLabelText('API key')).not.toBeInTheDocument()
    expect(
      screen.getByText('Runs on your machine — no API key needed.'),
    ).toBeInTheDocument()
  })

  it('base URL is read-only for fixed-base presets inside the Advanced disclosure', () => {
    render(
      <FormDemo
        preset={{ ...preset, fixedBase: true }}
        initialValue={{ baseUrl: 'https://generativelanguage.googleapis.com' }}
      />,
    )
    const base = screen.getByLabelText('API base URL')
    expect(base).toHaveAttribute('readOnly')
    expect(base).toHaveValue('https://generativelanguage.googleapis.com')
  })

  it('reports field edits through onChange and submits the value from Enter in the key field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onSubmit = vi.fn()
    function TypingDemo() {
      const [value, setValue] = React.useState<ProviderSetupFormValue>({
        name: 'OpenAI',
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
      })
      return (
        <ProviderSetupForm
          preset={preset}
          value={value}
          onChange={(next) => {
            setValue(next)
            onValueChange(next)
          }}
          onSubmit={onSubmit}
        />
      )
    }
    render(<TypingDemo />)
    const keyField = screen.getByLabelText('API key')
    expect(screen.getByRole('button', { name: 'Connect' })).toBeDisabled()
    await user.type(keyField, 'sk-test')
    expect(onValueChange).toHaveBeenLastCalledWith({
      name: 'OpenAI',
      apiKey: 'sk-test',
      baseUrl: 'https://api.openai.com/v1',
    })
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'OpenAI',
      apiKey: 'sk-test',
      baseUrl: 'https://api.openai.com/v1',
    })
  })

  it('renders classified error copy from the shared enum with injected labels and the suspected-vendor hint', () => {
    render(
      <FormDemo
        error={{ code: 'invalid_key', suspectedVendor: 'openrouter' }}
      />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(DEFAULT_SETUP_ERROR_COPY.invalid_key)
    expect(
      screen.getByText('This looks like a openrouter API key.'),
    ).toBeInTheDocument()
  })

  it('falls back to injected unknown copy for unclassified failures', () => {
    render(
      <FormDemo
        error={{ code: 'unknown' }}
      />,
    )
    // FormDemo doesn't inject labels; assert the default unknown copy path
    expect(screen.getByRole('alert')).toHaveTextContent(
      DEFAULT_SETUP_ERROR_COPY.unknown,
    )
  })

  it('renders the app-injected advancedExtra inside the Advanced disclosure', () => {
    render(
      <ProviderSetupForm
        preset={preset}
        value={{ name: 'OpenAI', apiKey: 'sk-x', baseUrl: '' }}
        onChange={() => {}}
        onSubmit={() => {}}
        advancedExtra={<button type="button">Hosting: local</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Hosting: local' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FormDemo error={{ code: 'timeout' }} initialValue={{ apiKey: 'sk-x' }} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
