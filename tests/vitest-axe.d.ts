declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(expected?: unknown): T
  }
}

export {}
