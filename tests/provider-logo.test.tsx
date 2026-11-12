import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ProviderLogo } from '../src/components/provider-logo/ProviderLogo'

describe('ProviderLogo', () => {
  it('renders the vendor mark for a shipped preset key', () => {
    const { container } = render(<ProviderLogo preset="gemini" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg?.getAttribute('fill')).toBe('currentColor')
    expect(container.querySelector('path')?.getAttribute('d')).toContain('M20.616 10.835')
    expect(container.querySelector('path')?.getAttribute('fill')).toBe('#3186FF')
  })

  it('openai renders its vendor mark with the source evenodd rule', () => {
    const { container } = render(<ProviderLogo preset="openai" />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('path')?.getAttribute('fill-rule')).toBe('evenodd')
  })

  it('falls back to a monogram for keys without a shipped mark (serper only now)', () => {
    const { container } = render(<ProviderLogo preset="serper" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(container).toHaveTextContent('S')
  })

  it('groq renders the bolt mark extracted from the vendor wordmark', () => {
    const { container } = render(<ProviderLogo preset="groq" />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('colored marks keep their brand fills', () => {
    const { container } = render(<ProviderLogo preset="microsoft" />)
    const fills = Array.from(container.querySelectorAll('path')).map((p) => p.getAttribute('fill'))
    expect(fills).toContain('#F25022')
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
