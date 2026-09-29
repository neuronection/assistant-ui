import { describe, expect, it } from 'vitest'

import {
  COUNTRIES,
  countryDisplayName,
  findCountry,
  getCountryFlag,
  pickCountries,
} from '../src/lib/countries'

const deriveFlag = (code: string) =>
  String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

describe('countries', () => {
  it('is the complete officially assigned ISO 3166-1 alpha-2 list', () => {
    expect(COUNTRIES.length).toBe(249)
    const codes = new Set(COUNTRIES.map((entry) => entry.code))
    expect(codes.size).toBe(COUNTRIES.length)
    for (const entry of COUNTRIES) {
      expect(entry.code).toMatch(/^[A-Z]{2}$/)
      expect(entry.name.length).toBeGreaterThan(0)
    }
  })

  it('uses GB for the United Kingdom and never UK (no legacy codes)', () => {
    expect(findCountry('GB')?.name).toBe('United Kingdom')
    expect(findCountry('UK')).toBeUndefined()
    expect(COUNTRIES.some((entry) => ['UK', 'AN', 'CS', 'DD', 'YU', 'ZR'].includes(entry.code))).toBe(false)
  })

  it('derives every flag from its code (typos cannot ship)', () => {
    for (const entry of COUNTRIES) {
      expect(entry.flag).toBe(deriveFlag(entry.code))
    }
  })

  it('finds countries case-insensitively', () => {
    expect(findCountry('at')?.name).toBe('Austria')
    expect(findCountry(undefined)).toBeUndefined()
  })

  it('picks a slice preserving caller order and skipping unknown codes', () => {
    const picked = pickCountries(['GR', 'ZZ', 'de', 'AT'])
    expect(picked.map((entry) => entry.code)).toEqual(['GR', 'DE', 'AT'])
    expect(picked[0]?.name).toBe('Greece')
  })

  it('resolves flags and falls back to the raw code', () => {
    expect(getCountryFlag('AT')).toBe('🇦🇹')
    expect(getCountryFlag('ZZ')).toBe('ZZ')
    expect(getCountryFlag(undefined)).toBe('')
  })

  it('displays localized names with catalog and raw-code fallbacks', () => {
    expect(countryDisplayName('GR', 'en')).toBe('Greece')
    expect(countryDisplayName('GR', 'de')).toBe('Griechenland')
    expect(countryDisplayName('ZZ', 'en')).toBe('ZZ')
  })
})
