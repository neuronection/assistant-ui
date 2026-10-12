import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  ModelPicker,
  type ModelPickerProvider,
} from '../src/components/model-picker/ModelPicker'
import {
  TaskAssignmentPicker,
  type TaskAssignmentTask,
} from '../src/components/task-assignment-picker/TaskAssignmentPicker'

const providers: ModelPickerProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-5', name: 'GPT-5', capability: 'vision' },
      { id: 'gpt-5-mini', name: 'GPT-5 mini' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [{ id: 'claude', name: 'Claude', capability: 'tools' }],
  },
]

describe('ModelPicker', () => {
  it('shows grouped provider→model options with capability badges and selects', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ModelPicker providers={providers} value="" onChange={onChange} label="Model" />)
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('Anthropic')).toBeInTheDocument()
    expect(screen.getByText('vision')).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: /Claude/ }))
    expect(onChange).toHaveBeenCalledWith('claude')
  })

  it('shows the selected model name in the trigger', () => {
    render(<ModelPicker providers={providers} value="gpt-5" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('GPT-5')
  })

  it('has no axe violations closed', async () => {
    const { container } = render(
      <ModelPicker providers={providers} value="" onChange={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

const tasks: TaskAssignmentTask[] = [
  { id: 'summarize', label: 'Summarize documents', description: 'Daily digests' },
  { id: 'chat', label: 'Chat' },
]

function AssignmentDemo(props: Partial<React.ComponentProps<typeof TaskAssignmentPicker>>) {
  const [value, setValue] = React.useState<Record<string, string | null>>({
    summarize: 'gpt-5',
  })
  return (
    <TaskAssignmentPicker
      tasks={tasks}
      providers={providers}
      value={value}
      onAssign={(taskId, modelId) =>
        setValue((current) => ({ ...current, [taskId]: modelId }))
      }
      {...props}
    />
  )
}

describe('TaskAssignmentPicker', () => {
  it('renders tasks with icon tiles and the selection in the trigger', () => {
    render(<AssignmentDemo />)
    expect(screen.getAllByText('Summarize documents').length).toBeGreaterThan(0)
    expect(screen.getByText('Daily digests')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Summarize documents' })).toHaveTextContent(
      'GPT-5',
    )
    expect(screen.getByRole('combobox', { name: 'Chat' })).toHaveTextContent(
      /select a model/i,
    )
  })

  it('assigns a model to a task via the row picker', async () => {
    const user = userEvent.setup()
    render(<AssignmentDemo />)
    const rows = screen.getAllByRole('combobox')
    await user.click(rows[1]!)
    await user.click(screen.getByRole('option', { name: /Claude/ }))
    expect(screen.getByRole('combobox', { name: 'Chat' })).toHaveTextContent('Claude')
  })

  it('clears an assignment with the X button', async () => {
    const user = userEvent.setup()
    render(<AssignmentDemo />)
    await user.click(
      screen.getByRole('button', {
        name: 'Clear assignment — Summarize documents',
      }),
    )
    expect(screen.getByRole('combobox', { name: 'Summarize documents' })).toHaveTextContent(
      /select a model/i,
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(<AssignmentDemo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('TaskAssignmentPicker v2', () => {
  const capProviders: ModelPickerProvider[] = [
    {
      id: 'local',
      name: 'Ollama',
      models: [
        { id: 'qwen-vl', name: 'Qwen VL', capabilities: ['text', 'vision'] },
        { id: 'nomic', name: 'Nomic Embed', capabilities: ['embeddings'] },
        { id: 'llama', name: 'Llama', capabilities: ['text', 'tools'] },
      ],
    },
  ]

  const capTasks: TaskAssignmentTask[] = [
    { id: 'ocr', label: 'Page OCR', requires: 'vision' },
    { id: 'embed', label: 'Embeddings', requires: 'embeddings' },
  ]

  it('offers only models matching the task requires', async () => {
    const user = userEvent.setup()
    render(
      <TaskAssignmentPicker
        tasks={capTasks}
        providers={capProviders}
        value={{}}
        onAssign={vi.fn()}
      />,
    )
    const rows = screen.getAllByRole('combobox')
    await user.click(rows[0]!)
    expect(screen.getByRole('option', { name: /Qwen VL/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Llama/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Nomic/ })).not.toBeInTheDocument()
  })

  it('renders sections with the fallback picker when enabled', async () => {
    const user = userEvent.setup()
    const onAssignSecondary = vi.fn()
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={[
          {
            id: 'defaults',
            label: 'Default models',
            secondary: true,
            tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
          },
          { id: 'overrides', label: 'Per-task overrides', tasks: capTasks },
        ]}
        providers={capProviders}
        value={{ text: 'llama' }}
        secondaryValue={{}}
        onAssign={vi.fn()}
        onAssignSecondary={onAssignSecondary}
        secondaryLabel="Fallback model"
      />,
    )
    expect(screen.getByText('Default models')).toBeInTheDocument()
    expect(screen.getByText('Per-task overrides')).toBeInTheDocument()
    const fallback = screen.getByRole('combobox', {
      name: 'Fallback model — Default text model',
    })
    await user.click(fallback)
    await user.click(screen.getByRole('option', { name: /Qwen VL/ }))
    expect(onAssignSecondary).toHaveBeenCalledWith('text', 'qwen-vl')
    expect(screen.getAllByRole('combobox')).toHaveLength(4)
  })

  it('clears the fallback assignment with its own X', async () => {
    const user = userEvent.setup()
    const onAssignSecondary = vi.fn()
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={[
          {
            id: 'defaults',
            label: 'Default models',
            secondary: true,
            tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
          },
        ]}
        providers={capProviders}
        value={{ text: 'llama' }}
        secondaryValue={{ text: 'qwen-vl' }}
        onAssign={vi.fn()}
        onAssignSecondary={onAssignSecondary}
      />,
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Clear assignment — Fallback Default text model',
      }),
    )
    expect(onAssignSecondary).toHaveBeenCalledWith('text', null)
  })

  it('renders primary/fallback badges with info popups', async () => {
    const user = userEvent.setup()
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={[
          {
            id: 'defaults',
            label: 'Default models',
            secondary: true,
            tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
          },
        ]}
        providers={capProviders}
        value={{ text: 'llama' }}
        secondaryValue={{}}
        onAssign={vi.fn()}
        onAssignSecondary={vi.fn()}
        primaryLabel="Primary"
        primaryInfo="Serves every run of this task."
        fallbackInfo="Used when the primary fails."
      />,
    )
    expect(screen.getAllByText('Primary').length).toBeGreaterThan(0)
    expect(screen.getByText('Fallback')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Primary — Default text model' }))
    expect(await screen.findByText('Serves every run of this task.')).toBeInTheDocument()
  })

  it('renders the renderMeta slot per row', () => {
    render(
      <TaskAssignmentPicker
        tasks={capTasks}
        providers={capProviders}
        value={{}}
        onAssign={vi.fn()}
        renderMeta={(task) => <span data-testid={`meta-${task.id}`}>meta for {task.id}</span>}
      />,
    )
    expect(screen.getByTestId('meta-ocr')).toHaveTextContent('meta for ocr')
    expect(screen.getByTestId('meta-embed')).toHaveTextContent('meta for embed')
  })

  it('renders a fallback-only row without the primary picker', async () => {
    const user = userEvent.setup()
    const onAssignSecondary = vi.fn()
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={[
          {
            id: 'fallback',
            label: 'Global fallback',
            tasks: [{ id: 'default', label: 'Global default model', secondaryOnly: true }],
          },
        ]}
        providers={capProviders}
        value={{}}
        secondaryValue={{ default: 'llama' }}
        onAssign={vi.fn()}
        onAssignSecondary={onAssignSecondary}
        secondaryLabel="Fallback model"
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Fallback model — Global default model' })).toBeEnabled()
    expect(screen.queryByRole('combobox', { name: 'Global default model' })).not.toBeInTheDocument()
    expect(screen.getByText('Fallback model')).toBeInTheDocument()
    expect(screen.queryByText('Primary')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Clear assignment — Fallback model Global default model' }),
    )
    expect(onAssignSecondary).toHaveBeenCalledWith('default', null)
  })

  it('fallback-only rows are keyboard-reachable and axe-clean', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TaskAssignmentPicker
        tasks={[
          { id: 'default', label: 'Global default model', secondaryOnly: true },
          { id: 'chat', label: 'Chat' },
        ]}
        providers={capProviders}
        value={{}}
        secondaryValue={{ default: 'llama' }}
        onAssign={vi.fn()}
        onAssignSecondary={vi.fn()}
      />,
    )
    const fallback = screen.getByRole('combobox', { name: 'Fallback — Global default model' })
    const fallbackClear = screen.getByRole('button', {
      name: 'Clear assignment — Fallback Global default model',
    })
    const primary = screen.getByRole('combobox', { name: 'Chat' })
    await user.tab()
    expect(fallback).toHaveFocus()
    await user.tab()
    expect(fallbackClear).toHaveFocus()
    await user.tab()
    expect(primary).toHaveFocus()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with sections and fallbacks', async () => {
    const { container } = render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={[
          {
            id: 'defaults',
            label: 'Default models',
            secondary: true,
            tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
          },
        ]}
        providers={capProviders}
        value={{ text: 'llama' }}
        secondaryValue={{}}
        onAssign={vi.fn()}
        onAssignSecondary={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('TaskAssignmentPicker decision slots (plan 26 / ADR-0032)', () => {
  const decisionProviders: ModelPickerProvider[] = [
    {
      id: 'typesafe',
      name: 'TypeSafe',
      models: [{ id: 'jev-latest', name: 'Jev (latest)', capabilities: ['decision'] }],
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      models: [
        { id: 'openrouter/auto', name: 'Auto (best match)', capabilities: ['text', 'tools'] },
        { id: 'openrouter.jev-latest', name: 'Jev via OpenRouter', capabilities: ['decision'] },
      ],
    },
  ]

  const decisionSections = [
    {
      id: 'decision',
      label: 'Decision models',
      description: 'Cloud decision models are opt-in.',
      secondary: true,
      tasks: [
        { id: 'decision:tool-dispatch', label: 'Tool dispatch', requires: 'decision' },
        { id: 'decision:boolean-gate', label: 'Boolean gate', requires: 'decision' },
      ],
    },
    {
      id: 'defaults',
      label: 'Default models',
      secondary: true,
      tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
    },
  ]

  it('renders the Decision models group with primary + fallback pickers', () => {
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={decisionSections}
        providers={decisionProviders}
        value={{
          'decision:tool-dispatch': 'jev-latest',
          'decision:boolean-gate': null,
          text: 'openrouter/auto',
        }}
        secondaryValue={{ 'decision:tool-dispatch': 'openrouter.jev-latest' }}
        onAssign={vi.fn()}
        onAssignSecondary={vi.fn()}
      />,
    )
    expect(screen.getByText('Decision models')).toBeInTheDocument()
    expect(screen.getByText('Cloud decision models are opt-in.')).toBeInTheDocument()
    const primary = screen.getByRole('combobox', { name: 'Tool dispatch' })
    expect(primary).toHaveTextContent('Jev (latest)')
    const fallback = screen.getByRole('combobox', {
      name: 'Fallback — Tool dispatch',
    })
    expect(fallback).toHaveTextContent('Jev via OpenRouter')
  })

  it('offers only decision-capable models in decision:<cap> slots (slot separation)', async () => {
    const user = userEvent.setup()
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={decisionSections}
        providers={decisionProviders}
        value={{}}
        secondaryValue={{}}
        onAssign={vi.fn()}
        onAssignSecondary={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Boolean gate' }))
    expect(screen.getByRole('option', { name: /Jev \(latest\)/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Jev via OpenRouter/ })).toBeInTheDocument()
    // text/tools models never satisfy a decision slot
    expect(screen.queryByRole('option', { name: /Auto \(best match\)/ })).not.toBeInTheDocument()
    // and the reverse: the text default never lists decision models
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('combobox', { name: 'Default text model' }))
    expect(screen.getByRole('option', { name: /Auto \(best match\)/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Jev \(latest\)/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Jev via OpenRouter/ })).not.toBeInTheDocument()
  })

  it('assigns a decision model and its cross-provider fallback', async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn()
    const onAssignSecondary = vi.fn()
    render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={decisionSections}
        providers={decisionProviders}
        value={{}}
        secondaryValue={{}}
        onAssign={onAssign}
        onAssignSecondary={onAssignSecondary}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Boolean gate' }))
    await user.click(screen.getByRole('option', { name: /Jev via OpenRouter/ }))
    expect(onAssign).toHaveBeenCalledWith('decision:boolean-gate', 'openrouter.jev-latest')
    await user.click(screen.getByRole('combobox', { name: 'Fallback — Tool dispatch' }))
    await user.click(screen.getByRole('option', { name: /Jev \(latest\)/ }))
    expect(onAssignSecondary).toHaveBeenCalledWith('decision:tool-dispatch', 'jev-latest')
  })

  it('has no axe violations with the Decision group', async () => {
    const { container } = render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={decisionSections}
        providers={decisionProviders}
        value={{}}
        secondaryValue={{}}
        onAssign={vi.fn()}
        onAssignSecondary={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
