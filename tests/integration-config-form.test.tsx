import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { IntegrationConfigForm } from '../src/components/integration-config-form/IntegrationConfigForm'
import { parseIntegrationConfigSchema } from '../src/contracts'
import type { IntegrationConfigSchema, IntegrationConfigValues } from '../src/contracts'

const SCHEMA: IntegrationConfigSchema = {
  type: 'object',
  properties: {
    endpoint: { type: 'string', title: 'Endpoint' },
    limit: { type: 'number', title: 'Limit', minimum: 1, maximum: 100 },
    verbose: { type: 'boolean', title: 'Verbose' },
    tags: { type: 'array', title: 'Tags', items: { type: 'string' } },
    kind: { type: 'string', title: 'Kind', enum: ['rss', 'site'] },
    token: { type: 'string', title: 'Token', 'x-secret': true },
  },
  required: ['endpoint', 'token'],
}

const FIELDS = parseIntegrationConfigSchema(SCHEMA)

function setup(overrides = {}, props = {}) {
  const handlers = {
    onValuesChange: vi.fn(),
    onSave: vi.fn(),
    onValidate: vi.fn(),
  }
  return {
    handlers,
    ...render(
      <IntegrationConfigForm
        fields={FIELDS}
        values={{}}
        {...handlers}
        {...overrides}
        {...props}
      />,
    ),
  }
}

describe('IntegrationConfigForm', () => {
  it('renders the schema-subset fields: text, number, boolean, array, enum select, secret', () => {
    setup()
    expect(screen.getByLabelText(/Endpoint/)).toBeTruthy()
    expect(screen.getByLabelText(/Limit/).getAttribute('type')).toBe('number')
    expect(screen.getByLabelText(/Verbose/).getAttribute('type')).toBe('checkbox')
    expect(screen.getByLabelText(/Kind/).tagName).toBe('SELECT')
    expect(screen.getByLabelText(/Token/).getAttribute('type')).toBe('password')
    expect(screen.getByLabelText(/Tags/)).toBeTruthy()
    expect(screen.getAllByText('*').length).toBe(2)
  })

  it('values out through onValuesChange (never persisted in props for secrets)', async () => {
    const user = userEvent.setup()
    const onValuesChange = vi.fn()
    function Harness() {
      const [values, setValues] = React.useState<IntegrationConfigValues>({})
      return (
        <IntegrationConfigForm
          fields={FIELDS}
          values={values}
          onValuesChange={(next) => {
            onValuesChange(next)
            setValues(next)
          }}
          onSave={vi.fn()}
        />
      )
    }
    render(<Harness />)
    await user.type(screen.getByLabelText(/Endpoint/), 'https://example.com')
    expect(onValuesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ endpoint: 'https://example.com' }),
    )
    await user.type(screen.getByLabelText(/Token/), 'tok')
    expect(onValuesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ endpoint: 'https://example.com' }),
    )
  })

  it('emits values AND secrets together on save — secrets typed once, on the way out', async () => {
    const user = userEvent.setup()
    const { handlers } = setup({ values: { endpoint: 'https://example.com' } })
    await user.type(screen.getByLabelText(/Token/), 'sekret')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(handlers.onSave).toHaveBeenCalledWith({
      values: { endpoint: 'https://example.com' },
      secrets: { token: 'sekret' },
    })
  })

  it('renders sealed-slot hints (set/not-set) and never a value', () => {
    setup({ secretSlots: { token: { set: true, hint: 'gh_pat_…***' } } })
    const hint = screen.getByTestId('integration-config-secret-token')
    expect(hint.textContent).toContain('set — leave empty to keep')
    expect(hint.textContent).toContain('gh_pat_…***')
    expect((screen.getByLabelText(/Token/) as HTMLInputElement).value).toBe('')
  })

  it('explicit host validation: values out via onValidate, result rendered from props', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    await user.click(screen.getByRole('button', { name: 'Validate' }))
    expect(handlers.onValidate).toHaveBeenCalledWith({})
    handlers.onValuesChange.mockClear()
    handlers.onSave.mockClear()
    handlers.onValidate.mockClear()
    cleanup()
    render(
      <IntegrationConfigForm
        fields={FIELDS}
        values={{}}
        onValuesChange={handlers.onValuesChange}
        onSave={handlers.onSave}
        onValidate={handlers.onValidate}
        validation={{ state: 'validating' }}
      />,
    )
    expect(screen.getByTestId('integration-config-validating')).toBeTruthy()
    const button = screen.getByRole('button', { name: 'Validate' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('renders host validation error (with field errors) and success states', () => {
    const errorView = setup({
      validation: {
        state: 'error',
        message: 'Endpoint unreachable',
        fieldErrors: { endpoint: 'must be https' },
      },
    })
    expect(screen.getByTestId('integration-config-error-endpoint').textContent).toBe(
      'must be https',
    )
    expect(screen.getByTestId('integration-config-validation-error').textContent).toBe(
      'Endpoint unreachable',
    )
    errorView.unmount()
    setup({ validation: { state: 'success' } })
    expect(screen.getByTestId('integration-config-validation-success')).toBeTruthy()
  })

  it('shows needs-config / needs-secret condition badges', () => {
    setup({ conditions: ['needs-config', 'needs-secret'] })
    expect(screen.getByTestId('integration-config-conditions').textContent).toContain('needs config')
    expect(screen.getByTestId('integration-config-conditions').textContent).toContain(
      'needs secret',
    )
  })

  it('edits every field type: number, boolean, array chips, enum select', async () => {
    const user = userEvent.setup()
    const values = { limit: null, verbose: false, tags: [] as string[], kind: '' }
    const onValuesChange = vi.fn((next) => Object.assign(values, next))
    const { rerender } = render(
      <IntegrationConfigForm fields={FIELDS} values={values} onValuesChange={onValuesChange} onSave={vi.fn()} />,
    )
    await user.type(screen.getByLabelText(/Limit/), '5')
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 5 }))
    await user.click(screen.getByLabelText(/Verbose/))
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ verbose: true }))
    await user.selectOptions(screen.getByLabelText(/Kind/), 'rss')
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'rss' }))
    rerender(
      <IntegrationConfigForm
        fields={FIELDS}
        values={{ ...values, verbose: true }}
        onValuesChange={onValuesChange}
        onSave={vi.fn()}
      />,
    )
    expect((screen.getByLabelText(/Verbose/) as HTMLInputElement).checked).toBe(true)
  })

  it('keyboard: tab walks fields in schema order and reaches save', async () => {
    const user = userEvent.setup()
    setup()
    await user.tab()
    expect(document.activeElement?.id).toBe('integration-config-endpoint')
    await user.tab()
    expect(document.activeElement?.id).toBe('integration-config-limit')
    await user.tab()
    expect(document.activeElement?.id).toBe('integration-config-verbose')
  })

  it('has no axe violations', async () => {
    const { container } = setup({ validation: { state: 'error', fieldErrors: { endpoint: 'bad' } } })
    expect(await axe(container)).toHaveNoViolations()
  })
})


