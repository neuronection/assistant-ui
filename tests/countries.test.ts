import { describe, expect, it } from 'vitest'

import { COUNTRIES, getCountryFlag } from '../src/lib/countries'

describe('countries', () => {
  it('has unique ISO codes with name + flag for every entry', () => {
    const codes = new Set(COUNTRIES.map((entry) => entry.code))
    expect(codes.size).toBe(COUNTRIES.length)
    for (const entry of COUNTRIES) {
      expect(entry.code).toMatch(/^[A-Z]{2}$/)
      expect(entry.name.length).toBeGreaterThan(0)
      expect(entry.flag.length).toBeGreaterThan(0)
    }
  })

  it('resolves flags and falls back to the raw code', () => {
    expect(getCountryFlag('AT')).toBe('🇦🇹')
    expect(getCountryFlag('ZZ')).toBe('ZZ')
    expect(getCountryFlag(undefined)).toBe('')
  })
})
