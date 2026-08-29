import type { Preview } from '@ladle/react'
import '../dist/styles.css'

export const Preview: Preview = ({ children }) => (
  <div
    style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--as-surface)',
      color: 'var(--as-fg)',
      fontFamily: 'var(--as-font-sans)',
    }}
  >
    {children}
  </div>
)
