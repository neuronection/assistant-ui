---
'@neuronection/assistant-ui': minor
---

New tier-2 "transport-injected hooks" modules: `dictation` (`useDictation` state machine + `DictationButton` + `DictationStrip` — the app injects `transcribe(blob)`, the library owns recording/timer/level/cancel UI) and `ai-text-transform` (`useAiTextTransform` — streaming transform state machine with delta coalescing, poll fallback, hard timeout and terminal-event guard; the app injects start/subscribe/cancel/poll closures). No fetching inside the library — ADR-006 holds.
