---
'@neuronection/assistant-ui': minor
---

`TaskAssignmentPicker` row polish: every task tile falls back to a default `Cpu` icon, the duplicated "Model: provider / model" status line is removed (the row pickers show the selection themselves), the pickers no longer carry an internal clear button (the row-level X is the single remove affordance, vertically centered), accessible names are now just the task label, and `unassignedLabel`/`modelLabel` props are gone. New `@neuronection/assistant-ui/fuzzy` subpath exports `beautifyId` (display-name beautifier) alongside `fuzzyScore`/`searchScore`.
