import { useState } from 'react'

import { LoginForm } from '../src/components/login-form/LoginForm'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--as-secondary)] p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}

export const Default = () => {
  const [error, setError] = useState<string | null>(null)
  return (
    <Shell>
      <h1 className="text-center text-lg font-semibold text-[var(--as-fg)]">Sign in</h1>
      <LoginForm
        error={error}
        onSubmit={async (email, password) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          if (password !== 'correct-horse-battery') {
            setError(`No account matches ${email} with that password.`)
          } else {
            setError(null)
          }
        }}
        onRegister={() => undefined}
      />
    </Shell>
  )
}

export const LoadingAndError = () => (
  <div className="flex flex-col items-center gap-6">
    <div className="w-full max-w-sm rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6">
      <LoginForm loading onSubmit={() => undefined} />
    </div>
    <div className="w-full max-w-sm rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6">
      <LoginForm
        error="Sign-in failed. Check your email and password."
        onSubmit={() => undefined}
        forgotHref="/forgot"
      />
    </div>
  </div>
)

export const CustomLabels = () => (
  <Shell>
    <LoginForm
      fields={{ email: { label: 'E-Mail', placeholder: 'name@beispiel.de' } }}
      labels={{ submit: 'Anmelden', register: 'Noch kein Konto? Jetzt erstellen' }}
      onSubmit={() => undefined}
      onRegister={() => undefined}
    />
  </Shell>
)

export const WithLinks = () => (
  <Shell>
    <LoginForm
      onSubmit={() => undefined}
      registerHref="/register"
      forgotHref="/forgot"
    />
  </Shell>
)
