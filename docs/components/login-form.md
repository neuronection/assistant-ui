# LoginForm

Family-standard sign-in form (identity-auth §12): labelled email +
password fields with a visibility toggle, submit button, mapped error
slot and optional register/forgot links. Presentational + controlled
(ADR-006): submission is an event out — no fetching, no stores, no
session handling. Pair it with [`RegisterForm`](./register-form.md) for
the two-mode login surfaces apps wrap in their own card/overlay shell.

## import

```ts
import { LoginForm } from '@neuronection/assistant-ui/login-form'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `onSubmit` | `(email: string, password: string) => void \| Promise<unknown>` | — | receives the trimmed email and the password as typed; while the returned promise is pending the form is disabled |
| `loading` | `boolean` | `false` | app-controlled busy state (e.g. a store's `loading`); disables fields + submit |
| `error` | `string \| null` | `null` | app-mapped API error, rendered as `role="alert"` |
| `fields` | `Partial<LoginFormFields>` | English defaults | per-field `{ label?, placeholder? }` overrides for `email` and `password` |
| `labels` | `Partial<LoginFormLabels>` | English defaults | `submit`, `showPassword`, `hidePassword`, `register`, `forgot` |
| `icons` | `LoginFormIcons` | lucide `Eye`/`EyeOff` | `showPassword`, `hidePassword` |
| `registerHref` | `string` | — | renders the register link as an `<a href>`; `onRegister` (if given) fires on click |
| `onRegister` | `() => void` | — | renders the register link as a `<button type="button">` — the usual SPA mode toggle; omit both to hide the link |
| `forgotHref` | `string` | — | optional forgot-password link (anchor only) |
| `minPasswordLength` | `number` | `10` | HTML5 `minLength` on the password field (family register policy) |
| `className` | `string` | — | on the `<form data-as="login-form">` |

## controlled contract

The component owns only its input drafts and the visibility toggle;
both reset when the app unmounts/remounts it (the usual mode swap).
Everything session-shaped is the app's: `onSubmit` fires the API call,
the app maps failures to `error` and busy state to `loading` (the
pending promise keeps the form disabled even without `loading`).
Field values are never cleared by the component — successful sign-in
means the app tears the surface down.

## remember-me is deliberately absent

Sessions are **server-owned**: cookies are `HttpOnly` (identity-auth
§10/§12), so the client cannot read or scope them, and session
lifetime is a server/`auth-kit` decision — not a checkbox in the DOM.
A "remember me" toggle would be UI theatre over a cookie the page
can't touch. Apps that want lifetimes expose them server-side.

## validation

HTML5 only, no duplicated JS: `type="email"` + `required` on email,
`required` + `minLength={minPasswordLength}` on the password (both
family apps register with ≥10-char passwords). Server errors surface
through `error` — the app maps them (e.g. 401 detail → friendly text).

## labels & i18n

All strings pass in through `fields`/`labels` with English defaults;
apps translate at call sites (career, study, health use i18next).

## examples

minimal:

```tsx
const [error, setError] = useState<string | null>(null)

<LoginForm
  error={error}
  onSubmit={async (email, password) => {
    const ok = await login(email, password)
    if (!ok) setError(t('auth.loginError'))
  }}
/>
```

two-mode login surface (study/career pattern — app owns the shell and
the mode switch, the library owns the form):

```tsx
<div className="card">
  <h1>{mode === 'login' ? t('auth.signInTitle') : t('auth.registerTitle')}</h1>
  {mode === 'login' ? (
    <LoginForm
      error={error}
      loading={busy}
      labels={{ submit: t('auth.signIn'), register: t('auth.switchToRegister') }}
      fields={{ email: { label: t('auth.emailLabel') }, password: { label: t('auth.passwordLabel') } }}
      onSubmit={(email, password) => submit('login', email, password)}
      onRegister={() => setMode('register')}
    />
  ) : (
    <RegisterForm
      error={error}
      loading={busy}
      labels={{ login: t('auth.switchToLogin') }}
      onSubmit={(email, password) => submit('register', email, password)}
      onLogin={() => setMode('login')}
    />
  )}
</div>
```

instances with registration disabled (career P3c): pass no
`onRegister`/`registerHref` — the link simply doesn't render, and the
app shows its own explainer next to the form.

## accessibility

See [accessibility.md](../accessibility.md#inputs): labelled fields
(`label htmlFor` wiring comes from `Input`), the visibility toggle is
an icon-only button named via `labels.showPassword`/`hidePassword`
with `aria-pressed`; errors announce through `role="alert"`. Keyboard
contract asserted in tests: Tab runs email → password → toggle →
submit → links; Enter submits from any field (native form semantics);
`loading` disables every control.

## related

[`RegisterForm`](./register-form.md) for the sibling flow,
[`Input`](./input.md) and [`Button`](./button.md) for the primitives,
[`UserMenu`](./user-menu.md) for the signed-in identity surface.
