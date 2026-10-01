# InstanceModeControl

Controlled instance access-mode panel (identity-auth §4.5, extracted from
the family "turn on login" story): the current mode as a badge, the two
admin transitions — `open → authenticated` (the owner sets credentials in
the same call) and `authenticated → open` (current password plus an
explicit acknowledgement) — and the blocked states (server entrypoint,
other accounts existing) with label-driven reasons. Every change carries
an audit note. Presentational + controlled (ADR-06): the app fetches the
mode, persists the transition and re-supplies `mode`; nothing here talks
to a network, store or router.

## import

```ts
import { InstanceModeControl } from '@neuronection/assistant-ui/instance-mode-control'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `mode` | `'open' \| 'authenticated'` | The instance's current `auth_mode`. |
| `serverIdentity` | `boolean` | Server entrypoint — the `authenticated → open` transition is refused (default `false`). |
| `otherUserCount` | `number` | Other accounts besides the owner; above `0` the `authenticated → open` transition is refused (default `0`). |
| `minPasswordLength` | `number` | Gate for the enable-login form (default `10`). |
| `onSetAuthenticated` | `(password: string) => void \| Promise<unknown>` | `open → authenticated`; the password becomes the owner's credentials in the same call. |
| `onSetOpen` | `(password: string) => void \| Promise<unknown>` | `authenticated → open`; the current password confirms the flip. |
| `loading` | `boolean` | Busy state from the app (default `false`). |
| `error` | `string \| null` | Load-level error shown in an `ErrorBanner` (default `null`). |
| `labels` | `Partial<InstanceModeControlLabels>` | Every string, incl. `enableLoginNote(minLength)` / `passwordTooShort(minLength)` / `blockedUsers(count)` functions — see the i18n contract. |
| `icons` | `InstanceModeControlIcons` | `LucideIcon` overrides (`open`, `authenticated`, `enableLogin`, `disableLogin`, `audit`). |
| `className` | `string` | Merged onto the root (`cn(internal, className)`). |

Also exported: `describeInstanceModeError(error, labels)` — maps a
rejection (`{status, detail}` or `Error`) to a label-driven message
(403 → the detail or `errorForbidden`, everything else → the
detail/message or `errorGeneric`) — and the `InstanceAuthMode`,
`InstanceModeControlLabels` types.

## controlled contract

Fully controlled: the panel renders exactly the `mode` it is given and
never mutates it. Transitions call `onSetAuthenticated` / `onSetOpen`
(sync or async); on rejection the error is surfaced in-band and the draft
survives, on success the app re-fetches and passes the new `mode`. The
enable-login form stays disabled until the password clears
`minPasswordLength` and matches the confirmation; the disable-login form
requires the explicit acknowledgement checkbox and disables itself with a
reason while `serverIdentity` or `otherUserCount > 0`. The only internal
state is UI-local: the drafts, the acknowledgement, the busy marker and
transient error text. `forwardRef` lands on the root
`div[data-as="instance-mode-control"]`.

## i18n contract

All strings arrive through `labels` (defaults are English); apps bind
them to their translation layer. The three functional labels receive
their argument so apps can inflect freely:
`enableLoginNote(minLength)`, `passwordTooShort(minLength)`,
`blockedUsers(count)`.

## minimal

```tsx
<InstanceModeControl
  mode={instance.auth_mode}
  serverIdentity={instance.identity_mode === 'server'}
  otherUserCount={users.length - 1}
  onSetAuthenticated={(password) => updateInstanceMode('authenticated', password)}
  onSetOpen={(password) => updateInstanceMode('open', password)}
  labels={labels}
/>
```

## accessibility

See the [accessibility matrix](../accessibility.md#settings-blocks) row for
`InstanceModeControl` — native form controls throughout, the blocked
reasons are plain text next to the disabled submit, and the audit note is
always visible in the panel.

## related

- [`admin-user-table`](./admin-user-table.md) — the sibling admin surface
  (users tab).
- [`auth-gate`](./auth-gate.md) — the login wall shown on
  `authenticated` instances.
