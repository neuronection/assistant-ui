import { useState } from 'react'

import { AuthGate } from '../src/components/auth-gate/AuthGate'
import { LoginForm } from '../src/components/login-form/LoginForm'

function LoginShell() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--as-secondary)] p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-6 shadow-lg">
        <h1 className="text-center text-lg font-semibold text-[var(--as-fg)]">Sign in</h1>
        <LoginForm onSubmit={() => undefined} onRegister={() => undefined} />
      </div>
    </div>
  )
}

/** Boot resolves with a session — the app renders. */
export const Authenticated = () => (
  <AuthGate
    boot={() => new Promise((resolve) => setTimeout(() => resolve(true), 600))}
    login={<LoginShell />}
  >
    <div className="flex min-h-screen items-center justify-center bg-[var(--as-surface)] text-[var(--as-fg)]">
      the app
    </div>
  </AuthGate>
)

/** Boot resolves anonymous — the app-composed login surface renders. */
export const Anonymous = () => (
  <AuthGate boot={() => Promise.resolve(false)} login={<LoginShell />}>
    <div className="flex min-h-screen items-center justify-center bg-[var(--as-surface)] text-[var(--as-fg)]">
      the app
    </div>
  </AuthGate>
)

/** Boot never resolves — the default `role="status"` splash shows. */
export const Checking = () => (
  <AuthGate boot={() => new Promise(() => {})} login={<LoginShell />}>
    <div className="flex min-h-screen items-center justify-center bg-[var(--as-surface)] text-[var(--as-fg)]">
      the app
    </div>
  </AuthGate>
)

/** Full loop: sign in through the login surface, lose the session
 * mid-flight and land back on it — both transitions ride resetKey. */
export const SignInAndSessionLoss = () => {
  const [resetKey, setResetKey] = useState(0)
  const [sessionLost, setSessionLost] = useState(false)
  return (
    <div>
      <AuthGate
        boot={() =>
          new Promise((resolve) =>
            setTimeout(() => resolve(!sessionLost && resetKey > 0), 400),
          )
        }
        resetKey={resetKey}
        login={<LoginShell />}
        onStatusChange={(status) => {
          if (status === 'authenticated') setSessionLost(false)
        }}
      >
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--as-surface)] text-[var(--as-fg)]">
          <span>the app</span>
          <button
            type="button"
            className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-3 py-1.5 text-sm"
            onClick={() => {
              setSessionLost(true)
              setResetKey((key) => key + 1)
            }}
          >
            Simulate mid-session 401
          </button>
        </div>
      </AuthGate>
      <button
        type="button"
        className="fixed bottom-4 right-4 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] px-3 py-1.5 text-sm"
        onClick={() => setResetKey((key) => key + 1)}
      >
        Sign in succeeded → re-check
      </button>
    </div>
  )
}
