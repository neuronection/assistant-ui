---
'@neuronection/assistant-ui': minor
---

New `@neuronection/assistant-ui/flow-trace` subpath: `FlowTraceCard` renders a
run ledger over the library-owned `FlowTrace` schema — outcome badge + simulated
badge for mock-provider rows, the stage timeline, a per-call LLM ledger table
(task, stage, provider+model, tokens in/out, latency, prompt version, status)
and the applied/rejected ops list — while `FlowTelemetryStrip` renders the
compact `calls · tokens in/out · edits` live telemetry counters for the polling
progress card. Purely presentational (ADR-006): apps map their run data onto
the schema.
