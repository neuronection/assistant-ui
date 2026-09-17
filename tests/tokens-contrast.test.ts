import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const tokensPath = join(__dirname, '..', 'src', 'tokens', 'tokens.css')
const tokensCss = readFileSync(tokensPath, 'utf8')

function oklchValues(source: string): Map<string, [number, number, number]> {
  const block = source.slice(source.indexOf(':root'), source.indexOf('}'))
  const literals = new Map<string, [number, number, number]>()
  const refs = new Map<string, string>()
  for (const match of block.matchAll(/--as-([\w-]+):\s*(?:oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)|var\(--as-([\w-]+)\))/g)) {
    const name = match[1] ?? ''
    if (match[2] !== undefined) {
      literals.set(name, [
        Number.parseFloat(match[2] ?? ''),
        Number.parseFloat(match[3] ?? ''),
        Number.parseFloat(match[4] ?? ''),
      ])
    } else {
      refs.set(name, `--as-${match[5] ?? ''}`)
    }
  }
  for (const [name, target] of refs) {
    const resolved = literals.get(target.replace('--as-', ''))
    if (resolved !== undefined) {
      literals.set(name, resolved)
    }
  }
  return literals
}

function oklchToSrgb(L: number, C: number, Hdeg: number): [number, number, number] {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const gamma = (u: number): number => {
    const clamped = Math.min(Math.max(u, 0), 1)
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * (clamped ** (1 / 2.4)) - 0.055
  }
  return [gamma(r), gamma(g), gamma(bl)]
}

function luminance(rgb: [number, number, number]): number {
  const channel = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  const [r, g, b] = [channel(rgb[0]), channel(rgb[1]), channel(rgb[2])]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

const tokens = oklchValues(tokensCss)
const srgb = new Map([...tokens.entries()].map(([name, value]) => [name, oklchToSrgb(...value)]))

const value = (name: string): [number, number, number] => {
  const resolved = srgb.get(name)
  if (resolved === undefined) {
    throw new Error(`token --as-${name} not found in ${tokensPath}`)
  }
  return resolved
}

const TEXT_PAIRS: [string, string][] = [
  ['fg', 'surface-raised'],
  ['fg', 'surface'],
  ['muted-fg', 'surface'],
  ['muted-fg', 'surface-raised'],
  ['primary-fg', 'primary'],
  ['secondary-fg', 'secondary'],
  ['success-fg', 'success'],
  ['warning-fg', 'warning'],
  ['danger-fg', 'danger'],
]

describe('token contrast gate (WCAG AA)', () => {
  it('keeps every text token pair at 4.5:1 or better', () => {
    for (const [fgName, bgName] of TEXT_PAIRS) {
      const ratio = contrast(value(fgName), value(bgName))
      expect(ratio, `--as-${fgName} on --as-${bgName}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('locks the success green at its AA-compliant lightness', () => {
    const success = tokens.get('success')
    expect(success?.[0]).toBeLessThanOrEqual(0.56)
  })
})
