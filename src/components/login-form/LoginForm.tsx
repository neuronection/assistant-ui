import * as React from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'

export interface LoginFormFieldOverrides {
  label?: string
  placeholder?: string
}

export interface LoginFormFields {
  email: LoginFormFieldOverrides
  password: LoginFormFieldOverrides
}

export interface LoginFormLabels {
  submit: string
  showPassword: string
  hidePassword: string
  register: string
  forgot: string
}

export interface LoginFormIcons {
  showPassword?: LucideIcon
  hidePassword?: LucideIcon
}

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void | Promise<unknown>
  loading?: boolean
  error?: string | null
  fields?: Partial<LoginFormFields>
  labels?: Partial<LoginFormLabels>
  icons?: LoginFormIcons
  registerHref?: string
  onRegister?: () => void
  forgotHref?: string
  minPasswordLength?: number
  className?: string
}

const defaultLabels: LoginFormLabels = {
  submit: 'Sign in',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  register: 'Need an account? Create one',
  forgot: 'Forgot password?',
}

const linkClassName =
  'rounded-[var(--as-radius-sm)] text-sm text-[var(--as-muted-fg)] underline transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]'

export const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(
  function LoginForm(
    {
      onSubmit,
      loading = false,
      error = null,
      fields,
      labels,
      icons,
      registerHref,
      onRegister,
      forgotHref,
      minPasswordLength = 10,
      className,
    },
    ref,
  ) {
    const [pending, setPending] = React.useState(false)
    const [visible, setVisible] = React.useState(false)
    const passwordId = React.useId()
    const merged = { ...defaultLabels, ...labels }
    const busy = loading || pending
    const ShowIcon = icons?.showPassword ?? Eye
    const HideIcon = icons?.hidePassword ?? EyeOff
    const hasRegister = Boolean(registerHref || onRegister)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (busy) return
      const data = new FormData(event.currentTarget)
      const email = String(data.get('email') ?? '').trim()
      const password = String(data.get('password') ?? '')
      void (async () => {
        setPending(true)
        try {
          await onSubmit(email, password)
        } finally {
          setPending(false)
        }
      })()
    }

    return (
      <form
        ref={ref}
        data-as="login-form"
        onSubmit={handleSubmit}
        className={cn('flex w-full flex-col gap-4', className)}
      >
        <Input
          name="email"
          label={fields?.email?.label ?? 'Email'}
          placeholder={fields?.email?.placeholder ?? 'you@example.com'}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={busy}
        />
        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor={passwordId}
            className="text-sm font-medium leading-none text-[var(--as-fg)]"
          >
            {fields?.password?.label ?? 'Password'}
          </label>
          <div className="relative">
            <Input
              id={passwordId}
              name="password"
              placeholder={fields?.password?.placeholder}
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={minPasswordLength}
              disabled={busy}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={visible ? merged.hidePassword : merged.showPassword}
              aria-pressed={visible}
              disabled={busy}
              onClick={() => setVisible((next) => !next)}
              className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-[var(--as-radius-sm)] text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {visible ? (
                <HideIcon className="size-4" aria-hidden />
              ) : (
                <ShowIcon className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-xs font-medium text-[var(--as-danger)]">
            {error}
          </p>
        ) : null}
        <Button type="submit" loading={busy} className="w-full">
          {merged.submit}
        </Button>
        {hasRegister || forgotHref ? (
          <div className="flex flex-col items-center gap-2 text-sm">
            {hasRegister ? (
              registerHref ? (
                <a href={registerHref} onClick={onRegister} className={linkClassName}>
                  {merged.register}
                </a>
              ) : (
                <button type="button" onClick={onRegister} className={linkClassName}>
                  {merged.register}
                </button>
              )
            ) : null}
            {forgotHref ? (
              <a href={forgotHref} className={linkClassName}>
                {merged.forgot}
              </a>
            ) : null}
          </div>
        ) : null}
      </form>
    )
  },
)
