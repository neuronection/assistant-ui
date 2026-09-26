# AuthGate

Session gate around the app (identity-auth §4): owns the
`checking → authenticated | anonymous` boot machine and the rendering for
each state, while the app owns everything endpoint-shaped. Presentational +
controlled (ADR-006): the boot flow comes in as a function, the login and
splash surfaces come in as nodes, transitions go out as an event — no
fetching, stores, or routing of its own. Pair it with
[`LoginForm`](./login-form.md) / [`RegisterForm`](./register-form.md)
composed inside the app's own branding shell.

## import

```ts
import { AuthGate } from '@neuronection/assistant-ui/auth-gate'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `boot` | `() => Promise<boolean>` | — | the app's boot flow (§4/§11): resolves `true` once a session was established, `false` when the gate must land on `login`; a rejected promise counts as `false`. Runs on mount and whenever `resetKey` changes |
| `children` | `ReactNode` | — | the authenticated app; rendered only after `boot` resolved `true` |
| `login` | `ReactNode` | — | the login surface, rendered while anonymous — app-composed from the shared `LoginForm`/`RegisterForm` inside the app's branding shell |
| `checking` | `ReactNode` | token splash | splash node for the checking state; the default is a `role="status"` splash centring `labels.checking` |
| `labels` | `Partial<AuthGateLabels>` | English defaults | `checking` — splash text |
| `resetKey` | `string \| number` | — | changing it re-runs the machine from `checking`: the recovery path for mid-session 401s and for post-login / forced-drop transitions the app decides |
| `onStatusChange` | `(status: AuthGateStatus) => void` | — | event out; fires after every machine transition (incl. the first) |
| `className` | `string` | — | on the `<div data-as="auth-gate">` wrapper |

## controlled contract

The gate owns exactly one thing: the `checking → authenticated |
anonymous` machine and which node each state renders. Everything
session-shaped stays app-owned:

- `boot` is the machine's only input — the app's `bootSession`-style
  chain (live cookie → refresh-on-401 → desktop exchange, §4/§10/§11).
  The gate runs it on mount and on `resetKey` changes; it never listens
  to the network itself.
- `resetKey` is the machine's replay trigger. Bump it when the app's
  session verdict changes: the client's unauthenticated event after a
  failed refresh (mid-session 401 → re-run → anonymous), a successful
  sign-in from the `login` surface (→ re-run → authenticated), or a
  forced drop where the app already knows the session is gone (its
  `boot` can answer from that verdict without another round-trip).
- `onStatusChange` is the event out, e.g. to mirror the verdict into a
  store or clear workspace state.
- The gate never renders login on a desktop `open` instance by
  construction: the zero-UI exchange (§11) resolves `boot` to `true`
  before the machine leaves `checking`.

## labels & i18n

The checking label passes in through `labels` with an English default;
apps translate at the call sites (career, study, health use i18next).
The `login` and `checking` nodes are app-rendered, so everything else
on those surfaces is the app's own i18n.

## examples

minimal:

```tsx
<AuthGate boot={bootSession} login={<LoginForm onSubmit={login} />}>
  <App />
</AuthGate>
```

realistic (app glue around the gate — endpoints, recovery event, and
the branded login surface stay local):

```tsx
function SessionGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [epoch, setEpoch] = useState(0)
  const recheck = useCallback(() => setEpoch((e) => e + 1), [])

  useEffect(() => {
    window.addEventListener(UNAUTHENTICATED_EVENT, recheck)
    return () => window.removeEventListener(UNAUTHENTICATED_EVENT, recheck)
  }, [recheck])

  return (
    <>
      <DemoBanner />
      <AuthGate
        boot={bootSession}
        resetKey={epoch}
        login={<LoginOverlay onSignedIn={recheck} />}
        checking={
          <div className="min-h-screen flex items-center justify-center">
            {t('auth.checking')}
          </div>
        }
      >
        {children}
      </AuthGate>
    </>
  )
}
```

mid-session 401s: the app's API client dispatches its unauthenticated
event after a failed refresh; the glue bumps `resetKey`, the gate
re-runs `boot`, and the machine lands anonymous (login surface) or
re-authenticated. A forced drop (device revoke, account deletion) can
skip the round-trip by answering the replayed `boot` from the app's own
session verdict — see career's `SessionGate`.

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): the default splash is
a `role="status"` live region with no focusable content while checking;
authenticated children are plain DOM (keyboard-reachable); the login
surface is the app's composition of the shared forms. Asserted in tests:
axe-clean in all three states, no focusables in the splash, child
focusables reachable once authenticated.

## related

[`LoginForm`](./login-form.md) and [`RegisterForm`](./register-form.md)
for the `login` node, [`ProfileSwitcher`](./profile-switcher.md) and
[`AdminUserTable`](./admin-user-table.md) for the identity surfaces
behind the gate.
