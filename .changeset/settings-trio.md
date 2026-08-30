---
'@neuronection/assistant-ui': minor
---

Phase-4 settings-trio blocks (part 1): `SettingsShell` (controlled two-pane
nav — router/store stay app-side), `ProviderForm` (name/base URL plus a
**write-only** masked API-key field; keyring stays app-side, ADR-006) and
`ConnectionTestRow` (idle/testing/ok/fail + latency presentation; the ping is
app-side). `Input`'s `label`/`hint` now accept ReactNode.
