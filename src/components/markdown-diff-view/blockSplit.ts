function fenceMarkerOf(
  trimmed: string,
): { char: string; bare: boolean } | null {
  const bare = /^(`{3,}|~{3,})$/.exec(trimmed)
  const marker = bare?.[1] ?? /^(`{3,}|~{3,})/.exec(trimmed)?.[1]
  if (marker === undefined || marker.length === 0) {
    return null
  }
  return { char: marker.charAt(0), bare: bare !== null }
}

export function splitMarkdownBlocks(markdown: string): string[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: string[] = []
  let current: string[] = []
  let fenceChar: string | null = null
  let inMath = false

  const flush = () => {
    if (current.some((line) => line.trim() !== '')) {
      blocks.push(current.join('\n').trim())
    }
    current = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const marker = fenceMarkerOf(trimmed)
    if (fenceChar !== null) {
      current.push(line)
      if (marker !== null && marker.bare && marker.char === fenceChar) {
        fenceChar = null
      }
      continue
    }
    if (marker !== null) {
      flush()
      fenceChar = marker.char
      current.push(line)
      continue
    }
    if (inMath) {
      current.push(line)
      if (trimmed.endsWith('$$')) {
        inMath = false
      }
      continue
    }
    if (trimmed === '$$') {
      flush()
      inMath = true
      current.push(line)
      continue
    }
    if (trimmed.startsWith('$$')) {
      flush()
      current.push(line)
      if (!trimmed.endsWith('$$') || trimmed.length <= 4) {
        inMath = true
      }
      continue
    }
    if (trimmed === '') {
      flush()
      continue
    }
    current.push(line)
  }
  flush()
  return blocks
}
