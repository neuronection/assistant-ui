import * as React from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'

export interface RegisterFormFieldOverrides {
  label?: string
  placeholder?: string
}

export interface RegisterFormFields {
  fullName: RegisterFormFieldOverrides
  email: RegisterFormFieldOverrides
  password: RegisterFormFieldOverrides
  confirmPassword: RegisterFormFieldOverrides
}

export interface RegisterFormLabels {
  submit: string
  showPassword: string
  hidePassword: string
  passwordHint: string | null
  mismatch: string
  login: string
}

export interface RegisterFormIcons {
  showPassword?: LucideIcon
  hidePassword?: LucideIcon
}

export interface RegisterFormProps {
  onSubmit: (email: string, password: string, fullName?: string) => void | Promise<unknown>
  loading?: boolean
  error?: string | null
  showFullName?: boolean
  fields?: Partial<RegisterFormFields>
  labels?: Partial<RegisterFormLabels>
  icons?: RegisterFormIcons
  loginHref?: string
  onLogin?: () => void
  minPasswordLength?: number
  className?: string
}

const defaultLabels: Omit<RegisterFormLabels, 'passwordHint'> = {
  submit: 'Create account',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  mismatch: 'Passwords do not match.',
  login: 'Already have an account? Sign in',
}

const linkClassName =
  'rounded-[var(--as-radius-sm)] text-sm text-[var(--as-muted-fg)] underline transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]'

interface PasswordFieldProps {
  id: string
  name: string
  label: string
  placeholder?: string
  visible: boolean
  onToggle: () => void
  toggleLabel: string
  autoComplete: string
  minLength: number
  hint?: string | null
  error?: string
  disabled: boolean
  ShowIcon: LucideIcon
  HideIcon: LucideIcon
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  visible,
  onToggle,
  toggleLabel,
  autoComplete,
  minLength,
  hint,
  error,
  disabled,
  ShowIcon,
  HideIcon,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none text-[var(--as-fg)]">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onChange={onChange}
          className="pr-10"
        />
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={visible}
          disabled={disabled}
          onClick={onToggle}
          className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-[var(--as-radius-sm)] text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <HideIcon className="size-4" aria-hidden />
          ) : (
            <ShowIcon className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-[var(--as-muted-fg)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-[var(--as-danger)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const RegisterForm = React.forwardRef<HTMLFormElement, RegisterFormProps>(
  function RegisterForm(
    {
      onSubmit,
      loading = false,
      error = null,
      showFullName = false,
      fields,
      labels,
      icons,
      loginHref,
      onLogin,
      minPasswordLength = 10,
      className,
    },
    ref,
  ) {
    const [pending, setPending] = React.useState(false)
    const [passwordVisible, setPasswordVisible] = React.useState(false)
    const [confirmVisible, setConfirmVisible] = React.useState(false)
    const [mismatch, setMismatch] = React.useState(false)
    const passwordId = React.useId()
    const confirmId = React.useId()
    const merged = { ...defaultLabels, ...labels }
    const hint =
      labels?.passwordHint === undefined
        ? `At least ${minPasswordLength} characters.`
        : labels.passwordHint
    const busy = loading || pending
    const ShowIcon = icons?.showPassword ?? Eye
    const HideIcon = icons?.hidePassword ?? EyeOff

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (busy) return
      const data = new FormData(event.currentTarget)
      const email = String(data.get('email') ?? '').trim()
      const password = String(data.get('password') ?? '')
      const confirm = String(data.get('confirmPassword') ?? '')
      const fullName = showFullName
        ? String(data.get('fullName') ?? '').trim()
        : undefined
      if (password !== confirm) {
        setMismatch(true)
        return
      }
      void (async () => {
        setPending(true)
        try {
          await onSubmit(email, password, fullName)
        } finally {
          setPending(false)
        }
      })()
    }

    const hasLogin = Boolean(loginHref || onLogin)

    return (
      <form
        ref={ref}
        data-as="register-form"
        onSubmit={handleSubmit}
        className={cn('flex w-full flex-col gap-4', className)}
      >
        {showFullName ? (
          <Input
            name="fullName"
            label={fields?.fullName?.label ?? 'Full name'}
            placeholder={fields?.fullName?.placeholder ?? 'Ada Lovelace'}
            type="text"
            autoComplete="name"
            disabled={busy}
          />
        ) : null}
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
        <PasswordField
          id={passwordId}
          name="password"
          label={fields?.password?.label ?? 'Password'}
          placeholder={fields?.password?.placeholder}
          visible={passwordVisible}
          onToggle={() => setPasswordVisible((next) => !next)}
          toggleLabel={passwordVisible ? merged.hidePassword : merged.showPassword}
          autoComplete="new-password"
          minLength={minPasswordLength}
          hint={hint}
          disabled={busy}
          ShowIcon={ShowIcon}
          HideIcon={HideIcon}
          onChange={() => setMismatch(false)}
        />
        <PasswordField
          id={confirmId}
          name="confirmPassword"
          label={fields?.confirmPassword?.label ?? 'Confirm password'}
          placeholder={fields?.confirmPassword?.placeholder}
          visible={confirmVisible}
          onToggle={() => setConfirmVisible((next) => !next)}
          toggleLabel={confirmVisible ? merged.hidePassword : merged.showPassword}
          autoComplete="new-password"
          minLength={minPasswordLength}
          disabled={busy}
          ShowIcon={ShowIcon}
          HideIcon={HideIcon}
          error={mismatch ? merged.mismatch : undefined}
          onChange={() => setMismatch(false)}
        />
        {error ? (
          <p role="alert" className="text-xs font-medium text-[var(--as-danger)]">
            {error}
          </p>
        ) : null}
        <Button type="submit" loading={busy} className="w-full">
          {merged.submit}
        </Button>
        {hasLogin ? (
          loginHref ? (
            <a href={loginHref} onClick={onLogin} className={linkClassName}>
              {merged.login}
            </a>
          ) : (
            <button type="button" onClick={onLogin} className={linkClassName}>
              {merged.login}
            </button>
          )
        ) : null}
      </form>
    )
  },
)
