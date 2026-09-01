---
'@neuronection/assistant-ui': minor
---

`TaskAssignmentTask` gains `secondaryOnly` — renders ONLY the fallback picker
line for that row (Fallback badge + picker + info + clear, no primary line)
for tasks whose assignment itself is a fallback, e.g. an app's single global
default model; the value round-trips via `secondaryValue`/`onAssignSecondary`.
It implies `secondary`, so it works flat or inside a section without the
section-level flag.
