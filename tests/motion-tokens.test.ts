import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/tokens/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function reduceGuards(): string {
  const guards: string[] = []
  for (const match of css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)) {
    guards.push(match[1] ?? '')
  }
  return guards.join('\n')
}

function motionRuleSelectors(source: string): string[] {
  const selectors: string[] = []
  for (const match of source.matchAll(/([^{}]+)\{[^{}]*?(?:animation|transition):/g)) {
    const selector = (match[1] ?? '')
      .split('\n')
      .map((line) => line.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (selector.startsWith('@') || selector === '') {
      continue
    }
    selectors.push(selector)
  }
  return selectors
}

describe('motion system (plan 100 / ADR-012)', () => {
  it('defines the duration and easing tokens on :root', () => {
    for (const token of [
      '--as-duration-fast',
      '--as-duration-base',
      '--as-duration-slow',
      '--as-duration-spring',
      '--as-ease-out',
      '--as-ease-standard',
      '--as-ease-spring',
    ]) {
      expect(css).toContain(`${token}:`)
    }
  })

  it('times every one-shot animation utility with motion tokens', () => {
    for (const utility of [
      '.as-anim-fade',
      '.as-anim-modal',
      '.as-anim-pop',
      '.as-anim-drawer',
      '.as-anim-message-in',
      '.as-anim-slide-up',
      '.as-anim-fade-swap',
      '.as-anim-check-draw',
      '.as-anim-morph-in',
    ]) {
      const rule = css.match(new RegExp(`${utility.replace('.', '\\.')} \\{[\\s\\S]*?\\}`))
      expect(rule, `${utility} rule exists`).not.toBeNull()
      expect(rule![0], `${utility} is token-timed`).toContain('var(--as-duration-')
    }
  })

  it('guards every animation and transition rule with prefers-reduced-motion', () => {
    const guards = reduceGuards()
    expect(guards).toMatch(/animation:\s*none/)
    expect(guards).toMatch(/transition:\s*none/)
    for (const selector of motionRuleSelectors(css)) {
      const covered = selector
        .split(',')
        .map((part) => part.trim())
        .some((part) => guards.includes(part))
      expect(covered, `${selector} is disabled under prefers-reduced-motion`).toBe(true)
    }
  })

  it('keeps collapsed collapse-inner content out of the a11y tree', () => {
    expect(css).toContain(".as-collapse[data-open='true'] .as-collapse-inner")
    expect(css).toMatch(/\.as-collapse-inner \{[^}]*visibility: hidden/)
  })

  it('owns the message action-row reveal (hover + focus-within, token-timed)', () => {
    expect(css).toContain("[data-as='chat-message']:hover [data-as='chat-message-actions']")
    expect(css).toContain("[data-as='chat-message-actions']:focus-within")
    const rule = css.match(/\[data-as='chat-message-actions'\] \{[\s\S]*?\}/)
    expect(rule).not.toBeNull()
    expect(rule![0]).toContain('var(--as-duration-fast)')
  })
})
