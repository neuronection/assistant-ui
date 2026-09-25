import * as React from 'react'
import { KeyRound, LogOut, Shield, ShieldCheck, UserCheck, Users, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from '../badge/Badge'
import { Button } from '../button/Button'
import { EmptyState } from '../empty-state/EmptyState'
import { ErrorBanner } from '../error-banner/ErrorBanner'
import { Input } from '../input/Input'
import { Spinner } from '../spinner/Spinner'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  activity_count: number
}

export type AdminUserPatch = { is_active?: boolean; is_admin?: boolean }

export interface AdminUserTableLabels {
  tableCaption: string
  you: string
  email: string
  activity: string
  role: string
  status: string
  actions: string
  adminRole: string
  userRole: string
  activeStatus: string
  disabledStatus: string
  promote: string
  demote: string
  activate: string
  deactivate: string
  resetPassword: string
  forceLogout: string
  loading: string
  empty: string
  resetTitle: (email: string) => string
  newPassword: string
  passwordHint: (minLength: number) => string
  setPassword: string
  cancel: string
  resetNote: (email: string) => string
  errorGeneric: string
  errorForbidden: string
  errorSelf: string
  errorLastAdmin: string
}

export interface AdminUserTableIcons {
  promote?: LucideIcon
  demote?: LucideIcon
  activate?: LucideIcon
  deactivate?: LucideIcon
  resetPassword?: LucideIcon
  forceLogout?: LucideIcon
  empty?: LucideIcon
}

export interface AdminUserTableProps {
  users: AdminUser[]
  currentUserId: string
  onPatch: (user: AdminUser, patch: AdminUserPatch) => void | Promise<unknown>
  onResetPassword: (user: AdminUser, newPassword: string) => void | Promise<unknown>
  onForceLogout: (user: AdminUser) => void | Promise<unknown>
  loading?: boolean
  error?: string | null
  minPasswordLength?: number
  labels?: Partial<AdminUserTableLabels>
  icons?: AdminUserTableIcons
  className?: string
}

const defaultLabels: AdminUserTableLabels = {
  tableCaption: 'Users',
  you: 'you',
  email: 'Email',
  activity: 'Activity',
  role: 'Role',
  status: 'Status',
  actions: 'Actions',
  adminRole: 'Admin',
  userRole: 'User',
  activeStatus: 'Active',
  disabledStatus: 'Disabled',
  promote: 'Make admin',
  demote: 'Remove admin',
  activate: 'Activate',
  deactivate: 'Deactivate',
  resetPassword: 'Reset password',
  forceLogout: 'Force logout',
  loading: 'Loading users…',
  empty: 'No users',
  resetTitle: (email) => `New password for ${email}`,
  newPassword: 'New password',
  passwordHint: (minLength) => `At least ${minLength} characters`,
  setPassword: 'Set password',
  cancel: 'Cancel',
  resetNote: (email) => `Password for ${email} updated — share it out of band.`,
  errorGeneric: 'Something went wrong — try again.',
  errorForbidden: 'Not allowed.',
  errorSelf: 'You cannot change your own role or status.',
  errorLastAdmin: 'The last admin cannot be demoted or deactivated.',
}

export function describeAdminUserError(
  error: unknown,
  labels: Pick<
    AdminUserTableLabels,
    'errorGeneric' | 'errorForbidden' | 'errorSelf' | 'errorLastAdmin'
  >,
): string {
  const record = (typeof error === 'object' && error !== null ? error : {}) as {
    status?: unknown
    detail?: unknown
    message?: unknown
  }
  const detail = typeof record.detail === 'string' ? record.detail : ''
  const message = typeof record.message === 'string' ? record.message : ''
  const text = detail || message
  if (record.status === 403) {
    if (/themselves/i.test(text)) return labels.errorSelf
    if (/last admin/i.test(text)) return labels.errorLastAdmin
    return text || labels.errorForbidden
  }
  return text || labels.errorGeneric
}

const actionButtonClass =
  'inline-flex items-center gap-1.5 rounded-[var(--as-radius-sm)] px-2 py-1 text-xs font-medium text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-40'

