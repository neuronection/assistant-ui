---
'@neuronection/assistant-ui': patch
---

`ConnectionTestRow` wraps long error messages (`whitespace-pre-wrap` +
`break-words` instead of a single clipped line) so full provider API errors —
e.g. OpenAI's multi-line 400 payloads — stay readable in app cards.
