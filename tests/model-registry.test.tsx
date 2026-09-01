import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  CapabilityChips,
  type CapabilityDescriptor,
} from '../src/components/capability-chips/CapabilityChips'
import {
  ModelRegistry,
  type ModelRegistryModel,
  type ModelRegistryProvider,
  type ModelRegistryRemoteModel,
} from '../src/components/model-registry/ModelRegistry'

const caps: CapabilityDescriptor[] = [
  { value: 'text', label: 'Text' },
  { value: 'vision', label: 'Vision' },
  { value: 'tools', label: 'Tools' },
  { value: 'embeddings', label: 'Embeddings' },
  { value: 'audio', label: 'Audio' },
]

describe('CapabilityChips', () => {
  it('toggles chips on and off via onToggle', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <CapabilityChips caps={caps} selected={['text']} onToggle={onToggle} ariaLabel="Caps" />,
    )
    expect(screen.getByRole('button', { name: 'Text' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'Vision' }))
    expect(onToggle).toHaveBeenCalledWith('vision')
    await user.click(screen.getByRole('button', { name: 'Text' }))
    expect(onToggle).toHaveBeenCalledWith('text')
  })

  it('locks removal below minSelected', () => {
    const onToggle = vi.fn()
    render(
      <CapabilityChips
        caps={caps}
        selected={['text']}
        onToggle={onToggle}
        minSelected={1}
        ariaLabel="Caps"
      />,
    )
    expect(screen.getByRole('button', { name: 'Text' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Vision' })).toBeEnabled()
  })

  it('badge variant renders non-interactive chips', () => {
    render(<CapabilityChips variant="badge" caps={caps} selected={['text']} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <CapabilityChips caps={caps} selected={['text']} onToggle={vi.fn()} ariaLabel="Caps" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

const providers: ModelRegistryProvider[] = [
  {
    id: 'p1',
    name: 'Ollama (local)',
    type: 'openai_compatible',
    baseUrl: 'http://localhost:11434/v1',
  },
]

const models: ModelRegistryModel[] = [
  {
    id: 'm1',
    providerId: 'p1',
    externalId: 'qwen2.5-vl',
    label: 'Qwen VL',
    caps: ['text', 'vision'],
    enabled: true,
    reasoningEffort: 'medium',
    temperature: 0.4,
  },
]

const remote: ModelRegistryRemoteModel[] = [
  { id: 'llava', caps: ['text', 'vision'] },
  { id: 'nomic-embed-text', caps: ['embeddings'] },
  { id: 'tiny-random', caps: [] },
]

function RegistryDemo(props: Partial<React.ComponentProps<typeof ModelRegistry>>) {
  const [expanded, setExpanded] = React.useState<string | null>('p1')
  const [modelsState, setModelsState] = React.useState(models)
  return (
    <ModelRegistry
      providers={providers}
      models={modelsState}
      caps={caps}
      expandedProviderId={expanded}
      onExpandedProviderChange={setExpanded}
      remoteModels={remote}
      remoteState="ready"
      onAddModel={(providerId, draft) =>
        setModelsState((current) => [
          ...current,
          {
            id: `new-${current.length}`,
            providerId,
            externalId: draft.externalId,
            label: draft.label,
            caps: draft.caps,
            enabled: true,
            reasoningEffort: draft.reasoningEffort,
            temperature: draft.temperature,
            maxTokens: draft.maxTokens,
            extra: draft.extra,
          },
        ])
      }
      onUpdateModel={(model, patch) =>
        setModelsState((current) =>
          current.map((entry) => (entry.id === model.id ? { ...entry, ...patch } : entry)),
        )
      }
      onDeleteModel={(model) =>
        setModelsState((current) => current.filter((entry) => entry.id !== model.id))
      }
      reasoningEffortOptions={['none', 'low', 'medium', 'high']}
      {...props}
    />
  )
}

async function openAddModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Add model' }))
  return await screen.findByRole('dialog')
}

describe('ModelRegistry', () => {
  it('expands and collapses a provider via its header', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo />)
    const header = screen.getByRole('button', { name: /Ollama \(local\)/ })
    expect(header).toHaveAttribute('aria-expanded', 'true')
    await user.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
  })

  it('adds a model through the catalog modal (picker + cap correction)', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    const dialog = await openAddModal(user)
    const picker = within(dialog).getByRole('combobox', { name: 'Model' })
    await user.click(picker)
    await user.click(screen.getByRole('option', { name: 'llava' }))
    expect(within(dialog).getByRole('button', { name: 'Vision' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Vision' }))
    await user.click(within(dialog).getByRole('button', { name: 'Tools' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith('p1', {
      externalId: 'llava',
      label: 'Llava',
      caps: ['text', 'tools'],
      reasoningEffort: '',
      temperature: null,
      maxTokens: null,
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('auto-fills an editable display name from the id (health-style beautifier)', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(
      <RegistryDemo
        onAddModel={onAddModel}
        remoteModels={[
          { id: 'gpt-4o-mini', caps: ['text'] },
          { id: 'llama-3.1-8b', caps: ['text'] },
        ]}
      />,
    )
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('combobox', { name: 'Model' }))
    await user.click(screen.getByRole('option', { name: 'gpt-4o-mini' }))
    expect(within(dialog).getByLabelText('Display label')).toHaveValue('GPT 4o Mini')
    await user.type(within(dialog).getByLabelText('Display label'), '!')
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ externalId: 'gpt-4o-mini', label: 'GPT 4o Mini!' }),
    )
  })

  it('supports manual ids in the modal', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('button', { name: /manual/i }))
    await user.type(within(dialog).getByLabelText('Model'), 'custom-model')
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ externalId: 'custom-model', caps: ['text'] }),
    )
  })

  it('selects reasoning effort from the dropdown with a custom option', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('combobox', { name: 'Model' }))
    await user.click(screen.getByRole('option', { name: 'llava' }))
    await user.selectOptions(within(dialog).getByLabelText('Reasoning effort'), 'high')
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ reasoningEffort: 'high' }),
    )

  })

  it('reasoning effort supports a custom value', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('combobox', { name: 'Model' }))
    await user.click(screen.getByRole('option', { name: 'llava' }))
    await user.selectOptions(within(dialog).getByLabelText('Reasoning effort'), '__custom__')
    await user.type(within(dialog).getByLabelText('Reasoning effort'), 'wizard')
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ reasoningEffort: 'wizard' }),
    )
  })

  it('sets and clears temperature and max tokens', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('combobox', { name: 'Model' }))
    await user.click(screen.getByRole('option', { name: 'llava' }))
    await user.type(within(dialog).getByLabelText('Temperature'), '0.7')
    await user.type(within(dialog).getByLabelText('Max tokens'), '4096')
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ temperature: 0.7, maxTokens: 4096 }),
    )

  })

  it('clears temperature back to unset', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('combobox', { name: 'Model' }))
    await user.click(screen.getByRole('option', { name: 'llava' }))
    await user.type(within(dialog).getByLabelText('Temperature'), '0.9')
    await user.click(within(dialog).getByRole('button', { name: 'Temperature clear' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ temperature: null }),
    )
  })

  it('edits an existing model through the same modal', async () => {
    const user = userEvent.setup()
    const onUpdateModel = vi.fn()
    render(<RegistryDemo onUpdateModel={onUpdateModel} />)
    await user.click(await screen.findByRole('button', { name: 'Edit qwen2.5-vl' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('qwen2.5-vl')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Display label'), '2')
    await user.clear(within(dialog).getByLabelText('Temperature'))
    await user.type(within(dialog).getByLabelText('Temperature'), '0.9')
    await user.click(within(dialog).getByRole('button', { name: 'Tools' }))
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))
    expect(onUpdateModel).toHaveBeenCalledWith(
      models[0],
      expect.objectContaining({
        label: 'Qwen VL2',
        caps: ['text', 'vision', 'tools'],
        reasoningEffort: 'medium',
        temperature: 0.9,
      }),
    )
  })

  it('emits onDeleteModel from the remove button', async () => {
    const user = userEvent.setup()
    const onDeleteModel = vi.fn()
    render(<RegistryDemo onDeleteModel={onDeleteModel} />)
    await user.click(await screen.findByRole('button', { name: 'Remove qwen2.5-vl' }))
    expect(onDeleteModel).toHaveBeenCalledWith(models[0])
  })

  it('add-all fires with the pending drafts from the modal footer', async () => {
    const user = userEvent.setup()
    const onAddAll = vi.fn()
    render(<RegistryDemo onAddAll={onAddAll} />)
    const dialog = await openAddModal(user)
    await user.click(within(dialog).getByRole('button', { name: /Add all \(3\)/ }))
    expect(onAddAll).toHaveBeenCalledWith(
      'p1',
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'llava' }),
        expect.objectContaining({ externalId: 'tiny-random' }),
      ]),
    )
  })

  it('shows the remote error state with retry inside the modal', async () => {
    const user = userEvent.setup()
    const onRetryRemote = vi.fn()
    render(
      <RegistryDemo
        remoteModels={undefined}
        remoteState="error"
        remoteError="connection refused"
        onRetryRemote={onRetryRemote}
      />,
    )
    const dialog = await openAddModal(user)
    expect(within(dialog).getByText('connection refused')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }))
    expect(onRetryRemote).toHaveBeenCalled()
  })

  it('shows the remote loading state inside the modal', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo remoteModels={undefined} remoteState="loading" />)
    const dialog = await openAddModal(user)
    expect(within(dialog).getByText('Loading models…')).toBeInTheDocument()
  })

  it('renders the providers empty state with the action slot', () => {
    render(
      <RegistryDemo
        providers={[]}
        models={[]}
        emptyAction={<button type="button" data-testid="empty-action">Wizard</button>}
      />,
    )
    expect(screen.getByText('No providers yet.')).toBeInTheDocument()
    expect(screen.getByTestId('empty-action')).toBeInTheDocument()
  })

  it('hides add/edit/remove for a readOnly provider but keeps its rows', async () => {
    const readOnlyProviders: ModelRegistryProvider[] = [
      { id: 'p1', name: 'Ollama (local)', type: 'openai_compatible', readOnly: true },
    ]
    render(<RegistryDemo providers={readOnlyProviders} />)
    expect(await screen.findByText('qwen2.5-vl')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add model' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit qwen2.5-vl' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove qwen2.5-vl' })).not.toBeInTheDocument()
  })

  it('has no axe violations with a readOnly provider', async () => {
    const readOnlyProviders: ModelRegistryProvider[] = [
      { id: 'p1', name: 'Ollama (local)', type: 'openai_compatible', readOnly: true },
    ]
    const { container } = render(<RegistryDemo providers={readOnlyProviders} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('is keyboard operable through the picker inside the modal', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo />)
    const dialog = await openAddModal(user)
    const picker = within(dialog).getByRole('combobox', { name: 'Model' })
    picker.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('option', { name: 'llava' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
  })

  it('has no axe violations closed and with the modal open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <RegistryDemo emptyAction={<button type="button">Wizard</button>} />,
    )
    expect(await axe(container)).toHaveNoViolations()
    await openAddModal(user)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('ModelRegistry extra fields and enable toggle', () => {
  const extraFields = [
    { key: 'description', label: 'Description', placeholder: 'What is it for?', multiline: true },
    { key: 'tier', label: 'Tier' },
  ]

  it('renders extra fields in the add modal and submits their values', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} extraFields={extraFields} />)
    const dialog = await openAddModal(user)
    expect(within(dialog).getByLabelText('Description')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Tier')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Tier'), 'flagship')
    await user.click(within(dialog).getByRole('combobox', { name: 'Model' }))
    await user.click(screen.getByRole('option', { name: 'llava' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add model' }))
    expect(onAddModel).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ externalId: 'llava', extra: { tier: 'flagship' } }),
    )
  })

  it('round-trips a stored extra value and carries a cleared value in the patch', async () => {
    const user = userEvent.setup()
    const onUpdateModel = vi.fn()
    const withExtra: ModelRegistryModel[] = [
      { ...models[0]!, extra: { description: 'Vision model.' } },
    ]
    render(<RegistryDemo onUpdateModel={onUpdateModel} models={withExtra} extraFields={extraFields} />)
    await user.click(await screen.findByRole('button', { name: 'Edit qwen2.5-vl' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText('Description')).toHaveValue('Vision model.')
    await user.clear(within(dialog).getByLabelText('Description'))
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))
    expect(onUpdateModel).toHaveBeenCalledWith(
      withExtra[0],
      expect.objectContaining({ extra: { description: '' } }),
    )
  })

  it('omits extra from the patch when the fields were never touched', async () => {
    const user = userEvent.setup()
    const onUpdateModel = vi.fn()
    render(<RegistryDemo onUpdateModel={onUpdateModel} extraFields={extraFields} />)
    await user.click(await screen.findByRole('button', { name: 'Edit qwen2.5-vl' }))
    await user.click(await screen.findByRole('button', { name: 'Save' }))
    expect(onUpdateModel).toHaveBeenCalledWith(
      models[0],
      expect.not.objectContaining({ extra: expect.anything() }),
    )
  })

  it('toggles a model via the row checkbox (mouse + keyboard)', async () => {
    const user = userEvent.setup()
    function ToggleDemo() {
      const [modelsState, setModelsState] = React.useState(models)
      return (
        <RegistryDemo
          models={modelsState}
          onToggleEnabled={(model, enabled) =>
            setModelsState((current) =>
              current.map((entry) => (entry.id === model.id ? { ...entry, enabled } : entry)),
            )
          }
        />
      )
    }
    render(<ToggleDemo />)
    const checkbox = await screen.findByRole('checkbox', { name: 'Enabled — qwen2.5-vl' })
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    checkbox.focus()
    await user.keyboard(' ')
    expect(checkbox).toBeChecked()
  })

  it('hides the row checkbox for readOnly providers and without the handler', async () => {
    const readOnlyProviders: ModelRegistryProvider[] = [
      { id: 'p1', name: 'Ollama (local)', type: 'openai_compatible', readOnly: true },
    ]
    render(<RegistryDemo providers={readOnlyProviders} onToggleEnabled={vi.fn()} />)
    await screen.findByText('qwen2.5-vl')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

    render(<RegistryDemo models={[]} />)
    await screen.findByRole('button', { name: 'Add model' })
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('has no axe violations with the toggle and extra fields', async () => {
    const { container } = render(
      <RegistryDemo onToggleEnabled={vi.fn()} extraFields={extraFields} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
