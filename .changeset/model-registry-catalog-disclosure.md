---
'@neuronection/assistant-ui': minor
---

Model-registry family adopts the health-assistant settings design language, all on tokens: provider cards gain the chevron icon tile (primary-filled when expanded), tinted border + shadow on the open card, an entry fade, and an enabled/total count pill; `CapabilityDescriptor` gains `icon` and every chip/badge carries `data-as-cap` so apps can re-tint per capability; `TaskAssignmentTask` gains `icon` (leading tile). Behavior changes: the remote-catalog zone (search, capability filters, manual add, add-all, catalog rows) is collapsed behind a `browseLabel` trigger button (`aria-expanded`) instead of always visible, and the per-row enable checkbox is removed — apps filter the `models` prop themselves (disabled models re-enter via the catalog's normal add path). `enabledLabel` is gone; `tasks` is optional on `TaskAssignmentPicker`.
