import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ChatPending } from '../src/components/chat-pending'

describe('ChatPending', () => {
  it('narrates the phase through the turn status region', () => {
    render(<ChatPending label="searching the catalog" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'searching the catalog')
    expect(screen.getByText('searching the catalog')).toBeInTheDocument()
  })

  it('defaults the label to thinking', () => {
    render(<ChatPending />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'thinking')
  })

  it('renders the placeholder lines with the AI shimmer, hidden from a11y', () => {
    const { container } = render(<ChatPending lines={4} />)
    const root = container.querySelector('[data-as="chat-pending"]')
    expect(root).not.toBeNull()
    const lines = container.querySelectorAll('.as-anim-shimmer')
    expect(lines).toHaveLength(4)
    const last = lines[lines.length - 1]
    expect(last?.className).toContain('w-3/5')
    expect(lines[0]?.className).not.toContain('w-3/5')
    expect(lines[0]?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('clamps the line count between 1 and 6', () => {
    const { container, rerender } = render(<ChatPending lines={0} />)
    expect(container.querySelectorAll('.as-anim-shimmer')).toHaveLength(1)
    rerender(<ChatPending lines={12} />)
    expect(container.querySelectorAll('.as-anim-shimmer')).toHaveLength(6)
  })

  it('carries the AI accent edge', () => {
    const { container } = render(<ChatPending />)
    const placeholder = container.querySelector('[data-as="chat-pending"] > div[aria-hidden="true"]')
    expect(placeholder?.className).toContain('--as-ai')
  })

  it('renders extra children under the placeholder', () => {
    render(<ChatPending>gpt-family</ChatPending>)
    expect(screen.getByText('gpt-family')).toBeInTheDocument()
  })

  it('exposes no interactive elements', () => {
    const { container } = render(<ChatPending label="thinking" startedAt={Date.now()} />)
    expect(container.querySelectorAll('button, a, input, textarea, select, [tabindex]')).toHaveLength(0)
  })

  it('passes axe while pending', async () => {
    const { container } = render(<ChatPending label="thinking" startedAt={Date.now()} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
