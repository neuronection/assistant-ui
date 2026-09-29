import { describe, expect, it } from 'vitest'

import {
  LANGUAGES,
  findLanguage,
  isLanguageCode,
  languageDisplayName,
  pickLanguages,
} from '../src/lib/languages'

describe('languages', () => {
  it('has unique ISO 639-1 codes with names and endonyms', () => {
    const codes = new Set(LANGUAGES.map((entry) => entry.code))
    expect(codes.size).toBe(LANGUAGES.length)
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(43)
    for (const entry of LANGUAGES) {
      expect(entry.code).toMatch(/^[a-z]{2}$/)
      expect(entry.name.length).toBeGreaterThan(0)
      expect(entry.nativeName.length).toBeGreaterThan(0)
      expect(entry.nativeName).not.toBe(entry.code)
    }
  })

  it('keeps both Norwegian codes and resolves subtags', () => {
    expect(findLanguage('nb')?.name).toBe('Norwegian Bokmål')
    expect(findLanguage('no')?.name).toBe('Norwegian')
    expect(findLanguage('pt-BR')?.code).toBe('pt')
    expect(findLanguage(' EL ')?.code).toBe('el')
  })

  it('validates codes including locale tags', () => {
    expect(isLanguageCode('el')).toBe(true)
    expect(isLanguageCode('pt-BR')).toBe(true)
    expect(isLanguageCode('xx')).toBe(false)
    expect(isLanguageCode(undefined)).toBe(false)
  })

  it('picks a slice preserving caller order and skipping unknown codes', () => {
    const picked = pickLanguages(['el', 'en', 'de', 'xx'])
    expect(picked.map((entry) => entry.code)).toEqual(['el', 'en', 'de'])
    expect(picked[0]?.nativeName).toBe('Ελληνικά')
  })

  it('displays localized names with catalog and raw-code fallbacks', () => {
    expect(languageDisplayName('el', 'en')).toBe('Greek')
    expect(languageDisplayName('el', 'el')).toBe('Ελληνικά')
    expect(languageDisplayName('xx', 'en')).toBe('xx')
  })

  it('marks flags optional and only where a primary country exists', () => {
    expect(findLanguage('de')?.flag).toBe('🇩🇪')
    expect(findLanguage('ar')?.flag).toBeUndefined()
    expect(findLanguage('ca')?.flag).toBeUndefined()
  })
})
