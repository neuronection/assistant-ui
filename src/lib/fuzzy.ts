const SEPARATORS = new Set(['-', '_', '.', '/', ' ', ':', '@'])

const BOUNDARY_START = 8
const BOUNDARY_SEPARATOR = 6
const CONSECUTIVE_STEP = 4
const EXACT_MATCH = 100
const SUBSTRING_MATCH = 80
const TOKEN_SUBSTRING = 60
const SUBSEQUENCE_BASE = 30
const TYPO_BASE = 20

export function fuzzyScore(query: string, target: string): number | null {
  if (query === '') {
    return 0
  }
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (q === t) {
    return EXACT_MATCH + q.length
  }
  const substringIndex = t.indexOf(q)
  if (substringIndex !== -1) {
    let bonus = SUBSTRING_MATCH
    if (substringIndex === 0) bonus += BOUNDARY_START
    else if (SEPARATORS.has(t[substringIndex - 1] ?? '')) bonus += BOUNDARY_SEPARATOR
    return bonus + q.length
  }
  let score = SUBSEQUENCE_BASE
  let matched = false
  for (const token of q.split(/\s+/).filter(Boolean)) {
    const tokenScore = subsequenceScore(token, t)
    if (tokenScore === null) {
      return null
    }
    score += tokenScore
    matched = true
  }
  if (!matched) {
    return null
  }
  return score
}

function subsequenceScore(query: string, target: string): number | null {
  if (target.includes(query)) {
    let bonus = TOKEN_SUBSTRING
    const index = target.indexOf(query)
    if (index === 0) bonus += BOUNDARY_START
    else if (SEPARATORS.has(target[index - 1] ?? '')) bonus += BOUNDARY_SEPARATOR
    return bonus
  }
  let score = 0
  let qi = 0
  let consecutive = 0
  let prevIndex = -2
  for (let ti = 0; ti < target.length && qi < query.length; ti += 1) {
    if (target[ti] !== query[qi]) {
      continue
    }
    let bonus = 0
    if (ti === 0) {
      bonus += BOUNDARY_START
    } else if (SEPARATORS.has(target[ti - 1] ?? '')) {
      bonus += BOUNDARY_SEPARATOR
    }
    if (ti === prevIndex + 1) {
      consecutive += 1
      bonus += CONSECUTIVE_STEP * consecutive
    } else {
      consecutive = 0
    }
    score += 1 + bonus
    prevIndex = ti
    qi += 1
  }
  if (qi < query.length) {
    return null
  }
  return score
}

export function typoDistance(a: string, b: string, max = 2): number | null {
  if (Math.abs(a.length - b.length) > max) {
    return null
  }
  let previous: number[] = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    const current: number[] = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)
      const insertion = previous[j]! + 1
      const deletion = current[j - 1]! + 1
      let value = Math.min(substitution, insertion, deletion)
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        value = Math.min(value, previous[j - 2]! + 1)
      }
      current[j] = value
      if (value < rowMin) {
        rowMin = value
      }
    }
    if (rowMin > max) {
      return null
    }
    previous = current
  }
  return previous[b.length] ?? null
}

export function beautifyId(externalId: string): string {
  const acronyms = ['gpt', 'nlp', 'ocr', 'llm', 'stt', 'tts', 'vl', 'ai']
  return externalId
    .replace(/[-:]/g, ' ')
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) =>
      acronyms.includes(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

export function searchScore(query: string, target: string): number | null {
  const direct = fuzzyScore(query, target)
  if (direct !== null) {
    return direct
  }
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase()
  if (q.length < 3) {
    return null
  }
  const allowed = q.length >= 6 ? 2 : 1
  const whole = typoDistance(q, t, allowed)
  if (whole !== null) {
    return TYPO_BASE + q.length - whole
  }
  let best: number | null = null
  for (const word of t.split(/[^a-z0-9.]+/).filter(Boolean)) {
    const distance = typoDistance(q, word, allowed)
    if (distance !== null) {
      const score = TYPO_BASE + q.length - distance + BOUNDARY_SEPARATOR
      if (best === null || score > best) {
        best = score
      }
    }
  }
  return best
}
