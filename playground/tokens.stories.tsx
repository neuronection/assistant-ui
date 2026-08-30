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

export const SemanticTokens = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
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
    <p className="text-xs text-[var(--as-muted-fg)]">
      Apps re-map any of these in their theme.css; a .dark block re-maps them
      for dark mode (health-assistant does exactly that).
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
