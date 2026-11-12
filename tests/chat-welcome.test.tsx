import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ChatWelcome } from '../src/components/chat-welcome'

describe('ChatWelcome', () => {
  it('renders the greeting, subtitle and suggestion slot', () => {
    render(
      <ChatWelcome
        title="Ask anything about your courses"
        subtitle="I can plan, quiz and explain."
        suggestions={<button type="button">Plan my revision</button>}
      />,
    )
    expect(screen.getByText('Ask anything about your courses')).toBeInTheDocument()
    expect(screen.getByText('I can plan, quiz and explain.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plan my revision' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plan my revision' }).closest('[data-as="chat-welcome-suggestions"]')).not.toBeNull()
  })

  it('renders the breathing AI orb', () => {
    const { container } = render(<ChatWelcome title="Hello" />)
    const orb = container.querySelector('.as-anim-breathe')
    expect(orb).not.toBeNull()
    expect(orb?.className).toContain('--as-ai')
  })

  it('accepts a custom orb icon node', () => {
    render(<ChatWelcome title="Hello" icon={<span data-testid="orb-icon">x</span>} />)
    expect(screen.getByTestId('orb-icon')).toBeInTheDocument()
  })

  it('carries the surface variant hook', () => {
    const { container, rerender } = render(<ChatWelcome title="Hello" variant="page" />)
    const root = () => container.querySelector('[data-as="chat-welcome"]')
    expect(root()).toHaveAttribute('data-variant', 'page')
    rerender(<ChatWelcome title="Hello" variant="bubble" />)
    expect(root()).toHaveAttribute('data-variant', 'bubble')
  })

  it('exposes no focusable elements of its own', () => {
    const { container } = render(<ChatWelcome title="Hello" subtitle="Hi" />)
    expect(container.querySelectorAll('button, a, input, textarea, select, [tabindex]')).toHaveLength(0)
  })

  it('passes axe across variants', async () => {
    const page = render(
      <ChatWelcome
        title="Ask anything"
        subtitle="I can help"
        variant="page"
        suggestions={<button type="button">Suggest a plan</button>}
      />,
    )
    expect(await axe(page.container)).toHaveNoViolations()
    page.unmount()
    const bubble = render(<ChatWelcome title="Need a hand?" variant="bubble" />)
    expect(await axe(bubble.container)).toHaveNoViolations()
  })
})
