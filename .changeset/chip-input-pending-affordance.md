---
'@neuronection/assistant-ui': minor
---

ChipInput: the typed draft now renders as a dashed pending chip
(`data-pending` on the container while a draft exists) so it is visually
explicit that each entry is its own separate item, and a new `hint` prop
renders helper text below the field wired to the input via
`aria-describedby` — use it to spell out the "press Enter or Add after each
one" contract.
