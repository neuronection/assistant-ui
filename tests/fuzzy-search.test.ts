import { describe, expect, it } from 'vitest'

import { searchScore } from '../src/lib/fuzzy'

describe('searchScore', () => {
  it('ranks exact and substring matches highest', () => {
    const exact = searchScore('gemini', 'Gemini')
    const substring = searchScore('gemini', 'Gemini 2.5 Pro')
    expect(exact).toBeGreaterThan(substring ?? 0)
  })

  it('survives missing characters', () => {
    expect(searchScore('gemni', 'gemini-2.5-pro')).not.toBeNull()
    expect(searchScore('vicion', 'vision')).not.toBeNull()
  })

  it('survives substitutions and transpositions', () => {
    expect(searchScore('gemeni', 'gemini-2.5-pro')).not.toBeNull()
    expect(searchScore('qwen25-vl', 'qwen2.5-vl:7b')).not.toBeNull()
  })

  it('matches across separators as a subsequence', () => {
    expect(searchScore('qwen vl', 'qwen2.5-vl:7b')).not.toBeNull()
    expect(searchScore('embed', 'nomic-embed-text')).not.toBeNull()
  })

  it('stays accurate on unrelated queries', () => {
    expect(searchScore('xyz', 'gemini-2.5-pro')).toBeNull()
    expect(searchScore('ab', 'ollama')).toBeNull()
  })

  it('prefixes of words rank above distant typos', () => {
    const prefix = searchScore('embed', 'embeddings-task')
    const typo = searchScore('embed', 'gemma-27b-text')
    expect(prefix ?? 0).toBeGreaterThan(typo ?? 0)
  })
})
