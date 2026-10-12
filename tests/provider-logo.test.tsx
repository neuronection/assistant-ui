import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ProviderLogo } from '../src/components/provider-logo/ProviderLogo'

describe('ProviderLogo', () => {
  it('renders the simple-icons mark for a shipped preset key', () => {
    const { container } = render(<ProviderLogo preset="gemini" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg?.getAttribute('fill')).toBe('currentColor')
    expect(container.querySelector('path')?.getAttribute('d')).toContain('M11.04 19.32')
  })

  it('falls back to a monogram for keys without a shipped mark (openai/groq are gone upstream)', () => {
    const { container } = render(<ProviderLogo preset="openai" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(container).toHaveTextContent('O')
    const { container: groq } = render(<ProviderLogo preset="groq" />)
    expect(groq).toHaveTextContent('G')
  })

  it('is decorative (aria-hidden) and sizes from the size prop', () => {
    const { container } = render(<ProviderLogo preset="anthropic" size={28} />)
    const root = container.querySelector('[data-as="provider-logo"]')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root).toHaveAttribute('data-preset', 'anthropic')
    expect(root).toHaveStyle({ width: '28px', height: '28px' })
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <ProviderLogo preset="ollama" />
        <ProviderLogo preset="typesafe" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
