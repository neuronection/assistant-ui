import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse JSON text into a presentational view: objects become key/value
 * pairs, arrays become display items, anything else stays plain text. */
export type DetailValueView =
  | { kind: 'pairs'; entries: Array<{ key: string; value: string }> }
  | { kind: 'items'; items: string[] }
  | { kind: 'text'; text: string }

function displayDetailValue(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function detailValueView(text: string): DetailValueView {
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed as Record<string, unknown>).map(
        ([key, value]) => ({ key, value: displayDetailValue(value) }),
      )
      if (entries.length > 0) {
        return { kind: 'pairs', entries }
      }
    }
    if (Array.isArray(parsed)) {
      return { kind: 'items', items: parsed.map(displayDetailValue) }
    }
  } catch {
    // not JSON — render as given
  }
  return { kind: 'text', text }
}
