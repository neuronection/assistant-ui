# RegisterForm

Family-standard registration form (identity-auth §12): labelled email +
password + confirm-password fields (mismatch error), an optional
full-name field behind `showFullName`, a min-length hint, submit button,
mapped error slot and an optional login link. Presentational +
controlled (ADR-006): the account-creation call is the app's.
Pair it with [`LoginForm`](./login-form.md) inside the app's card /
overlay shell.

## import

```ts
import { RegisterForm } from '@neuronection/assistant-ui/register-form'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `onSubmit` | `(email: string, password: string, fullName?: string) => void \| Promise<unknown>` | — | trimmed email and full name, password as typed; `fullName` is `undefined` unless `showFullName` (empty stays `''`); disables the form while the promise is pending |
| `loading` | `boolean` | `false` | app-controlled busy state; disables fields + submit |
| `error` | `string \| null` | `null` | app-mapped API error, rendered as `role="alert"` |
| `showFullName` | `boolean` | `false` | renders the optional (not required) full-name field with `autoComplete="name"` |
| `fields` | `Partial<RegisterFormFields>` | English defaults | per-field `{ label?, placeholder? }` overrides for `fullName`, `email`, `password`, `confirmPassword` |
| `labels` | `Partial<RegisterFormLabels>` | English defaults | `submit`, `showPassword`, `hidePassword`, `passwordHint` (`null` hides the hint), `mismatch`, `login` |
| `icons` | `RegisterFormIcons` | lucide `Eye`/`EyeOff` | `showPassword`, `hidePassword` |
| `loginHref` | `string` | — | renders the login link as an `<a href>`; `onLogin` (if given) fires on click |
| `onLogin` | `() => void` | — | renders the login link as a `<button type="button">` — the usual SPA mode toggle; omit both to hide the link |
| `minPasswordLength` | `number` | `10` | HTML5 `minLength` on password + confirm; the default hint text follows it |
| `className` | `string` | — | on the `<form data-as="register-form">` |

## controlled contract

The component owns its input drafts, both visibility toggles and the
confirm-mismatch flag (cleared by typing in either password field
after a failed attempt). Account creation, busy state and error
mapping are the app's via `onSubmit` / `loading` / `error`. Fields are
never cleared by the component — a successful registration tears the
surface down app-side.

## validation

HTML5 plus one client rule: `type="email"` + `required` on email,
`required` + `minLength={minPasswordLength}` on password **and**
confirm (`autoComplete="new-password"`), and the confirm field must
match — a mismatch blocks `onSubmit`, marks the field
`aria-invalid` and shows `labels.mismatch` as `role="alert"`.
Password requirements beyond length (classes, breach lists) are
server policy and surface through `error`.

## labels & i18n

All strings pass in through `fields`/`labels` with English defaults;
the hint default is `` `At least ${minPasswordLength} characters.` ``
and `labels.passwordHint: null` hides it. Apps translate at call
sites (career, study, health use i18next).

## examples

minimal:

```tsx
const [error, setError] = useState<string | null>(null)

<RegisterForm
  error={error}
  onSubmit={async (email, password) => {
    const outcome = await register(email, password)
    if (outcome === 'failed') setError(t('auth.registerError'))
  }}
  onLogin={() => setMode('login')}
/>
```

with the full-name field (career pattern):

```tsx
<RegisterForm
  showFullName
  error={error}
  loading={busy}
  labels={{
    submit: t('auth.register'),
    passwordHint: t('auth.passwordHint'),
    login: t('auth.haveAccount'),
  }}
  fields={{ fullName: { label: t('auth.fullName') } }}
  onSubmit={(email, password, fullName) => register(email, password, fullName)}
  onLogin={() => setMode('login')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): labelled fields,
both visibility toggles are icon-only buttons named via
`labels.showPassword`/`hidePassword` with `aria-pressed`; the
mismatch error announces through `role="alert"` with `aria-invalid` +
`aria-describedby` on the confirm field. Keyboard contract asserted in
tests: Tab runs full name (when shown) → email → password → toggle →
confirm → toggle → submit → link; Enter submits from any field;
`loading` disables every control.

## related

[`LoginForm`](./login-form.md) for the sibling flow,
[`Input`](./input.md) and [`Button`](./button.md) for the primitives.
