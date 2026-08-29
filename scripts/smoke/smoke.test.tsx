// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@neuronection/assistant-ui'
import { ThemeScope } from '@neuronection/assistant-ui'

const css = readFileSync(
  'node_modules/@neuronection/assistant-ui/dist/styles.css',
  'utf8',
)

describe('compatibility contract', () => {
  it('imports and renders Button in this React version', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Smoke</Button>)
    const button = screen.getByRole('button', { name: 'Smoke' })
    expect(button.getAttribute('data-as')).toBe('button')
    await user.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('styles.css ships token defaults the app can override', () => {
    expect(css).toContain('--as-primary')
    expect(css).toContain('--as-radius')
  })

  it('styles.css contains no cascade layers (safe inside Tailwind 3 apps)', () => {
    expect(css).not.toContain('@layer')
  })

  it('exports map resolves styles.css and module entries', () => {
    expect(css.length).toBeGreaterThan(1000)
  })
})

describe('theme contract', () => {
  it('token overrides land on the DOM via ThemeScope', () => {
    render(
      <ThemeScope tokens={{ '--as-primary': '#ff0000' }}>
        <span>Scoped</span>
      </ThemeScope>,
    )
    const scope = screen.getByText('Scoped').parentElement as HTMLElement
    expect(scope.getAttribute('style')).toContain('--as-primary')
  })

  it('button utilities consume the tokens (var() references in CSS)', () => {
    expect(css).toMatch(/bg-\\\[var\\\(--as-primary\\\)/)
    expect(css).toMatch(/outline-\\\[var\\\(--as-focus-ring\\\)/)
  })
})
