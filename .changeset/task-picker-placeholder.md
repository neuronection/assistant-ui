---
'@neuronection/assistant-ui': minor
---

`TaskAssignmentPicker`: new optional `placeholder` — the trigger text for
unassigned rows (e.g. "Inherits from Default decision model"). Lets apps
express what *empty* means without adding an explicit inherit option to
the model list: nothing selected = inherit, selecting = a real model.
No behavior change when unset (generic "Select a model…" placeholder).
