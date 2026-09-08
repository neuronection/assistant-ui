---
'@neuronection/assistant-ui': minor
---

ChatTraceTimeline: full tool-call observability. `ChatTraceTimelineEntry`
gains optional `status` (`'ok' | 'error'` — renders a status dot after
the duration), `args` and `response` (pretty-printed strings) — `tool`
rows with `args`/`response` render a labelled, expandable detail region
(`Arguments` / `Response` blocks, `chat-trace-detail-toggle` button +
`chat-trace-detail` region, accessible name `"<tool> details"`). Labels
gain `arguments`, `response`, `details`. All fields optional — existing
usage renders unchanged.
