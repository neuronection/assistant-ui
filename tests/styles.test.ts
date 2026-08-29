import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const STYLES = 'dist/styles.css'
const hasStyles = existsSync(STYLES)

describe.skipIf(!hasStyles)('dist/styles.css contract', () => {
  const css = hasStyles ? readFileSync(STYLES, 'utf8') : ''

  it('contains no cascade layers (TW3 apps must not be overridden by preflight)', () => {
    expect(css).not.toContain('@layer')
  })

  it('defines the semantic token defaults on :root', () => {
    for (const token of [
      '--as-primary',
      '--as-primary-fg',
      '--as-secondary',
      '--as-surface',
      '--as-surface-raised',
      '--as-border',
      '--as-fg',
      '--as-muted-fg',
      '--as-danger',
      '--as-danger-fg',
      '--as-ai',
      '--as-focus-ring',
      '--as-radius',
    ]) {
      expect(css).toContain(token)
    }
  })

  it('components consume tokens via var() (themeable by override)', () => {
    expect(css).toMatch(/bg-\\\[var\\\(--as-primary\\\)/)
    expect(css).toMatch(/text-\\\[var\\\(--as-primary-fg\\\)/)
    expect(css).toMatch(/border-\\\[var\\\(--as-border\\\)/)
  })

  it('defines the animation utility classes', () => {
    expect(css).toContain('as-anim-modal')
    expect(css).toContain('as-anim-fade')
    expect(css).toContain('as-anim-pop')
  })
})
