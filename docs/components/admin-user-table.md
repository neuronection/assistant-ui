# AdminUserTable

Admin user management table (identity-auth §12, extracted from career's
`settings/Users.tsx` and generalized): email (+ `"(you)"` marker), activity
count, role, status and the per-row actions — promote/demote,
activate/deactivate, password reset (inline panel with a minimum-length
gate) and force logout. Guard-rail 403 rejections (self-demotion,
last-admin) surface as friendly, label-driven messages. Presentational +
controlled (ADR-06): the app fetches the list, persists the actions and
re-supplies `users`; nothing here talks to a network, store or router.
Study is the first consumer (just-in-time exception, plan §5.10); career
adopts in Phase 3.

## import

```ts
import { AdminUserTable } from '@neuronection/assistant-ui/admin-user-table'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `users` | `AdminUser[]` | The rows to render (`id`, `email`, `full_name`, `is_admin`, `is_active`, `created_at`, `activity_count`). |
| `currentUserId` | `string` | Row matching this id gets the `"(you)"` marker. |
| `onPatch` | `(user: AdminUser, patch: AdminUserPatch) => void \| Promise<unknown>` | Promote/demote (`{is_admin}`) and activate/deactivate (`{is_active}`) events; reject with `{status: 403, detail}` for guard rails and the component maps them to friendly messages. |
| `onResetPassword` | `(user: AdminUser, newPassword: string) => void \| Promise<unknown>` | Submit of the inline reset panel (only called once the draft passes `minPasswordLength`). |
| `onForceLogout` | `(user: AdminUser) => void \| Promise<unknown>` | Force-logout action for a row. |
| `loading` | `boolean` | Renders the spinner state instead of the table (default `false`). |
| `error` | `string \| null` | Load-level error shown in an `ErrorBanner` above the table (default `null`). |
| `minPasswordLength` | `number` | Reset-panel gate; submit stays disabled below it (default `10`). |
| `labels` | `Partial<AdminUserTableLabels>` | Every string, incl. `resetTitle(email)` / `passwordHint(minLength)` functions — see the i18n contract. |
| `icons` | `AdminUserTableIcons` | Per-action `LucideIcon` overrides (`promote`, `demote`, `activate`, `deactivate`, `resetPassword`, `forceLogout`, `empty`). |
| `className` | `string` | Merged onto the root (`cn(internal, className)`). |

Also exported: `describeAdminUserError(error, labels)` — maps a rejection
(`{status, detail}` or `Error`) to a label-driven message (403 + "themselves"
→ `errorSelf`, 403 + "last admin" → `errorLastAdmin`, other 403 → the detail
or `errorForbidden`, everything else → the detail/message or
`errorGeneric`) — and the `AdminUser`, `AdminUserPatch` types.

## controlled contract

Fully controlled: the table renders exactly the `users` it is given and
never mutates them. Actions call `onPatch` / `onResetPassword` /
`onForceLogout` (sync or async); on rejection the error is surfaced
in-band, on success the app re-fetches/updates and passes the new list.
Per-row busy state while a promise is pending. The only internal state is
UI-local: the open reset panel, its draft, the busy marker and transient
error/note text. `forwardRef` lands on the root `div[data-as="admin-user-table"]`.

## label / i18n contract

All strings come from `labels` (partial merge over English defaults), so
apps translate at the call site — no i18n engine inside the library. Two
labels are functions because they interpolate: `resetTitle(email)` and
`passwordHint(minLength)` (plus `resetNote(email)` on success).

## snippets

```tsx
import { AdminUserTable, describeAdminUserError } from '@neuronection/assistant-ui/admin-user-table'

function UsersTab() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await fetchUsers())
      setError(null)
    } catch (err) {
      setError(describeAdminUserError(err, labels))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminUserTable
      users={users}
      currentUserId={me.id}
      loading={loading}
      error={error}
      onPatch={async (user, patch) => {
        await patchUser(user.id, patch)
        await load()
      }}
      onResetPassword={async (user, newPassword) => {
        await resetUserPassword(user.id, newPassword)
        await load()
      }}
      onForceLogout={async (user) => {
        await forceLogout(user.id)
        await load()
      }}
      labels={{
        you: t('users.you'),
        activity: t('users.activity'),
        resetTitle: (email) => t('users.newPasswordFor', { email }),
        // …the rest of the labels
      }}
    />
  )
}
```

```tsx
<AdminUserTable
  users={users}
  currentUserId={me.id}
  onPatch={onPatch}
  onResetPassword={onResetPassword}
  onForceLogout={onForceLogout}
  minPasswordLength={12}
  icons={{ resetPassword: KeyRound }}
/>
```

## accessibility

Native `<table>` with a sr-only `<caption>`, `scope="col"` headers and a
per-row labelled `role="group"` of action buttons. The reset panel is a
form labelled by its title: opening focuses the password input, Escape
closes it and returns focus to the row's *Reset password* trigger, Enter
submits when the draft passes the minimum length. Transient notes use
`role="status"`, errors `role="alert"`. Clean under jest-axe in default,
loading and reset-panel states. See the
[matrix row](../accessibility.md#settings-blocks).

## related

[`table`](./table.md), [`badge`](./badge.md), [`input`](./input.md),
[`empty-state`](./empty-state.md), [`error-banner`](./error-banner.md),
[`user-menu`](./user-menu.md).
