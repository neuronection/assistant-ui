export interface DiffSegment {
  text: string
  changed: boolean
}

export interface DiffCell {
  kind: 'add' | 'del' | 'context'
  text: string
  no?: number
  segments?: DiffSegment[]
}

export type DiffRow =
  | { kind: 'pair'; left: DiffCell | null; right: DiffCell | null }
  | { kind: 'fold'; count: number; hidden: DiffRow[] }

export interface LineDiffOptions {
  contextLines?: number
}

export interface LineDiffResult {
  rows: DiffRow[]
  added: number
  removed: number
}

const MAX_LCS_CELLS = 4_000_000
const MAX_WORD_CELLS = 40_000

type Op = { type: 'equal' | 'del' | 'add'; text: string }

function at<T>(list: readonly T[], index: number): T {
  const value = list[index]
  if (value === undefined) {
    throw new Error(`lineDiff: index ${index} out of bounds`)
  }
  return value
}

function atNum(list: Int32Array, index: number): number {
  const value = list[index]
  if (value === undefined) {
    throw new Error(`lineDiff: index ${index} out of bounds`)
  }
  return value
}

function splitLines(text: string): string[] {
  if (text === '') {
    return []
  }
  return text.replace(/\r\n?/g, '\n').split('\n')
}

function diffOps(a: string[], b: string[], maxCells = MAX_LCS_CELLS): Op[] {
  const n = a.length
  const m = b.length
  const ops: Op[] = []
  if (n * m > maxCells) {
    for (const text of a) {
      ops.push({ type: 'del', text })
    }
    for (const text of b) {
      ops.push({ type: 'add', text })
    }
    return ops
  }
  const width = m + 1
  const lcs = new Int32Array((n + 1) * width)
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lcs[i * width + j] =
        at(a, i) === at(b, j)
          ? atNum(lcs, (i + 1) * width + j + 1) + 1
          : Math.max(atNum(lcs, (i + 1) * width + j), atNum(lcs, i * width + j + 1))
    }
  }
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (at(a, i) === at(b, j)) {
      ops.push({ type: 'equal', text: at(a, i) })
      i += 1
      j += 1
    } else if (atNum(lcs, (i + 1) * width + j) >= atNum(lcs, i * width + j + 1)) {
      ops.push({ type: 'del', text: at(a, i) })
      i += 1
    } else {
      ops.push({ type: 'add', text: at(b, j) })
      j += 1
    }
  }
  while (i < n) {
    ops.push({ type: 'del', text: at(a, i) })
    i += 1
  }
  while (j < m) {
    ops.push({ type: 'add', text: at(b, j) })
    j += 1
  }
  return ops
}

function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? []
}

function isMeaningful(token: string): boolean {
  return /\S/.test(token)
}

function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  const merged: DiffSegment[] = []
  for (const segment of segments) {
    const last = merged[merged.length - 1]
    if (last !== undefined && last.changed === segment.changed) {
      last.text += segment.text
    } else {
      merged.push({ ...segment })
    }
  }
  return merged
}

export function wordSegments(
  original: string,
  suggested: string,
): { left: DiffSegment[]; right: DiffSegment[] } {
  const a = tokenize(original)
  const b = tokenize(suggested)
  const ops = diffOps(a, b, MAX_WORD_CELLS)
  const left: DiffSegment[] = []
  const right: DiffSegment[] = []
  for (const op of ops) {
    if (op.type === 'equal') {
      left.push({ text: op.text, changed: false })
      right.push({ text: op.text, changed: false })
    } else if (op.type === 'del') {
      left.push({ text: op.text, changed: isMeaningful(op.text) })
    } else {
      right.push({ text: op.text, changed: isMeaningful(op.text) })
    }
  }
  return { left: mergeSegments(left), right: mergeSegments(right) }
}

