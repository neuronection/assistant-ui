import { describe, expect, test } from 'vitest'

import {
  computeLineDiff,
  wordSegments,
  type DiffRow,
} from '../src/components/text-diff-view/lineDiff'

type AllRows = ReturnType<typeof computeLineDiff>['rows'][number]
type PairRow = Extract<AllRows, { kind: 'pair' }>

function assertPair(row: DiffRow | undefined): asserts row is PairRow {
  if (row === undefined || row.kind !== 'pair') {
    throw new Error('expected a pair row')
  }
}

describe('computeLineDiff', () => {
  test('returns no rows for two empty texts', () => {
    const result = computeLineDiff('', '')
    expect(result.rows).toEqual([])
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
  })

  test('identical texts produce context rows and zero stats', () => {
    const result = computeLineDiff('a\nb\nc', 'a\nb\nc', { contextLines: 0 })
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.rows).toHaveLength(3)
    for (const row of result.rows) {
      expect(row.kind).toBe('pair')
      if (row.kind === 'pair') {
        expect(row.left?.kind).toBe('context')
        expect(row.right?.kind).toBe('context')
      }
    }
  })

  test('a replaced line appears as a del/add pair with word segments', () => {
    const result = computeLineDiff('old line\nkeep', 'new line\nkeep', { contextLines: 0 })
    expect(result.removed).toBe(1)
    expect(result.added).toBe(1)
    expect(result.rows).toHaveLength(2)
    assertPair(result.rows[0])
    const row = result.rows[0]
    expect(row.left?.kind).toBe('del')
    expect(row.left?.no).toBe(1)
    expect(row.left?.segments).toEqual([
      { text: 'old', changed: true },
      { text: ' line', changed: false },
    ])
    expect(row.right?.kind).toBe('add')
    expect(row.right?.no).toBe(1)
    expect(row.right?.segments).toEqual([
      { text: 'new', changed: true },
      { text: ' line', changed: false },
    ])
  })

  test('insertions pair with an empty left side', () => {
    const result = computeLineDiff('a\nc', 'a\nb\nc', { contextLines: 0 })
    expect(result.added).toBe(1)
    expect(result.removed).toBe(0)
    assertPair(result.rows[1])
    const row = result.rows[1]
    expect(row.left).toBeNull()
    expect(row.right).toEqual({ kind: 'add', text: 'b', no: 2 })
  })

  test('deletions pair with an empty right side', () => {
    const result = computeLineDiff('a\nb\nc', 'a\nc', { contextLines: 0 })
    expect(result.removed).toBe(1)
    assertPair(result.rows[1])
    const row = result.rows[1]
    expect(row.left).toEqual({ kind: 'del', text: 'b', no: 2 })
    expect(row.right).toBeNull()
  })

  test('long unchanged runs fold into a single expandable row', () => {
    const original = Array.from({ length: 10 }, (_, i) => `keep ${i}`).join('\n')
    const suggested = original.replace('keep 5', 'changed 5')
    const result = computeLineDiff(original, suggested, { contextLines: 2 })
    const folds = result.rows.filter((row): row is Extract<DiffRow, { kind: 'fold' }> => row.kind === 'fold')
    expect(folds.length).toBeGreaterThanOrEqual(1)
    const firstFold = folds[0]
    if (firstFold === undefined) {
      throw new Error('expected a fold row')
    }
    expect(firstFold.count).toBe(firstFold.hidden.length)
    expect(firstFold.count).toBeGreaterThan(0)
  })

  test('contextLines 0 folds unchanged middles between changes', () => {
    const result = computeLineDiff('x\nsame\ny', 'z\nsame\nw', { contextLines: 0 })
    expect(result.rows).toHaveLength(3)
    const fold = result.rows[1]
    if (fold === undefined || fold.kind !== 'fold') {
      throw new Error('expected a fold row')
    }
    expect(fold.count).toBe(1)
    expect(fold.hidden[0]?.kind).toBe('pair')
    assertPair(result.rows[0])
    assertPair(result.rows[2])
    expect(result.rows[0].left?.no).toBe(1)
    expect(result.rows[0].right?.no).toBe(1)
    expect(result.rows[2].left?.no).toBe(3)
    expect(result.rows[2].right?.no).toBe(3)
  })

  test('normalizes crlf line endings', () => {
    const result = computeLineDiff('a\r\nb', 'a\nb', { contextLines: 0 })
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.rows).toHaveLength(2)
  })

  test('handles a full replace of large texts beyond the LCS cap', () => {
    const original = Array.from({ length: 2500 }, (_, i) => `old ${i}`).join('\n')
    const suggested = Array.from({ length: 2500 }, (_, i) => `new ${i}`).join('\n')
    const result = computeLineDiff(original, suggested, { contextLines: 0 })
    expect(result.removed).toBe(2500)
    expect(result.added).toBe(2500)
  })

  test('numbers original and suggested lines independently', () => {
    const result = computeLineDiff('a\nb\nc', 'a\nX\nc', { contextLines: 0 })
    expect(result.rows).toHaveLength(3)
    assertPair(result.rows[1])
    expect(result.rows[1].left?.no).toBe(2)
    expect(result.rows[1].right?.no).toBe(2)
  })

  test('insert-only rows leave the original numbering untouched', () => {
    const result = computeLineDiff('a\nc', 'a\nb\nc', { contextLines: 0 })
    assertPair(result.rows[1])
    expect(result.rows[1].left).toBeNull()
    expect(result.rows[1].right?.no).toBe(2)
    const lastFold = result.rows[2]
    expect(lastFold?.kind).toBe('fold')
    if (lastFold?.kind === 'fold') {
      assertPair(lastFold.hidden[0])
      expect(lastFold.hidden[0].left?.no).toBe(2)
      expect(lastFold.hidden[0].right?.no).toBe(3)
    }
  })
})

describe('wordSegments', () => {
  test('marks only the changed words on both sides', () => {
    const { left, right } = wordSegments('the quick fox', 'the slow fox')
    expect(left).toEqual([
      { text: 'the ', changed: false },
      { text: 'quick', changed: true },
      { text: ' fox', changed: false },
    ])
    expect(right).toEqual([
      { text: 'the ', changed: false },
      { text: 'slow', changed: true },
      { text: ' fox', changed: false },
    ])
  })

  test('whitespace-only differences are not marked changed', () => {
    const { left } = wordSegments('a  b', 'a b')
    expect(left.every((segment) => !segment.changed)).toBe(true)
  })

  test('identical lines produce uniform unchanged segments', () => {
    const { left, right } = wordSegments('same text', 'same text')
    expect(left.every((segment) => !segment.changed)).toBe(true)
    expect(right.every((segment) => !segment.changed)).toBe(true)
  })
})
