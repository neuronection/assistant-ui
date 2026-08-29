import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Portal } from '../src/components/portal/Portal'
import { ThemeScope } from '../src/components/theme-scope/ThemeScope'
import { cn } from '../src/lib/utils'

describe('cn', () => {
  it('merges conflicting tailwind classes (later wins)', () => {
    expect(cn('bg-[var(--as-primary)]', 'bg-red-500')).toBe('bg-red-500')
    expect(cn('px-4', 'px-2', 'font-bold')).toBe('px-2 font-bold')
  })
})

describe('Portal', () => {
  it('renders children at the document body level', () => {
    render(
      <div data-testid="wrapper">
        <Portal>
          <p>Portaled content</p>
        </Portal>
      </div>,
    )
    const portaled = screen.getByText('Portaled content')
    expect(portaled.closest('[data-testid="wrapper"]')).toBeNull()
    expect(document.body.contains(portaled)).toBe(true)
  })
})

describe('ThemeScope', () => {
  it('applies token overrides as inline custom properties', () => {
    render(
      <ThemeScope tokens={{ '--as-primary': '#ff0000', '--as-radius': '1rem' }}>
        <span>Scoped</span>
      </ThemeScope>,
    )
    const scope = screen.getByText('Scoped').parentElement as HTMLElement
    expect(scope.style.getPropertyValue('--as-primary')).toBe('#ff0000')
    expect(scope.style.getPropertyValue('--as-radius')).toBe('1rem')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ThemeScope>
        <p>Plain</p>
      </ThemeScope>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
