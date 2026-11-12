import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  TaskAssignmentPicker,
  type TaskAssignmentTask,
} from '../src/components/task-assignment-picker/TaskAssignmentPicker'
import type { ModelPickerProvider } from '../src/components/model-picker/ModelPicker'

const providers: ModelPickerProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-x', name: 'GPT X', capabilities: ['decision'] },
      { id: 'gpt-chat', name: 'GPT Chat', capabilities: ['text'] },
    ],
  },
]

const kindTask: TaskAssignmentTask = {
  id: 'decision:tool-dispatch',
  label: 'Tool dispatch',
  description: 'Picks tools for automated runs',
  requires: 'decision',
  icon: undefined,
}

describe('TaskAssignmentPicker', () => {
  it('renders rows and filters the catalog by requires', () => {
    render(
      <TaskAssignmentPicker
        tasks={[kindTask, { id: 'chat', label: 'Chat', requires: 'text' }]}
        providers={providers}
        value={{}}
        onAssign={() => {}}
      />,
    )
    expect(screen.getByText('Tool dispatch')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    // 'Chat' row's picker only offers text-capable models
    const chatTrigger = screen.getAllByRole('combobox')[1]
    expect(chatTrigger).toBeInTheDocument()
  })

  it('an unassigned row shows the placeholder — empty means inherit, no explicit option', async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn()
    render(
      <TaskAssignmentPicker
        tasks={[kindTask]}
        providers={providers}
        value={{ 'decision:tool-dispatch': null }}
        onAssign={onAssign}
        placeholder="Inherits from Default decision model"
      />,
    )
    const trigger = screen.getByRole('combobox', {
      name: /tool dispatch/i,
    })
    expect(trigger).toHaveTextContent('Inherits from Default decision model')
    // the inherit state is NOT a selectable option — selecting means a real model
    await user.click(trigger)
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1) // only gpt-x — the decision-capable model
    expect(screen.queryByText('GPT Chat')).toBeNull()
  })

  it('choosing a model assigns it; the row X clears back to unassigned', async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn()
    render(
      <TaskAssignmentPicker
        tasks={[kindTask]}
        providers={providers}
        value={{}}
        onAssign={onAssign}
        placeholder="Inherits from Default decision model"
      />,
    )
    await user.click(screen.getByRole('combobox', { name: /tool dispatch/i }))
    await user.click(await screen.findByRole('option', { name: 'GPT X' }))
    expect(onAssign).toHaveBeenCalledWith('decision:tool-dispatch', 'gpt-x')

    render(
      <TaskAssignmentPicker
        tasks={[kindTask]}
        providers={providers}
        value={{ 'decision:tool-dispatch': 'gpt-x' }}
        onAssign={onAssign}
        clearLabel="Clear assignment"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear assignment — Tool dispatch' }))
    expect(onAssign).toHaveBeenCalledWith('decision:tool-dispatch', null)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TaskAssignmentPicker
        tasks={[kindTask]}
        providers={providers}
        value={{}}
        onAssign={() => {}}
        placeholder="Inherits from Default decision model"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
