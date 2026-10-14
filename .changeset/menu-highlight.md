---
'@neuronection/assistant-ui': patch
---

`MenuItem` now styles Radix's `data-highlighted` state (the highlight tint
previously keyed on `:focus` alone, which pointer hover does not reliably
produce in every embed — menu rows could hover with no visible change).
Keyboard navigation keeps the same tint. No API changes.