function pairRows(ops: Op[]): DiffRow[] {
  const rows: DiffRow[] = []
  let index = 0
  while (index < ops.length) {
    const op = at(ops, index)
    if (op.type === 'equal') {
      rows.push({
        kind: 'pair',
        left: { kind: 'context', text: op.text },
        right: { kind: 'context', text: op.text },
      })
      index += 1
      continue
    }
    const dels: string[] = []
    const adds: string[] = []
    while (index < ops.length && at(ops, index).type !== 'equal') {
      const current = at(ops, index)
      if (current.type === 'del') {
        dels.push(current.text)
      } else {
        adds.push(current.text)
      }
      index += 1
    }
    const pairCount = Math.max(dels.length, adds.length)
    for (let k = 0; k < pairCount; k += 1) {
      const leftText = k < dels.length ? at(dels, k) : null
      const rightText = k < adds.length ? at(adds, k) : null
      const leftCell: DiffCell | null =
        leftText !== null ? { kind: 'del', text: leftText } : null
      const rightCell: DiffCell | null =
        rightText !== null ? { kind: 'add', text: rightText } : null
      if (
        leftCell !== null &&
        rightCell !== null &&
        leftText !== null &&
        rightText !== null &&
        leftText !== rightText
      ) {
        const words = wordSegments(leftText, rightText)
        leftCell.segments = words.left
        rightCell.segments = words.right
      }
      rows.push({ kind: 'pair', left: leftCell, right: rightCell })
    }
  }
  return rows
}

function numberRows(rows: DiffRow[]): void {
  let leftNo = 0
  let rightNo = 0
  for (const row of rows) {
    if (row.kind !== 'pair') {
      continue
    }
    if (row.left !== null) {
      leftNo += 1
      row.left.no = leftNo
    }
    if (row.right !== null) {
      rightNo += 1
      row.right.no = rightNo
    }
  }
}

function foldRows(rows: DiffRow[], contextLines: number): DiffRow[] {
  const hasChange = rows.some((row) => {
    if (row.kind !== 'pair') {
      return false
    }
    return row.left?.kind !== 'context' || row.right?.kind !== 'context'
  })
  if (!hasChange || contextLines < 0) {
    return rows
  }
  const runs: { start: number; end: number }[] = []
  let start = -1
  for (let index = 0; index <= rows.length; index += 1) {
    const row = rows[index]
    const isContext =
      index < rows.length &&
      row !== undefined &&
      row.kind === 'pair' &&
      row.left?.kind === 'context' &&
      row.right?.kind === 'context'
    if (isContext) {
      if (start === -1) {
        start = index
      }
    } else if (start !== -1) {
      runs.push({ start, end: index })
      start = -1
    }
  }
  const hiddenAt = new Map<number, DiffRow[]>()
  for (const run of runs) {
    const length = run.end - run.start
    const isFirstRun = run.start === 0
    const isLastRun = run.end === rows.length
    const keepBefore = isFirstRun ? 0 : contextLines
    const keepAfter = isLastRun ? 0 : contextLines
    const foldCount = length - keepBefore - keepAfter
    if (foldCount <= 0) {
      continue
    }
    const hidden = rows.slice(run.start + keepBefore, run.start + keepBefore + foldCount)
    hiddenAt.set(run.start + keepBefore, hidden)
  }
  const folded: DiffRow[] = []
  let index = 0
  while (index < rows.length) {
    const hidden = hiddenAt.get(index)
    if (hidden === undefined) {
      folded.push(at(rows, index))
      index += 1
    } else {
      folded.push({ kind: 'fold', count: hidden.length, hidden })
      index += hidden.length
    }
  }
  return folded
}

export function computeLineDiff(
  original: string,
  suggested: string,
  options: LineDiffOptions = {},
): LineDiffResult {
  const contextLines = options.contextLines ?? 2
  const ops = diffOps(splitLines(original), splitLines(suggested))
  const flatRows = pairRows(ops)
  numberRows(flatRows)
  const rows = foldRows(flatRows, contextLines)
  let added = 0
  let removed = 0
  for (const row of flatRows) {
    if (row.kind !== 'pair') {
      continue
    }
    if (row.right?.kind === 'add') {
      added += 1
    }
    if (row.left?.kind === 'del') {
      removed += 1
    }
  }
  return { rows, added, removed }
}
