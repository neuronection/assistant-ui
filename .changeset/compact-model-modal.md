---
'@neuronection/assistant-ui': minor
---

ModelRegistry: compact add/edit modal — the provider context banner and the
change-kind box merge into one quiet context line (provider name, kind chip,
change-kind link; base URL moves to the name's `title`), and the tuning
fields (reasoning effort, temperature, max tokens) move under a collapsed
`<details>` disclosure with the new `advancedLabel` prop (default
`'Advanced'`). Common fields — model picker and label — now lead the form.
