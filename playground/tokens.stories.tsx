import type { CSSProperties } from 'react'
import { Button } from '../src/components/button/Button'
import { Badge } from '../src/components/badge/Badge'

const semanticPairs: Array<[string, string]> = [
  ['--as-primary', '--as-primary-fg'],
  ['--as-secondary', '--as-secondary-fg'],
  ['--as-surface', '--as-fg'],
  ['--as-surface-raised', '--as-fg'],
  ['--as-muted', '--as-muted-fg'],
]

const singles = [
  '--as-success',
  '--as-warning',
  '--as-danger',
  '--as-ai',
  '--as-focus-ring',
  '--as-border',
  '--as-overlay',
]

const darkTokens: Record<string, string> = {
  '--as-primary': 'oklch(0.68 0.15 258)',
  '--as-primary-fg': 'oklch(0.16 0.02 258)',
  '--as-secondary': 'oklch(0.28 0.012 90)',
  '--as-secondary-fg': 'oklch(0.93 0.005 90)',
  '--as-surface': 'oklch(0.185 0.01 90)',
  '--as-surface-raised': 'oklch(0.235 0.012 90)',
  '--as-border': 'oklch(0.33 0.012 90)',
  '--as-fg': 'oklch(0.95 0.004 90)',
  '--as-muted': 'oklch(0.26 0.012 90)',
  '--as-muted-fg': 'oklch(0.68 0.01 90)',
  '--as-success': 'oklch(0.72 0.16 152)',
  '--as-success-fg': 'oklch(0.16 0.02 152)',
  '--as-warning': 'oklch(0.82 0.15 78)',
  '--as-warning-fg': 'oklch(0.2 0.02 78)',
  '--as-danger': 'oklch(0.68 0.19 27)',
  '--as-danger-fg': 'oklch(0.16 0.02 27)',
  '--as-ai': 'oklch(0.7 0.2 293)',
  '--as-ai-fg': 'oklch(0.15 0.03 293)',
  '--as-focus-ring': 'oklch(0.75 0.13 258)',
  '--as-overlay': 'oklch(0 0 0 / 0.7)',
}

function Swatch({ token, fg }: { token: string; fg?: string }) {
  return (
    <div
      title={token}
      className="flex h-14 items-end rounded-[var(--as-radius)] border border-[var(--as-border)] p-2"
      style={{ background: `var(${token})`, color: fg ? `var(${fg})` : undefined }}
    >
      <span className="truncate text-[10px] font-bold">{token.replace('--as-', '')}</span>
    </div>
  )
}

function TokenGrids() {
  return (
    <>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--as-muted-fg)]">
          Paired tokens (fill + fg)
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {semanticPairs.map(([bg, fg]) => (
            <Swatch key={bg} token={bg} fg={fg} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--as-muted-fg)]">
          Single tokens
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {singles.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
        <Button size="sm" variant="destructive">
          Destructive
        </Button>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="ai">AI</Badge>
      </div>
    </>
  )
}

export const SemanticTokens = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
    <TokenGrids />
    <p className="text-xs text-[var(--as-muted-fg)]">
      Apps re-map any of these in their theme.css; a .dark block re-maps them
      for dark mode (health-assistant does exactly that — see the Dark tokens
      story and themes/dark-reference.css).
    </p>
  </div>
)

export const DarkTokens = () => (
  <div
    className="dark"
    style={
      {
        ...darkTokens,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 720,
        background: 'var(--as-surface)',
        color: 'var(--as-fg)',
        padding: 24,
        borderRadius: 'var(--as-radius-lg)',
      } as CSSProperties
    }
  >
    <TokenGrids />
    <p className="text-xs text-[var(--as-muted-fg)]">
      The same remap block ships in themes/dark-reference.css — copy it into an
      app theme.css and toggle the .dark class on the html element.
    </p>
  </div>
)

export const RadiiShadows = () => (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', maxWidth: 720 }}>
    {(['--as-radius-sm', '--as-radius', '--as-radius-lg'] as const).map((token) => (
      <div key={token} className="flex h-20 w-32 items-center justify-center border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-xs" style={{ borderRadius: `var(${token})` }}>
        {token}
      </div>
    ))}
    {(['--as-shadow-1', '--as-shadow-2', '--as-shadow-3'] as const).map((token) => (
      <div key={token} className="flex h-20 w-32 items-center justify-center rounded-[var(--as-radius)] bg-[var(--as-surface-raised)] text-xs" style={{ boxShadow: `var(${token})` }}>
        {token}
      </div>
    ))}
  </div>
)
