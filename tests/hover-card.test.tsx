import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../src/components/hover-card/HoverCard'
import { Button } from '../src/components/button/Button'

function Demo(props: Partial<React.ComponentProps<typeof HoverCard>>) {
  return (
    <HoverCard closeDelay={0} openDelay={0} {...props}>
      <HoverCardTrigger asChild>
        <Button variant="ghost">chain-rule.pdf</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p>Derivative rules summary</p>
      </HoverCardContent>
    </HoverCard>
  )
}

afterEach(() => {
  cleanup()
})

describe('HoverCard', () => {
  it('opens on hover', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.hover(screen.getByRole('button', { name: 'chain-rule.pdf' }))
    expect(
      await screen.findByText('Derivative rules summary'),
    ).toBeInTheDocument()
  })

  it('opens on keyboard focus (no pointer required)', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.tab()
    expect(
      await screen.findByText('Derivative rules summary'),
    ).toBeInTheDocument()
  })

  it('respects the controlled open prop and reports intent', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Demo open onOpenChange={onOpenChange} />)
    expect(screen.getByText('Derivative rules summary')).toBeInTheDocument()
    await user.hover(screen.getByRole('button', { name: 'chain-rule.pdf' }))
    await user.unhover(screen.getByRole('button', { name: 'chain-rule.pdf' }))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalled())
  })

  it('closes on unhover', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const trigger = screen.getByRole('button', { name: 'chain-rule.pdf' })
    await user.hover(trigger)
    await screen.findByText('Derivative rules summary')
    await user.unhover(trigger)
    await waitFor(() =>
      expect(
        screen.queryByText('Derivative rules summary'),
      ).not.toBeInTheDocument(),
    )
  })

  it('content carries the hover-card marker and merges className', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <Button>open</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          <p>body</p>
        </HoverCardContent>
      </HoverCard>,
    )
    const content = screen.getByText('body')
    const surface = content.closest('[data-as="hover-card"]')
    expect(surface).not.toBeNull()
    expect(surface?.className).toContain('w-96')
    expect(surface?.className).toContain('rounded-')
  })

  it('open state has no axe violations', async () => {
    const { container } = render(
      <HoverCard open>
        <HoverCardTrigger>title</HoverCardTrigger>
        <HoverCardContent>
          <p>Summary text</p>
        </HoverCardContent>
      </HoverCard>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
