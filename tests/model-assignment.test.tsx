import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
  it('renders tasks with the assigned provider/model', () => {
    render(<AssignmentDemo />)
    expect(screen.getByText('Summarize documents')).toBeInTheDocument()
    expect(screen.getByText('Daily digests')).toBeInTheDocument()
    expect(screen.getByText(/OpenAI \/ GPT-5/)).toBeInTheDocument()
    expect(screen.getByText('Not assigned')).toBeInTheDocument()
  })

  it('assigns a model to a task via the row picker', async () => {
    const user = userEvent.setup()
    render(<AssignmentDemo />)
    const rows = screen.getAllByRole('combobox')
    await user.click(rows[1]!)
    await user.click(screen.getByRole('option', { name: /Claude/ }))
    expect(screen.getByText(/Anthropic \/ Claude/)).toBeInTheDocument()
    expect(screen.queryByText('Not assigned')).not.toBeInTheDocument()
  })

  it('clears an assignment with the X button', async () => {
    const user = userEvent.setup()
    render(<AssignmentDemo />)
    const label = screen.getByText('Summarize documents')
    const card = label.closest('div')!.parentElement as HTMLElement
    await user.click(
      within(card).getByRole('button', {
        name: /Clear assignment — Summarize documents/,
      }),
    )
    expect(within(card).getByText('Not assigned')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<AssignmentDemo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
