import * as React from 'react'
import { ClipboardList, LogIn, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from '../badge/Badge'
import { Button } from '../button/Button'
import { ErrorBanner } from '../error-banner/ErrorBanner'
import { Input } from '../input/Input'

export type InstanceAuthMode = 'open' | 'authenticated'

export interface InstanceModeControlLabels {
  title: string
  modeOpen: string
  modeAuthenticated: string
  modeOpenHint: string
  modeAuthenticatedHint: string
  enableLogin: string
  enableLoginNote: (minLength: number) => string
  disableLogin: string
  disableLoginNote: string
  password: string
  confirmPassword: string
  passwordMismatch: string
  passwordTooShort: (minLength: number) => string
  submitEnable: string
  submitDisable: string
  confirmAck: string
  blockedServer: string
  blockedUsers: (count: number) => string
  auditNote: string
  errorGeneric: string
  errorForbidden: string
}

export interface InstanceModeControlIcons {
  open?: LucideIcon
  authenticated?: LucideIcon
  enableLogin?: LucideIcon
  disableLogin?: LucideIcon
  audit?: LucideIcon
}

export interface InstanceModeControlProps {
  mode: InstanceAuthMode
  serverIdentity?: boolean
  otherUserCount?: number
  minPasswordLength?: number
  onSetAuthenticated: (password: string) => void | Promise<unknown>
  onSetOpen: (password: string) => void | Promise<unknown>
  loading?: boolean
  error?: string | null
  labels?: Partial<InstanceModeControlLabels>
  icons?: InstanceModeControlIcons
  className?: string
}

const defaultLabels: InstanceModeControlLabels = {
  title: 'Access mode',
  modeOpen: 'Open — no login',
  modeAuthenticated: 'Login required',
  modeOpenHint: 'This device boots straight in; accounts exist but no one signs in.',
  modeAuthenticatedHint: 'Everyone signs in with their own account.',
  enableLogin: 'Require login',
  enableLoginNote: (minLength) =>
    `Set the owner password — at least ${minLength} characters. The owner keeps admin.`,
  disableLogin: 'Remove login',
  disableLoginNote: 'Everyone with an account loses access until login is enabled again.',
  password: 'Password',
  confirmPassword: 'Confirm password',
  passwordMismatch: 'The passwords do not match.',
  passwordTooShort: (minLength) => `Use at least ${minLength} characters.`,
  submitEnable: 'Enable login',
  submitDisable: 'Disable login',
  confirmAck: 'I understand this instance will be open to anyone with access to it.',
  blockedServer: 'Server instances always require login.',
  blockedUsers: (count) =>
    `Other accounts exist (${count}) — remove them before login can be removed.`,
  auditNote: 'This change is recorded in the audit log.',
  errorGeneric: 'Something went wrong — try again.',
  errorForbidden: 'Not allowed.',
}

export function describeInstanceModeError(
  error: unknown,
  labels: Pick<InstanceModeControlLabels, 'errorGeneric' | 'errorForbidden'>,
): string {
  const record = (typeof error === 'object' && error !== null ? error : {}) as {
    status?: unknown
    detail?: unknown
    message?: unknown
  }
  const detail = typeof record.detail === 'string' ? record.detail : ''
  const message = typeof record.message === 'string' ? record.message : ''
  const text = detail || message
  if (record.status === 403) return text || labels.errorForbidden
  return text || labels.errorGeneric
}

const panelClass =
  'space-y-3 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-secondary)] p-3'
const noteClass = 'flex items-start gap-1.5 text-xs text-[var(--as-muted-fg)]'

/**
 * Presentational + controlled instance access-mode panel (identity-auth
 * §4.5, ADR-06): shows the current mode and offers the two admin
 * transitions — `open → authenticated` (the owner sets credentials in
 * the same call) and `authenticated → open` (current password plus an
 * explicit acknowledgement). Blocked states (server entrypoint, other
 * accounts existing) disable the transition with a label-driven reason.
 * Data flows in through `mode`; the transitions are events out — the app
 * persists them and re-supplies the mode. Rejections surface as
 * label-driven messages and every change carries an audit note.
 */
export const InstanceModeControl = React.forwardRef<
  HTMLDivElement,
  InstanceModeControlProps
>(function InstanceModeControl(
  {
    mode,
    serverIdentity = false,
    otherUserCount = 0,
    minPasswordLength = 10,
    onSetAuthenticated,
    onSetOpen,
    loading = false,
    error = null,
    labels,
    icons = {},
    className,
  },
  ref,
) {
  const merged = { ...defaultLabels, ...labels }
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [acknowledged, setAcknowledged] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setPassword('')
    setConfirmPassword('')
    setAcknowledged(false)
    setTouched(false)
    setActionError(null)
  }, [mode])

  const enable = mode === 'open'
  const tooShort = password.length > 0 && password.length < minPasswordLength
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword
  const enableValid = password.length >= minPasswordLength && password === confirmPassword
  const blocked = serverIdentity || otherUserCount > 0
  const disableValid = !blocked && password.length > 0 && acknowledged

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (enable ? !enableValid : !disableValid) return
    setPending(true)
    setActionError(null)
    try {
      if (enable) {
        await onSetAuthenticated(password)
      } else {
        await onSetOpen(password)
      }
      setPassword('')
      setConfirmPassword('')
      setAcknowledged(false)
      setTouched(false)
    } catch (cause) {
      setActionError(describeInstanceModeError(cause, merged))
    } finally {
      setPending(false)
    }
  }

  const ModeIcon = enable
    ? (icons.open ?? ShieldAlert)
    : (icons.authenticated ?? ShieldCheck)
  const ActionIcon = enable ? (icons.enableLogin ?? LogIn) : (icons.disableLogin ?? LogOut)
  const AuditIcon = icons.audit ?? ClipboardList

  return (
    <div ref={ref} data-as="instance-mode-control" className={cn('space-y-3', className)}>
      {error ? <ErrorBanner message={error} /> : null}
      {actionError ? <ErrorBanner message={actionError} /> : null}
      <div className="flex items-center gap-2">
        <ModeIcon className="size-4 text-[var(--as-muted-fg)]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[var(--as-fg)]">{merged.title}</h3>
        <Badge variant={enable ? 'warning' : 'success'}>
          {enable ? merged.modeOpen : merged.modeAuthenticated}
        </Badge>
      </div>
      <p className="text-xs text-[var(--as-muted-fg)]">
        {enable ? merged.modeOpenHint : merged.modeAuthenticatedHint}
      </p>
      <form className={panelClass} onSubmit={submit} noValidate>
        <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--as-fg)]">
          <ActionIcon className="size-4" aria-hidden="true" />
          {enable ? merged.enableLogin : merged.disableLogin}
        </p>
        <p className="text-xs text-[var(--as-muted-fg)]">
          {enable ? merged.enableLoginNote(minPasswordLength) : merged.disableLoginNote}
        </p>
        <Input
          ref={passwordRef}
          type="password"
          autoComplete="new-password"
          label={merged.password}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={
            touched && tooShort ? merged.passwordTooShort(minPasswordLength) : undefined
          }
        />
        {enable ? (
          <Input
            type="password"
            autoComplete="new-password"
            label={merged.confirmPassword}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={touched && mismatch ? merged.passwordMismatch : undefined}
          />
        ) : null}
        {!enable && blocked ? (
          <p className="flex items-start gap-1.5 text-xs text-[var(--as-destructive)]">
            <ShieldAlert className="mt-0.5 size-3.5" aria-hidden="true" />
            {serverIdentity
              ? merged.blockedServer
              : merged.blockedUsers(otherUserCount)}
          </p>
        ) : null}
        {!enable ? (
          <label className="flex items-start gap-2 text-xs text-[var(--as-fg)]">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 size-3.5 accent-[var(--as-primary)]"
            />
            {merged.confirmAck}
          </label>
        ) : null}
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" loading={pending || loading} disabled={enable ? !enableValid : !disableValid}>
            {enable ? merged.submitEnable : merged.submitDisable}
          </Button>
          <span className={noteClass}>
            <AuditIcon className="mt-0.5 size-3.5" aria-hidden="true" />
            {merged.auditNote}
          </span>
        </div>
      </form>
    </div>
  )
})
