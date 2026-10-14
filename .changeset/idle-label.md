---
'@neuronection/assistant-ui': minor
---

`ConnectionTestRow` / `ProviderCard`: new optional `idleLabel` ("Not
tested") — the never-tested state previously rendered no status text at
all, which forced apps to keep a static label just to hold the line.
No behavior change when the prop is unset.
