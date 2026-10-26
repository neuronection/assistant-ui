---
'@neuronection/assistant-ui': minor
---

AddIntegrationSourceDialog: additive `kind` mode ('chooser' shows two
source-kind cards first — the Add-provider tile pattern — 'git'/'local'
pin one kind's fields; choosing local prefills branch/main) and `initial`
for edit-flow prefill. IntegrationSourcesList: additive `onEditSource`
affordance (+ `editSourceLabel`/`editSourceAriaLabel`). Back-compat:
props omitted = the previous behavior everywhere.
