declare module 'jest-axe' {
  export interface AxeResults {
    violations: Array<Record<string, unknown>>
  }
  export function axe(
    html: Element | string,
    options?: Record<string, unknown>,
  ): Promise<AxeResults>
  export const toHaveNoViolations: Record<string, unknown>
}
