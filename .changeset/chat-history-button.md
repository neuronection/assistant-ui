---
'@neuronection/assistant-ui': minor
---

New `chat-history-button` module: `ChatHistoryButton` — a labelled
history popover for chat headers (career's `HistoryButton` + study's
ChatPanel history popover, generalized). Owns the panel sizing, an
`onOpen` refresh hook and the close-on-pick wiring via a `close`
render-prop; the session list itself stays app-side
`ChatSessionList` glue.
