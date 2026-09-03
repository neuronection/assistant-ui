import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  FlowStatusCard,
  type FlowStep,
} from '../src/components/flow-status/FlowStatusCard'

const runningSteps: FlowStep[] = [
  { id: 'parse', label: 'Parsing document', status: 'done' },
  { id: 'skills', label: 'Extracting skills', status: 'running' },
  { id: 'match', label: 'Matching roles', status: 'pending' },
  { id: 'report', label: 'Writing report', status: 'pending' },
]

const doneSteps: FlowStep[] = [
  { id: 'parse', label: 'Parsing document', status: 'done' },
  { id: 'skills', label: 'Extracting skills', status: 'done' },
]

describe('FlowStatusCard', () => {
  it('renders the title, every step label and the running step emphasized', () => {
    render(
      <FlowStatusCard
        title="Analyzing document"
        steps={runningSteps}
        status="running"
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Analyzing document')).toBeInTheDocument()
    for (const step of runningSteps) {
      expect(screen.getAllByText(step.label).length).toBeGreaterThan(0)
    }
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(runningSteps.length)
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[1]).toHaveTextContent('Extracting skills')
    expect(items[0]).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('status')).toHaveTextContent('2/4')
  })

  it('renders the cancel action while running and fires it with Enter', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <FlowStatusCard
        title="Analyzing document"
        steps={runningSteps}
        status="running"
        onCancel={onCancel}
      />,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders no action buttons when the flow is done', () => {
    render(
      <FlowStatusCard
        title="Analyzing document"
        steps={doneSteps}
        status="done"
        onRetry={vi.fn()}
        onCancel={vi.fn()}
        onResume={vi.fn()}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('2/2')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the error with code and message and fires Retry with Enter', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <FlowStatusCard
        title="Analyzing document"
        steps={[
          { id: 'parse', label: 'Parsing document', status: 'done' },
          { id: 'skills', label: 'Extracting skills', status: 'failed' },
          { id: 'report', label: 'Writing report', status: 'pending' },
        ]}
        status="failed"
        error={{ code: 'provider_timeout', message: 'The model took too long.', retryable: true }}
        onRetry={onRetry}
      />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('provider_timeout')
    expect(alert).toHaveTextContent('The model took too long.')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('hides Retry when the error is not retryable or no handler is given', () => {
    const { rerender } = render(
      <FlowStatusCard
        title="Analyzing document"
        steps={doneSteps}
        status="failed"
        error={{ code: 'quota', message: 'Quota exhausted.', retryable: false }}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    rerender(
      <FlowStatusCard
        title="Analyzing document"
        steps={doneSteps}
        status="failed"
        error={{ code: 'quota', message: 'Quota exhausted.', retryable: true }}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders the resume action when interrupted and fires it with Enter', async () => {
    const user = userEvent.setup()
    const onResume = vi.fn()
    render(
      <FlowStatusCard
        title="Update job history"
        steps={[
          { id: 'collect', label: 'Collecting changes', status: 'done' },
          { id: 'confirm', label: 'Waiting for confirmation', status: 'interrupted' },
        ]}
        status="interrupted"
        onResume={onResume}
      />,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Resume' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onResume).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('renders the detail slot and honors label overrides', () => {
    render(
      <FlowStatusCard
        title="Update job history"
        steps={[{ id: 'confirm', label: 'Waiting for confirmation', status: 'interrupted' }]}
        status="interrupted"
        onResume={vi.fn()}
        labels={{ resume: 'Fortsetzen' }}
        detail={<button type="button">Approve change</button>}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Fortsetzen' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve change' })).toBeInTheDocument()
  })

  it('has no axe violations while running', async () => {
    const { container } = render(
      <FlowStatusCard
        title="Analyzing document"
        steps={runningSteps}
        status="running"
        onCancel={vi.fn()}
        detail={<p>Showing 3 references</p>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when failed', async () => {
    const { container } = render(
      <FlowStatusCard
        title="Analyzing document"
        steps={[
          { id: 'parse', label: 'Parsing document', status: 'done' },
          { id: 'skills', label: 'Extracting skills', status: 'failed' },
        ]}
        status="failed"
        error={{ code: 'provider_timeout', message: 'The model took too long.', retryable: true }}
        onRetry={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when interrupted', async () => {
    const { container } = render(
      <FlowStatusCard
        title="Update job history"
        steps={[{ id: 'confirm', label: 'Waiting for confirmation', status: 'interrupted' }]}
        status="interrupted"
        onResume={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
