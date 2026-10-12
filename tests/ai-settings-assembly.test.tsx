import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  SetupReview,
  type SetupReviewOptions,
} from '../src/components/setup-review/SetupReview'
import {
  TaskAssignmentPicker,
  type TaskAssignmentSection,
} from '../src/components/task-assignment-picker/TaskAssignmentPicker'
import type { ModelPickerProvider } from '../src/components/model-picker/ModelPicker'

/**
 * Plan 26 Phase 2 composition proof: the promoted setup surfaces emit and
 * consume the decision-aware contract end-to-end —
 *  1. `SetupReview` emits the five-bind options body
 *     `{curatedIds, bindChat, bindVision, bindStt, bindDecision}` for a
 *     decision-only preset (decision slots only), and
 *  2. `TaskAssignmentPicker` renders the Decision models group (primary +
 *     fallback) off app-supplied descriptors, filtered by the `decision`
 *     capability (slot separation).
 */

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

const decisionSections: TaskAssignmentSection[] = [
  {
    id: 'decision',
    label: 'Decision models',
    description: 'Cloud decision models are opt-in.',
    secondary: true,
    tasks: [
      { id: 'decision:tool-dispatch', label: 'Tool dispatch', requires: 'decision' },
      { id: 'decision:boolean-gate', label: 'Boolean gate', requires: 'decision' },
      { id: 'decision:choice', label: 'Choice', requires: 'decision' },
      { id: 'decision:score', label: 'Score', requires: 'decision' },
    ],
  },
  {
    id: 'defaults',
    label: 'Default models',
    secondary: true,
    tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
  },
]

function DecisionSetupDemo({
  onOptionsChange,
}: {
  onOptionsChange?: (options: SetupReviewOptions) => void
}) {
  const [options, setOptions] = React.useState<SetupReviewOptions>({
    curatedIds: ['jev-latest'],
    bindChat: false,
    bindVision: false,
    bindStt: false,
    bindDecision: true,
  })
  const models = [
    { id: 'jev-latest', name: 'jev-latest', caps: ['decision'], selected: options.curatedIds.includes('jev-latest') },
  ]
  const slots = [
    {
      id: 'decision',
      label: 'Fill empty decision slots',
      bind: options.bindDecision,
      currentValue: 'tool dispatch · boolean gate · choice · score',
      optionsKey: 'bindDecision' as const,
    },
  ]
  return (
    <SetupReview
      models={models}
      slots={slots}
      onOptionsChange={(next) => {
        setOptions(next)
        onOptionsChange?.(next)
      }}
    />
  )
}

describe('AI settings assembly — decision-aware composition (plan 26 Phase 2)', () => {
  it('SetupReview emits the full five-bind options body for a decision-only preset', async () => {
    const user = userEvent.setup()
    const onOptionsChange = vi.fn()
    render(<DecisionSetupDemo onOptionsChange={onOptionsChange} />)
    await user.click(screen.getByRole('switch', { name: /Fill empty decision slots/ }))
    const emitted = onOptionsChange.mock.lastCall?.[0] as SetupReviewOptions
    expect(Object.keys(emitted).sort()).toEqual([
      'bindChat',
      'bindDecision',
      'bindStt',
      'bindVision',
      'curatedIds',
    ])
    expect(emitted).toEqual({
      curatedIds: ['jev-latest'],
      bindChat: false,
      bindVision: false,
      bindStt: false,
      bindDecision: false,
    })
    await user.click(screen.getByRole('button', { name: /jev-latest/ }))
    expect(onOptionsChange).toHaveBeenLastCalledWith({
      curatedIds: [],
      bindChat: false,
      bindVision: false,
      bindStt: false,
      bindDecision: false,
    })
  })

  it('TaskAssignmentPicker renders the Decision group with primary + fallback off app descriptors', async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn()
    const onAssignSecondary = vi.fn()
    const { container } = render(
      <TaskAssignmentPicker
        tasks={[]}
        sections={decisionSections}
        providers={decisionProviders}
        value={{ 'decision:tool-dispatch': 'jev-latest' }}
        secondaryValue={{ 'decision:tool-dispatch': 'openrouter.jev-latest' }}
        onAssign={onAssign}
        onAssignSecondary={onAssignSecondary}
      />,
    )
    expect(screen.getByText('Decision models')).toBeInTheDocument()
    const primary = screen.getByRole('combobox', { name: 'Tool dispatch' })
    expect(primary).toHaveTextContent('Jev (latest)')
    expect(
      screen.getByRole('combobox', { name: 'Fallback — Tool dispatch' }),
    ).toHaveTextContent('Jev via OpenRouter')

    await user.click(screen.getByRole('combobox', { name: 'Score' }))
    expect(screen.getByRole('option', { name: /Jev \(latest\)/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Jev via OpenRouter/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Auto \(best match\)/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: /Jev via OpenRouter/ }))
    expect(onAssign).toHaveBeenCalledWith('decision:score', 'openrouter.jev-latest')
    expect(await axe(container)).toHaveNoViolations()
  })
})
