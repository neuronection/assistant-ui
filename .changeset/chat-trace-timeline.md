---
'@neuronection/assistant-ui': minor
---

New `chat-trace-timeline` module: `ChatTraceTimeline` — a collapsible
per-turn trace attached to assistant replies (study's `TraceTimeline`,
generalized). Collapsed: total duration · tool count · model. Expanded:
duration-proportional bars for flow phases and tool calls, total/token
row, and a raw-reasoning disclosure. Pure presentational — trace data
is mapped to `entries` app-side (study adopts it directly; career feeds
it from persisted `metadata_json`).
