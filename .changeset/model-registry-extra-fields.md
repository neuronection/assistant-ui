---
'@neuronection/assistant-ui': minor
---

`ModelRegistry` gains an app-supplied extra-field slot and a per-row enable
toggle. `extraFields` (`{ key, label, placeholder?, multiline? }[]`) renders
app-declared fields inside the add/edit modal — e.g. health-assistant's model
description — with the string values carried verbatim on
`Model.extra`/`Draft.extra`/`Patch.extra` (included in a patch only when the
user touched a field or the model already carried non-empty values).
`onToggleEnabled(model, enabled)` renders a native per-row checkbox
(`Enabled — <id>` accessible name, hidden for read-only providers) so apps can
persist the model's enabled flag from the row itself. Note: the visual
baseline for `model-registry--model-registry-story` needs a CI rebaseline.
