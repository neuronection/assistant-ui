import type { GlobalProvider } from '@ladle/react'
import '../dist/styles.css'
import './reset.css'

export const Provider: GlobalProvider = ({ children }) => (
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
