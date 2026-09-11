---
'@neuronection/assistant-ui': patch
---

`ChatToolCard` and `ChatTraceTimeline` detail blocks render JSON
arguments/results **pretty-printed** (2-space indent across lines) instead of
raw single-line strings — JSON cards are serialized objects, arrays and other
text pass through unchanged (new `prettyJson` util). Chat-trace tool rows keep
the key/value layout for JSON objects; JSON-array responses render as an
indented mono block.
