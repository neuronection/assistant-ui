# AccountSessionList

The active-sessions list shared by health's account settings, career's
`SessionsCard` and study's session rows (plan 60 D5): one `<li>` per session
with a preformatted detail line, an optional device icon and badge slot, a
current-session badge and a per-row revoke button that can show a busy state.
Rows can also come back already signed out (`revoked`) or with no revoke
action (`revocable: false`).

## import

```ts
import { AccountSessionList } from '@neuronection/assistant-ui/account-session-list'
```

## props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `AccountSessionRow[]` | — | One row per session: `{ id, current?, label, details, icon?, badges?, revoked?, revocable? }`. |
| `onRevoke` | `(id: string) => void` | — | Called with the row id from its revoke button (never for a revoked or non-revocable row). |
| `busyId` | `string` | — | Row whose revoke is in flight: its button is disabled, `aria-busy`, and its visible text becomes `labels.revoking`; every other row stays enabled. |
| `labels` | `{ current: string; revoke: string; revoking: string; revoked?: string; empty?: string }` | — | All strings app-owned; `revoked` defaults to “Signed out”, `empty` to “No active sessions”. |
| `headerAction` | `ReactNode` | — | Slot above the list (e.g. “sign out other sessions”); app-owned. |
| `className` | `string` | — | Merges. |

`AccountSessionRow`:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Stable key, passed back to `onRevoke`. |
| `current` | `boolean` | Marks the row with the `labels.current` badge and `aria-current`/`data-current`. |
| `label` | `string` | Session name (device, browser, client). |
| `details` | `string[]` | **Preformatted** lines (created, last seen, IP, user agent, expiry) — the library never parses or formats dates. |
| `icon` | `ReactNode` | Rendered beside the label (career passes a device glyph). |
| `badges` | `ReactNode` | Extra chips/status rendered after the current badge. |
| `revoked` | `boolean` | Already signed out: renders the library-owned `labels.revoked` badge (“Signed out” by default) and **no** revoke button. Wins over `revocable`. |
| `revocable` | `boolean` (default `true`) | `false` hides the row's revoke button while keeping the row visible (e.g. a policy-managed session). Ignored on a `revoked` row. |

## controlled contract

Data in, events out. The component renders `rows` as given — no fetching, no
store, no session policy, no “current” inference, no sorting, no summary or
confirmation. `busyId` is host state: set it while the revoke request is in
flight and clear it when it settles. The revoke button only calls
`onRevoke(id)`; confirmation dialogs, notices and “sign out everywhere”
flows stay app-side.

Row flags are presentation only: the app decides which sessions are already
signed out (`revoked`, typically a recently-revoked row it keeps in the list
for a while) and which cannot be revoked (`revocable: false`, e.g. a policy
or the current session when the app blocks self-sign-out). The library only
paints the badge and withholds the button; it never infers either from
`current` and never calls `onRevoke` for those rows.

## labels & i18n

Every string is prop-injected (`labels.current`, `labels.revoke`,
`labels.revoking`, optional `labels.revoked` and `labels.empty`). Apps
translate at the call site (career, study and health use i18next).

## examples

minimal:

```tsx
<AccountSessionList
  rows={sessions.map((s) => ({
    id: s.id,
    current: s.id === currentSessionId,
    label: s.clientName,
    details: [t('sessions.created', { date: s.createdAtLabel }), s.lastSeenLabel],
  }))}
  onRevoke={revokeSession}
  busyId={revokingId}
  labels={{
    current: t('sessions.current'),
    revoke: t('sessions.revoke'),
    revoking: t('sessions.revoking'),
  }}
/>
```

realistic (device icon, badge, header action, empty copy):

```tsx
<AccountSessionList
  rows={sessions.map((s) => ({
    id: s.id,
    current: s.current,
    label: s.label,
    details: [s.createdLabel, s.lastSeenLabel, s.ip],
    icon: s.kind === 'mobile' ? <Smartphone aria-hidden /> : <Laptop aria-hidden />,
    badges: s.mfa ? <Badge>2FA</Badge> : null,
  }))}
  onRevoke={confirmRevoke}
  busyId={pendingId}
  labels={{
    current: t('sessions.thisDevice'),
    revoke: t('sessions.revoke'),
    revoking: t('sessions.revoking'),
    empty: t('sessions.empty'),
  }}
  headerAction={
    <Button variant="outline" size="sm" onClick={confirmRevokeOthers}>
      {t('sessions.signOutOthers')}
    </Button>
  }
/>
```

revoked and non-revocable rows (app keeps a just-signed-out row in the list and
locks a policy-managed one):

```tsx
<AccountSessionList
  rows={sessions.map((s) => ({
    id: s.id,
    current: s.current,
    label: s.label,
    details: [s.createdLabel, s.lastSeenLabel],
    revoked: s.revokedAt != null,
    revocable: s.revocable,
  }))}
  onRevoke={confirmRevoke}
  busyId={pendingId}
  labels={{
    current: t('sessions.thisDevice'),
    revoke: t('sessions.revoke'),
    revoking: t('sessions.revoking'),
    revoked: t('sessions.signedOut'),
  }}
/>
```

## accessibility

`<ul>`/`<li>` rows, `aria-current="true"` on the current session, and real
`<button>` revoke controls (native Enter/Space). Every per-row action includes
its row label in the accessible name — `labels.revoke` (or `labels.revoking`
while busy) plus ` — ` and `row.label`, e.g. *Revoke — Pixel 9* — so the
buttons stay distinguishable in a screen reader's button list while the
visible text remains the short label. The busy row is `disabled` and
`aria-busy`, so it drops out of the tab order until the request settles while
sibling rows keep working; where focus lands afterwards is app-owned (return
it to a stable target such as the section heading once the in-flight row is no
longer focusable).

A `revoked` row renders the signed-out badge as text next to its label and no
button at all, so the state is announced as content rather than as a disabled
action; a `revocable: false` row likewise renders no button, which removes it
from both the button list and the tab order without hiding the session. The
two flags never produce an enabled action for a signed-out session: `revoked`
wins over `revocable`. A current row can be revoked as well and then shows
both badges with `aria-current` still set.

`data-as="account-session-list"`, `data-as="account-session-row"`
(+ `data-current`, `data-revoked`, `data-revocable="false"` when no action is
rendered), `data-as="account-session-current"`,
`data-as="account-session-revoked"` and `data-as="account-session-revoke"`
(+ `data-revoking`) are the styling hooks. The header slot is app markup and
keeps its own accessible names.

## adoption notes

Replace local session lists in place — health's account/session settings,
career's `SessionsCard` (device icon per row, summary outside) and study's
`SessionRow` — and delete the local markup in the same commit. Keep the
app-side summary/notice (career's success/error line, health's revoke-others
confirmation) and the app's own date formatting.

## related

[`admin-user-table`](./admin-user-table.md) (per-row account actions),
[`chat-session-list`](./chat-session-list.md) (conversation list — different
domain, no shared state), [`copy-button`](./copy-button.md).
