---
'@neuronection/assistant-ui': patch
---

`ChatToolCard` and `ChatTraceTimeline` detail blocks render JSON
arguments/results as a **parsed, structured pane** instead of raw JSON text —
new shared `DetailValue`: objects render as `key: value` rows, arrays as value
chips, non-JSON payloads stay preformatted text. Also widens the trace-timeline
row label column (`w-16` → `w-24`) so tool names are not cropped, with the
detail region indent following the bar alignment.
