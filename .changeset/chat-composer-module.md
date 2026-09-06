---
'@neuronection/assistant-ui': minor
---

chat-composer (plan 11 L4): `ChatComposer` — the family chat input.
Auto-growing IME-safe textarea (Enter sends, Shift+Enter newlines,
composition never submits — a correctness gap in all three apps today),
send/stop swap while a turn is in flight, toolbar slots for app
attach/equation/dictation controls, attachment rail and suggestion strip
slots, and drag-drop + paste file wiring behind `onAttachFiles`.
