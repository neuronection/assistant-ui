---
'@neuronection/assistant-ui': patch
---

Fix the package-root re-exports for `SettingsShell`, `ProviderForm` and
`ConnectionTestRow` (missing from `index.d.ts` in 0.6.0 — the per-module
entry points `/settings-shell`, `/provider-form`, `/connection-test-row`
were unaffected).
