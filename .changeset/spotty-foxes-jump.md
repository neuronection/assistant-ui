---
'@neuronection/assistant-ui': minor
---

**Transcript context (plan 101 P3):** orientation anchors inside long conversations.

- **Date separators:** `showDateSeparators` on `ChatTranscript` renders Today/Yesterday/date chips between day groups, read from `ChatMessageView.createdAt` (rows without one join the previous group). `formatDate` overrides the older-day format (default `MMM d, yyyy`); new labels `today` / `yesterday`.
- **Message anchoring:** `focusMessageId` scrolls the row into view and flashes it whenever it changes — wire branch-tree node clicks, citation links or deep links to it. Rows carry `data-message-id`.
- **Floating stop:** `onStop` on `ChatTranscript` renders a stop pill beside the jump pill while a live turn streams and the user has scrolled away (labelled, keyboard-reachable, `labels.stop`).

All opt-in; no behavior change for existing consumers.
