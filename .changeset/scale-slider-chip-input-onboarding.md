---
'@neuronection/assistant-ui': minor
---

ScaleSlider: modern track + thumb (filled progress, larger thumb, visible
focus ring) via new `styles.css` range rules scoped to
`[data-as='scale-slider']`; low/high labels are larger and readable
(text-xs, medium weight, muted color) instead of 9px uppercase.

ChipInput: new `addLabel` prop renders an explicit add button that commits
the draft (disabled while empty, re-focuses the input) — makes the
multi-entry affordance discoverable without keyboard knowledge.