/**
 * Presentational + controlled admin user table (identity-auth §12): email
 * (+ "(you)" marker), activity count, role, status and the per-row actions
 * — promote/demote, activate/deactivate, password reset (inline panel with
 * a minimum-length gate) and force logout. Data flows in through `users`;
 * actions are events out — the app persists and re-supplies the list.
 * Guard-rail 403 rejections surface as friendly, label-driven messages.
 */
export const AdminUserTable = React.forwardRef<HTMLDivElement, AdminUserTableProps>(
  function AdminUserTable(
    {
      users,
      currentUserId,
      onPatch,
      onResetPassword,
      onForceLogout,
      loading = false,
      error = null,
      minPasswordLength = 10,
      labels: labelsProp,
      icons: iconsProp,
      className,
    },
    ref,
  ) {
    const labels = React.useMemo(
      () => ({ ...defaultLabels, ...labelsProp }),
      [labelsProp],
    )
    const icons = iconsProp ?? {}
    const [actionError, setActionError] = React.useState<string | null>(null)
    const [note, setNote] = React.useState<string | null>(null)
    const [busyUserId, setBusyUserId] = React.useState<string | null>(null)
    const [resetUserId, setResetUserId] = React.useState<string | null>(null)
    const [draft, setDraft] = React.useState('')
    const passwordInputRef = React.useRef<HTMLInputElement>(null)
    const resetTriggerRefs = React.useRef(new Map<string, HTMLButtonElement | null>())
    const resetPanelId = React.useId()
    const resetting = users.find((user) => user.id === resetUserId) ?? null

    React.useEffect(() => {
      if (resetUserId !== null) {
        passwordInputRef.current?.focus()
      }
    }, [resetUserId])

    const closeReset = React.useCallback(() => {
      const trigger = resetUserId ? resetTriggerRefs.current.get(resetUserId) : null
      setResetUserId(null)
      setDraft('')
      trigger?.focus()
    }, [resetUserId])

    const run = React.useCallback(
      async (user: AdminUser, task: () => void | Promise<unknown>) => {
        setActionError(null)
        setNote(null)
        setBusyUserId(user.id)
        try {
          await task()
        } catch (caught) {
          setActionError(describeAdminUserError(caught, labels))
        } finally {
          setBusyUserId(null)
        }
      },
      [labels],
    )

    const submitReset = async (event: React.FormEvent) => {
      event.preventDefault()
      const user = users.find((candidate) => candidate.id === resetUserId)
      if (!user || draft.length < minPasswordLength) return
      setActionError(null)
      setNote(null)
      setBusyUserId(user.id)
      try {
        await onResetPassword(user, draft)
        setNote(labels.resetNote(user.email))
        closeReset()
      } catch (caught) {
        setActionError(describeAdminUserError(caught, labels))
      } finally {
        setBusyUserId(null)
      }
    }

    const rowBusy = (user: AdminUser) => busyUserId === user.id

    return (
      <div ref={ref} data-as="admin-user-table" className={cn('space-y-3', className)}>
        {error ? <ErrorBanner message={error} /> : null}
        {actionError ? <ErrorBanner message={actionError} /> : null}
        {note ? (
          <p role="status" className="text-xs font-medium text-[var(--as-success)]">
            {note}
          </p>
        ) : null}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner size="md" />
            <span className="text-sm text-[var(--as-muted-fg)]">{labels.loading}</span>
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={icons.empty ?? Users} title={labels.empty} compact />
        ) : (
          <div className="overflow-x-auto rounded-[var(--as-radius)] border border-[var(--as-border)]">
            <table className="w-full text-sm">
              <caption className="sr-only">{labels.tableCaption}</caption>
              <thead className="bg-[var(--as-muted)] text-left">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--as-muted-fg)]">
                    {labels.email}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--as-muted-fg)]">
                    {labels.activity}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--as-muted-fg)]">
                    {labels.role}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--as-muted-fg)]">
                    {labels.status}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--as-muted-fg)]">
                    {labels.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color-mix(in_srgb,var(--as-border)_55%,transparent)]">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId
                  const PromoteIcon = icons.promote ?? ShieldCheck
                  const DemoteIcon = icons.demote ?? Shield
                  const ActivateIcon = icons.activate ?? UserCheck
                  const DeactivateIcon = icons.deactivate ?? UserX
                  const ResetIcon = icons.resetPassword ?? KeyRound
                  const LogoutIcon = icons.forceLogout ?? LogOut
                  return (
                    <tr key={user.id} className="bg-[var(--as-surface-raised)]">
                      <td className="px-4 py-3">
                        <span className="font-medium text-[var(--as-fg)]">{user.email}</span>
                        {isSelf ? (
                          <span className="ml-1 text-xs text-[var(--as-muted-fg)]">
                            ({labels.you})
                          </span>
                        ) : null}
                        {user.full_name ? (
                          <span className="block text-xs text-[var(--as-muted-fg)]">
                            {user.full_name}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--as-muted-fg)]">
                        {user.activity_count}
                      </td>
                      <td className="px-4 py-3">
                        {user.is_admin ? (
                          <Badge variant="default">{labels.adminRole}</Badge>
                        ) : (
                          <Badge variant="secondary">{labels.userRole}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <Badge variant="success">{labels.activeStatus}</Badge>
                        ) : (
                          <Badge variant="danger">{labels.disabledStatus}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          role="group"
                          aria-label={`${labels.actions} — ${user.email}`}
                          className="flex flex-wrap items-center justify-end gap-1"
                        >
                          <button
                            type="button"
                            className={actionButtonClass}
                            disabled={rowBusy(user)}
                            onClick={() =>
                              void run(user, () =>
                                onPatch(user, { is_admin: !user.is_admin }),
                              )
                            }
                          >
                            {user.is_admin ? (
                              <DemoteIcon className="size-3.5" aria-hidden />
                            ) : (
                              <PromoteIcon className="size-3.5" aria-hidden />
                            )}
                            {user.is_admin ? labels.demote : labels.promote}
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass}
                            disabled={rowBusy(user)}
                            onClick={() =>
                              void run(user, () =>
                                onPatch(user, { is_active: !user.is_active }),
                              )
                            }
                          >
                            {user.is_active ? (
                              <DeactivateIcon className="size-3.5" aria-hidden />
                            ) : (
                              <ActivateIcon className="size-3.5" aria-hidden />
                            )}
                            {user.is_active ? labels.deactivate : labels.activate}
                          </button>
                          <button
                            type="button"
                            ref={(node) => {
                              resetTriggerRefs.current.set(user.id, node)
                            }}
                            className={actionButtonClass}
                            disabled={rowBusy(user)}
                            onClick={() => {
                              setActionError(null)
                              setNote(null)
                              setDraft('')
                              setResetUserId(user.id)
                            }}
                          >
                            <ResetIcon className="size-3.5" aria-hidden />
                            {labels.resetPassword}
                          </button>
                          <button
                            type="button"
                            className={cn(actionButtonClass, 'hover:text-[var(--as-danger)]')}
                            disabled={rowBusy(user)}
                            onClick={() => void run(user, () => onForceLogout(user))}
                          >
                            <LogoutIcon className="size-3.5" aria-hidden />
                            {labels.forceLogout}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {resetting ? (
          <form
            data-as="admin-user-table-reset"
            aria-labelledby={`${resetPanelId}-title`}
            onSubmit={(event) => void submitReset(event)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                closeReset()
              }
            }}
            className="max-w-md space-y-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-4"
          >
            <p id={`${resetPanelId}-title`} className="text-sm font-medium text-[var(--as-fg)]">
              {labels.resetTitle(resetting.email)}
            </p>
            <Input
              ref={passwordInputRef}
              type="password"
              autoComplete="new-password"
              label={labels.newPassword}
              hint={labels.passwordHint(minPasswordLength)}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={draft.length < minPasswordLength || rowBusy(resetting)}
              >
                {labels.setPassword}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={closeReset}>
                {labels.cancel}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    )
  },
)
