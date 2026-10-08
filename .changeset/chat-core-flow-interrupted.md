---
'@neuronection/assistant-ui': minor
---

**chat-core**: new terminal `flow_interrupted` stream event — `{ event: 'flow_interrupted'; reason?: 'user' | 'server'; partial?: boolean }` (plan 24 §2, additive). The server broadcasts it when a turn is cancelled so every consumer terminalizes — not just the one that issued the stop (a stop in one tab reaches the others). The reducer maps it to `status: 'interrupted'`, `stopped: true`, with `finishedAt` — the same terminality class as `flow_finished`/`flow_failed`, and distinct from the resumable HITL `interrupt` pause. `useChatStream` treats it as terminal (late events ignored, watchdog cleared, `reset()` re-arms).
