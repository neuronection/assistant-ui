---
'@neuronection/assistant-ui': patch
---

ChatMessage assistant bubbles use the `--as-muted` fill and drop the border
(the user bubble keeps the `--as-primary` fill). The white bordered
`--as-surface-raised` bubble read as a detached card against the family's
soft-surface look — study's original style-source design was a borderless
muted bubble, and that is now again what the family renders.
