export const rawTokens = [
  '--as-tone-0',
  '--as-tone-50',
  '--as-tone-100',
  '--as-tone-200',
  '--as-tone-300',
  '--as-tone-500',
  '--as-tone-700',
  '--as-tone-900',
  '--as-accent',
  '--as-accent-strong',
  '--as-success',
  '--as-warning',
  '--as-danger',
  '--as-ai',
] as const

export const semanticTokens = [
  '--as-primary',
  '--as-primary-fg',
  '--as-secondary',
  '--as-secondary-fg',
  '--as-surface',
  '--as-surface-raised',
  '--as-border',
  '--as-fg',
  '--as-muted',
  '--as-muted-fg',
  '--as-success-fg',
  '--as-warning-fg',
  '--as-danger-fg',
  '--as-ai-fg',
  '--as-focus-ring',
  '--as-overlay',
  '--as-z-modal',
  '--as-z-popover',
  '--as-radius-sm',
  '--as-radius',
  '--as-radius-lg',
  '--as-font-sans',
  '--as-font-mono',
  '--as-shadow-1',
  '--as-shadow-2',
  '--as-shadow-3',
] as const

export type RawTokenName = (typeof rawTokens)[number]
export type SemanticTokenName = (typeof semanticTokens)[number]
export type ThemeTokenName = SemanticTokenName | RawTokenName
export type ThemeTokens = Partial<Record<ThemeTokenName, string>>
