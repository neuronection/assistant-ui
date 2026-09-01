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
  { id: 'p1', name: 'Ollama (local)', type: 'openai_compatible', baseUrl: 'http://localhost:11434/v1' },
  { id: 'p2', name: 'Cloud', type: 'google' },
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
  },
  { id: 'm2', providerId: 'p1', externalId: 'nomic-embed-text', caps: ['embeddings'], enabled: true },
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

describe('ModelRegistry', () => {

  async function openCatalog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /Browse catalog/ }))
  }
  it('expands and collapses a provider via its header', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo />)
    const header = screen.getByRole('button', { name: /Ollama \(local\)/ })
    expect(header).toHaveAttribute('aria-expanded', 'true')
    await user.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
  })

  it('quick-adds a remote model with the guessed caps', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    await openCatalog(user)
    await user.click(screen.getByRole('button', { name: 'Add llava' }))
    expect(onAddModel).toHaveBeenCalledWith('p1', {
      externalId: 'llava',
      caps: ['text', 'vision'],
    })
  })

  it('configures a remote model before adding (cap correction)', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    await openCatalog(user)
    await user.click(screen.getByRole('button', { name: 'Configure llava' }))
    const panel = screen
      .getByText('Display label')
      .closest('[data-as="model-registry-draft"]') as HTMLElement
    expect(within(panel).getByRole('button', { name: 'Vision' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(within(panel).getByRole('button', { name: 'Vision' }))
    await user.click(within(panel).getByRole('button', { name: 'Tools' }))
    await user.click(within(panel).getByRole('button', { name: /Add model/ }))
    expect(onAddModel).toHaveBeenCalledWith('p1', {
      externalId: 'llava',
      label: undefined,
      caps: ['text', 'tools'],
      reasoningEffort: '',
    })
  })

  it('manual add requires an external id', async () => {
    const user = userEvent.setup()
    const onAddModel = vi.fn()
    render(<RegistryDemo onAddModel={onAddModel} />)
    await openCatalog(user)
    await user.click(screen.getByRole('button', { name: /Add manually/ }))
    const confirm = screen.getByRole('button', { name: /Add model/ })
    expect(confirm).toBeDisabled()
    await user.type(screen.getByLabelText('Model ID'), 'custom-model')
    await user.click(confirm)
    expect(onAddModel).toHaveBeenCalledWith('p1', expect.objectContaining({ externalId: 'custom-model' }))
  })

  it('edits an existing model inline (label, caps, reasoning effort)', async () => {
    const user = userEvent.setup()
    const onUpdateModel = vi.fn()
    render(<RegistryDemo onUpdateModel={onUpdateModel} />)
    await user.click(screen.getByRole('button', { name: 'Edit qwen2.5-vl' }))
    const panel = screen
      .getByText('Display label')
      .closest('[data-as="model-registry-draft"]') as HTMLElement
    expect(screen.getByLabelText('Model ID')).toBeDisabled()
    await user.type(within(panel).getByLabelText('Display label'), '2')
    await user.clear(within(panel).getByLabelText('Reasoning effort'))
    await user.type(within(panel).getByLabelText('Reasoning effort'), 'high')
    await user.click(within(panel).getByRole('button', { name: 'Tools' }))
    await user.click(within(panel).getByRole('button', { name: /Save/ }))
    expect(onUpdateModel).toHaveBeenCalledWith(
      models[0],
      expect.objectContaining({
        label: 'Qwen VL2',
        caps: ['text', 'vision', 'tools'],
        reasoningEffort: 'high',
      }),
    )
  })

  it('emits onDeleteModel from the remove button', async () => {
    const user = userEvent.setup()
    const onDeleteModel = vi.fn()
    render(<RegistryDemo onDeleteModel={onDeleteModel} />)
    await user.click(screen.getByRole('button', { name: /Remove qwen2\.5-vl/ }))
    expect(onDeleteModel).toHaveBeenCalledWith(models[0])
  })

  it('filters the remote catalog by capability and the unclassified pseudo-cap', async () => {
    const user = userEvent.setup()
    const { container } = render(<RegistryDemo />)
    await openCatalog(user)
    const catalog = within(
      container.querySelector('[data-as="model-registry-catalog"]') as HTMLElement,
    )
    await user.click(screen.getByRole('button', { name: 'Embeddings' }))
    expect(catalog.getByText('nomic-embed-text')).toBeInTheDocument()
    expect(catalog.queryByText('llava')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Embeddings' }))
    await user.click(screen.getByRole('button', { name: 'Unclassified' }))
    expect(catalog.getByText('tiny-random')).toBeInTheDocument()
    expect(catalog.queryByText('llava')).not.toBeInTheDocument()
  })

  it('searches the remote catalog with substring matching', async () => {
    const user = userEvent.setup()
    const { container } = render(<RegistryDemo />)
    await openCatalog(user)
    const catalog = within(
      container.querySelector('[data-as="model-registry-catalog"]') as HTMLElement,
    )
    await user.type(screen.getByRole('textbox', { name: 'Search models' }), 'llav')
    expect(catalog.getByText('llava')).toBeInTheDocument()
    expect(catalog.queryByText('nomic-embed-text')).not.toBeInTheDocument()
  })

  it('marks already-registered remote models as added and offers edit instead', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo />)
    await openCatalog(user)
    expect(screen.getByText('Added')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add nomic-embed-text' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Edit nomic-embed-text' })).toHaveLength(2)
  })

  it('add-all fires with the filtered pending drafts (existing excluded)', async () => {
    const user = userEvent.setup()
    const onAddAll = vi.fn()
    render(<RegistryDemo onAddAll={onAddAll} />)
    await openCatalog(user)
    await user.click(screen.getByRole('button', { name: /Add all \(2\)/ }))
    expect(onAddAll).toHaveBeenCalledWith(
      'p1',
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'llava' }),
        expect.objectContaining({ externalId: 'tiny-random' }),
      ]),
    )
  })

  it('shows the remote error state with retry', async () => {
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
    await openCatalog(user)
    expect(screen.getByText('connection refused')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetryRemote).toHaveBeenCalled()
  })

  it('shows the remote loading state', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo remoteModels={undefined} remoteState="loading" />)
    await openCatalog(user)
    expect(screen.getByText('Loading models…')).toBeInTheDocument()
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

  it('hides the catalog zone until the browse trigger opens it', () => {
    render(<RegistryDemo />)
    expect(screen.queryByRole('button', { name: 'Add llava' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Search models' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Browse catalog/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('is keyboard operable through the row configure button', async () => {
    const user = userEvent.setup()
    render(<RegistryDemo />)
    await openCatalog(user)
    const configure = screen.getByRole('button', { name: 'Configure llava' })
    configure.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Display label')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <RegistryDemo emptyAction={<button type="button" data-testid="empty-action">Wizard</button>} />,
    )
    expect(await axe(container)).toHaveNoViolations()
    await openCatalog(user)
    expect(await axe(container)).toHaveNoViolations()
  })
})
