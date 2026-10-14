import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { SetupSteps } from '../src/components/setup-steps/SetupSteps'

const steps = [
  { id: 'connect', label: 'Connect provider' },
  { id: 'defaults', label: 'Choose defaults' },
]

describe('SetupSteps', () => {
  it('renders the ordered progress list with an accessible name', () => {
    render(<SetupSteps steps={steps} current={0} />)
    const list = screen.getByRole('list', { name: /setup progress/i })
    expect(list).toBeInTheDocument()
    expect(screen.getByText('Connect provider')).toBeInTheDocument()
    expect(screen.getByText('Choose defaults')).toBeInTheDocument()
  })

  it('a custom label names the list', () => {
    render(
      <SetupSteps steps={steps} current={0} label="Provider setup steps" />,
    )
    expect(
      screen.getByRole('list', { name: /provider setup steps/i }),
    ).toBeInTheDocument()
  })

  it('marks the active step with aria-current="step"', () => {
    const { rerender } = render(<SetupSteps steps={steps} current={0} />)
    expect(screen.getByText('Connect provider').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(
      screen.getByText('Choose defaults').closest('li'),
    ).not.toHaveAttribute('aria-current')

    rerender(<SetupSteps steps={steps} current={1} />)
    expect(screen.getByText('Choose defaults').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('the current step badge carries its number; done badges a check', () => {
    const { rerender, container } = render(
      <SetupSteps steps={steps} current={1} />,
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    const doneBadges = container.querySelectorAll('svg')
    expect(doneBadges.length).toBeGreaterThan(0)

    rerender(<SetupSteps steps={steps} current={0} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('an index past the last step marks every step done', () => {
    render(<SetupSteps steps={steps} current={steps.length} />)
    for (const label of ['Connect provider', 'Choose defaults']) {
      expect(screen.getByText(label).closest('li')).not.toHaveAttribute(
        'aria-current',
      )
    }
    const list = screen.getByRole('list', { name: /setup progress/i })
    expect(list.querySelectorAll('svg').length).toBe(steps.length)
  })

  it('renders a connector between steps, not after the last', () => {
    const { container } = render(<SetupSteps steps={steps} current={0} />)
    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]!.querySelectorAll('span[aria-hidden].h-px').length).toBe(1)
    expect(items[1]!.querySelectorAll('span[aria-hidden].h-px').length).toBe(0)
  })

  it('an out-of-range negative index leaves every step upcoming', () => {
    render(<SetupSteps steps={steps} current={-1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    for (const label of ['Connect provider', 'Choose defaults']) {
      expect(screen.getByText(label).closest('li')).not.toHaveAttribute(
        'aria-current',
      )
    }
  })

  it('zero steps render nothing', () => {
    const { container } = render(<SetupSteps steps={[]} current={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('has no accessibility violations on every state', async () => {
    const { rerender } = render(<SetupSteps steps={steps} current={0} />)
    const first = screen.getByRole('list')
    expect(await axe(first)).toHaveNoViolations()

    rerender(<SetupSteps steps={steps} current={1} />)
    expect(await axe(screen.getByRole('list'))).toHaveNoViolations()

    rerender(<SetupSteps steps={steps} current={steps.length} />)
    expect(await axe(screen.getByRole('list'))).toHaveNoViolations()
  })

  it('forwards the ref and spreads extra props', () => {
    const ref = React.createRef<HTMLOListElement>()
    render(<SetupSteps ref={ref} steps={steps} current={0} data-testid="x" />)
    expect(ref.current).toBeInstanceOf(HTMLOListElement)
    expect(ref.current?.dataset.testid).toBe('x')
  })
})
