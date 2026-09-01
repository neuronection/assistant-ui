---
'@neuronection/assistant-ui': patch
---

`ProviderForm` gains `hideBaseUrl` for provider types with a fixed endpoint (Google, Anthropic) — the base URL field is omitted instead of rendering an inert input.