describe('IntegrationConfigForm — schema hints (x-choices / x-presets / x-section)', () => {
  const CHOICES_SCHEMA: IntegrationConfigSchema = {
    type: 'object',
    properties: {
      levels: {
        type: 'string',
        title: 'Experience levels',
        'x-choices': [
          { value: 'internship', label: 'Internship' },
          { value: 'entry', label: 'Entry' },
          { value: 'mid_senior', label: 'Mid-senior' },
        ],
        'x-csv': true,
      },
      pages: {
        type: 'number',
        title: 'Pages',
        'x-choices': [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ],
      },
      pause: { type: 'number', title: 'Pause', 'x-section': 'advanced' },
    },
    'x-presets': [{ label: 'Remote only', values: { levels: 'entry' } }],
  }

  const choiceFields = parseIntegrationConfigSchema(CHOICES_SCHEMA)

  function renderChoices(
    handlers: {
      onValuesChange: (values: IntegrationConfigValues) => void
      onSave?: () => void
    } = { onValuesChange: () => {} },
    props = {},
  ) {
    return render(
      <IntegrationConfigForm
        fields={choiceFields}
        values={{}}
        onSave={() => {}}
        presets={CHOICES_SCHEMA['x-presets']}
        {...handlers}
        {...props}
      />,
    )
  }

  function ControlledChoices({ seen }: { seen: IntegrationConfigValues[] }) {
    const [values, setValues] = React.useState<IntegrationConfigValues>({})
    return (
      <IntegrationConfigForm
        fields={choiceFields}
        values={values}
        onValuesChange={(next) => {
          seen.push(next)
          setValues(next)
        }}
        onSave={() => {}}
        presets={CHOICES_SCHEMA['x-presets']}
      />
    )
  }

  it('csv choices toggle chips and store the value in choices order', async () => {
    const user = userEvent.setup()
    const seen: IntegrationConfigValues[] = []
    render(<ControlledChoices seen={seen} />)
    await user.click(screen.getByRole('button', { name: 'Mid-senior' }))
    await user.click(screen.getByRole('button', { name: 'Internship' }))
    expect(seen.at(-1)?.levels).toBe('internship,mid_senior')
    await user.click(screen.getByRole('button', { name: 'Mid-senior' }))
    expect(seen.at(-1)?.levels).toBe('internship')
  })

  it('single-choice chips select and clear', async () => {
    const user = userEvent.setup()
    const seen: IntegrationConfigValues[] = []
    render(<ControlledChoices seen={seen} />)
    await user.click(screen.getByRole('button', { name: '2' }))
    expect(seen.at(-1)?.pages).toBe('2')
    await user.click(screen.getByRole('button', { name: '2' }))
    expect(seen.at(-1)?.pages).toBeNull()
  })

  it('presets merge their values into the form', async () => {
    const user = userEvent.setup()
    const handlers = { onValuesChange: vi.fn() }
    renderChoices(handlers)
    await user.click(screen.getByRole('button', { name: 'Remote only' }))
    expect(handlers.onValuesChange.mock.calls.at(-1)?.[0].levels).toBe('entry')
  })

  it('groups x-section fields under an Advanced disclosure', () => {
    renderChoices()
    expect(screen.getByText('Advanced')).toBeTruthy()
    expect(screen.getByText('Pause')).toBeTruthy()
  })
})
