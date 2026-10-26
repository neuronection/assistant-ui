---
'@neuronection/assistant-ui': minor
---

AddIntegrationSourceDialog: additive `kind` mode ('chooser' shows two
source-kind cards first — the Add-provider tile pattern — 'git'/'local'
pin one kind's fields; choosing local prefills branch/main) and `initial`
for edit-flow prefill. IntegrationSourcesList: additive `onEditSource`
affordance (+ `editSourceLabel`/`editSourceAriaLabel`). Back-compat:
props omitted = the previous behavior everywhere.

Also: one uniform popup rhythm across the dialog family — content
regions `px-6 pb-6` with `space-y-4` blocks / `space-y-3` fields,
meta grids `gap-x-6 gap-y-3`, inset blocks `p-3`, and the consent
disclosure padded (`py-1 pl-3 pr-2`). ConsentDialog and
ActionResultDialog no longer add ad-hoc `gap-3` (the section rhythm
owns spacing), FormModal's body matches the ModalBody standard, and
consent titles no longer duplicate the extension id.
