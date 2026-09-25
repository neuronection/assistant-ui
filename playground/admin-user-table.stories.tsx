import { useState } from 'react'

import {
  AdminUserTable,
  type AdminUser,
} from '../src/components/admin-user-table/AdminUserTable'

const seed: AdminUser[] = [
  {
    id: 'u-admin',
    email: 'ada@example.com',
    full_name: 'Ada Lovelace',
    is_admin: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    activity_count: 12,
  },
  {
    id: 'u-plain',
    email: 'grace@example.com',
    full_name: 'Grace Hopper',
    is_admin: false,
    is_active: true,
    created_at: '2026-02-01T00:00:00Z',
    activity_count: 3,
  },
  {
    id: 'u-off',
    email: 'alan@example.com',
    full_name: '',
    is_admin: false,
    is_active: false,
    created_at: '2026-03-01T00:00:00Z',
    activity_count: 0,
  },
]

export const Default = () => {
  const [users, setUsers] = useState(seed)
  return (
    <AdminUserTable
      users={users}
      currentUserId="u-admin"
      onPatch={(user, patch) =>
        user.id === 'u-admin' && Object.values(patch).some((value) => value === false)
          ? undefined
          : setUsers((rows) =>
              rows.map((row) => (row.id === user.id ? { ...row, ...patch } : row)),
            )
      }
      onResetPassword={() => undefined}
      onForceLogout={() => undefined}
    />
  )
}

export const GuardRailErrors = () => (
  <AdminUserTable
    users={seed}
    currentUserId="u-admin"
    onPatch={() => {
      throw { status: 403, detail: 'Admins cannot demote or deactivate themselves' }
    }}
    onResetPassword={() => {
      throw { status: 403, detail: 'Cannot remove the last admin' }
    }}
    onForceLogout={() => undefined}
  />
)

export const LoadingAndEmpty = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <AdminUserTable
      users={[]}
      currentUserId="u-admin"
      loading
      onPatch={() => undefined}
      onResetPassword={() => undefined}
      onForceLogout={() => undefined}
    />
    <AdminUserTable
      users={[]}
      currentUserId="u-admin"
      onPatch={() => undefined}
      onResetPassword={() => undefined}
      onForceLogout={() => undefined}
    />
    <AdminUserTable
      users={[]}
      currentUserId="u-admin"
      error="Could not load users (500)."
      onPatch={() => undefined}
      onResetPassword={() => undefined}
      onForceLogout={() => undefined}
    />
  </div>
)

export const GermanLabels = () => (
  <AdminUserTable
    users={seed}
    currentUserId="u-admin"
    onPatch={() => undefined}
    onResetPassword={() => undefined}
    onForceLogout={() => undefined}
    labels={{
      you: 'du',
      email: 'E-Mail',
      activity: 'Aktivität',
      role: 'Rolle',
      status: 'Status',
      actions: 'Aktionen',
      adminRole: 'Admin',
      userRole: 'Nutzer',
      activeStatus: 'Aktiv',
      disabledStatus: 'Deaktiviert',
      promote: 'Zum Admin machen',
      demote: 'Admin entfernen',
      activate: 'Aktivieren',
      deactivate: 'Deaktivieren',
      resetPassword: 'Passwort zurücksetzen',
      forceLogout: 'Abmelden erzwingen',
      resetTitle: (email) => `Neues Passwort für ${email}`,
      newPassword: 'Neues Passwort',
      passwordHint: (minLength) => `Mindestens ${minLength} Zeichen`,
      setPassword: 'Passwort setzen',
      cancel: 'Abbrechen',
    }}
  />
)
