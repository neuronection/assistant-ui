import { useState } from 'react'

import { RegisterForm } from '../src/components/register-form/RegisterForm'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--as-secondary)] p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}

export const Default = () => (
  <Shell>
    <h1 className="text-center text-lg font-semibold text-[var(--as-fg)]">
      Create account
    </h1>
    <RegisterForm onSubmit={() => undefined} onLogin={() => undefined} />
  </Shell>
)

export const WithFullName = () => {
  const [error, setError] = useState<string | null>(null)
  return (
    <Shell>
      <RegisterForm
        showFullName
        error={error}
        onSubmit={async (email) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          setError(`${email} is already registered.`)
        }}
        onLogin={() => undefined}
      />
    </Shell>
  )
}

export const Loading = () => (
  <div className="flex w-full max-w-sm flex-col gap-6">
    <div className="rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6">
      <RegisterForm loading onSubmit={() => undefined} />
    </div>
    <div className="rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6">
      <RegisterForm showFullName loading onSubmit={() => undefined} />
    </div>
  </div>
)

export const CustomLabels = () => (
  <Shell>
    <RegisterForm
      fields={{ confirmPassword: { label: 'Passwort wiederholen' } }}
      labels={{ submit: 'Konto erstellen', passwordHint: null, login: 'Schon ein Konto? Anmelden' }}
      onSubmit={() => undefined}
      onLogin={() => undefined}
    />
  </Shell>
)
