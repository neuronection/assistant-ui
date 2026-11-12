import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  SetupReview,
  type SetupReviewModel,
  type SetupReviewOptions,
  type SetupReviewSlot,
} from '../src/components/setup-review/SetupReview'

const chatModels: SetupReviewModel[] = [
  { id: 'gpt-5.6-terra', name: 'gpt-5.6-terra', caps: ['text'], selected: true },
  { id: 'gpt-5.6-luna', name: 'gpt-5.6-luna', caps: ['text', 'vision'], selected: true },
  { id: 'whisper-1', name: 'whisper-1', caps: ['stt'], selected: true },
]

const chatSlots: SetupReviewSlot[] = [
  {
    id: 'chat',
    label: 'Fill default text model',
    bind: true,
    currentValue: 'now: gpt-5.6-terra',
    optionsKey: 'bindChat',
  },
  {
    id: 'vision',
    label: 'Fill default vision model',
    bind: false,
    currentValue: 'now: unset',
    optionsKey: 'bindVision',
  },
  {
    id: 'stt',
    label: 'Fill default transcription model',
    bind: true,
    currentValue: 'now: whisper-1',
    optionsKey: 'bindStt',
  },
]

function ReviewDemo({
  models = chatModels,
  slots = chatSlots,
  onOptionsChange,
}: {
  models?: SetupReviewModel[]
  slots?: SetupReviewSlot[]
  onOptionsChange?: (options: SetupReviewOptions) => void
}) {
  const [state, setState] = React.useState({ models, slots })
  const handleChange = (options: SetupReviewOptions) => {
    onOptionsChange?.(options)
    setState((current) => ({
      models: current.models.map((model) => ({
        ...model,
        selected: options.curatedIds.includes(model.id),
      })),
      slots: current.slots.map((slot) => ({
        ...slot,
        bind: options[slot.optionsKey],
      })),
    }))
  }
  return (
    <SetupReview
      models={state.models}
      slots={state.slots}
      onOptionsChange={handleChange}
    />
  )
}

describe('SetupReview', () => {
  it('renders capability-icon model cards, switch rows with now: sub-lines and the never-removes footnote', () => {
    render(<ReviewDemo />)
    const group = screen.getByRole('group', { name: /models to save/i })
    expect(
      within(group).getByRole('button', { name: /gpt-5.6-terra/ }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('switch', { name: /Fill default text model/ }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('now: unset')).toBeInTheDocument()
    expect(
      screen.getByText('Existing assignments and models are never removed.'),
    ).toBeInTheDocument()
  })

  it('deselecting a card emits the options body without it', async () => {
    const user = userEvent.setup()
    const onOptionsChange = vi.fn()
    render(<ReviewDemo onOptionsChange={onOptionsChange} />)
    await user.click(screen.getByRole('button', { name: /gpt-5.6-luna/ }))
    expect(onOptionsChange).toHaveBeenLastCalledWith({
      curatedIds: ['gpt-5.6-terra', 'whisper-1'],
      bindChat: true,
      bindVision: false,
      bindStt: true,
      bindDecision: false,
    })
  })

  it('flipping a switch emits the body with that bind flipped', async () => {
    const user = userEvent.setup()
    const onOptionsChange = vi.fn()
    render(<ReviewDemo onOptionsChange={onOptionsChange} />)
    await user.click(screen.getByRole('switch', { name: /Fill default vision model/ }))
    expect(onOptionsChange).toHaveBeenLastCalledWith({
      curatedIds: ['gpt-5.6-terra', 'gpt-5.6-luna', 'whisper-1'],
      bindChat: true,
      bindVision: true,
      bindStt: true,
      bindDecision: false,
    })
  })

  it('decision-only presets show decision slots only', async () => {
    const user = userEvent.setup()
    const onOptionsChange = vi.fn()
    render(
      <ReviewDemo
        models={[
          {
            id: 'jev-latest',
            name: 'jev-latest',
            caps: ['decision'],
            selected: true,
          },
        ]}
        slots={[
          {
            id: 'decision',
            label: 'Fill empty decision slots',
            bind: true,
            currentValue: 'tool dispatch · boolean gate · choice · score',
            optionsKey: 'bindDecision',
          },
        ]}
        onOptionsChange={onOptionsChange}
      />,
    )
    expect(
      screen.getByRole('switch', { name: /Fill empty decision slots/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('switch', { name: /default text model/i }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: /Fill empty decision slots/ }))
    expect(onOptionsChange).toHaveBeenLastCalledWith({
      curatedIds: ['jev-latest'],
      bindChat: false,
      bindVision: false,
      bindStt: false,
      bindDecision: false,
    })
  })

  it('cards and switches are keyboard-operable (Tab + Enter/Space)', async () => {
    const user = userEvent.setup()
    const onOptionsChange = vi.fn()
    render(<ReviewDemo onOptionsChange={onOptionsChange} />)
    await user.tab()
    expect(screen.getByRole('button', { name: /gpt-5.6-terra/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onOptionsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ curatedIds: ['gpt-5.6-luna', 'whisper-1'] }),
    )
    const visionSwitch = screen.getByRole('switch', { name: /Fill default vision model/ })
    visionSwitch.focus()
    await user.keyboard(' ')
    expect(onOptionsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ bindVision: true }),
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(<ReviewDemo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
