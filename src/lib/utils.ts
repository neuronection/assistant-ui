import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Pretty-print JSON text (2-space indent) when it parses as an object or
 * array; any other text passes through unchanged. */
export function prettyJson(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed && typeof parsed === 'object') {
      return JSON.stringify(parsed, null, 2)
    }
  } catch {
    // not JSON — render as given
  }
  return text
}
