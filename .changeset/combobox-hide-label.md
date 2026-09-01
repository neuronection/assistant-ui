---
'@neuronection/assistant-ui': patch
---

`Combobox`/`ModelPicker` gain `hideLabel` — keeps the accessible name derived from `label` while suppressing the visible label element, for surfaces where the surrounding component already titles the row (e.g. `TaskAssignmentPicker` rows).
