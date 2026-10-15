---
'@neuronection/assistant-ui': minor
---

ProviderSetupForm: render the selected provider's mark (ProviderLogo) beside the
name. The form is the second phase of the guided setup — tiles already show
each provider's logo, and the form now carries the selection's icon forward via
the new optional `preset.key` field (omitted = no mark, e.g. manual entries).
