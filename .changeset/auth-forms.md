---
'@neuronection/assistant-ui': minor
---

`login-form` + `register-form` gain `LoginForm` and `RegisterForm`, the family-standard auth surfaces (identity-auth §12, plan 16 U1): presentational + controlled forms with labelled email/password fields, password visibility toggles, loading/error props (apps map API errors), HTML5 + min-length validation, link slots for the SPA mode switch (`onRegister`/`registerHref`, `forgotHref`, `onLogin`/`loginHref` — omitting them hides the action, covering career's registration-disabled P3c), plus confirm-password mismatch and an optional full-name field on `RegisterForm`. No remember-me: HttpOnly cookies make session lifetime server-owned. Strings and icons pass in as props with English defaults, tokens only. First consumers are study's `LoginOverlay` and career's `LoginScreen` (plan 16 Phase 5 closeout, same-commit deletes of their local form markup).
