---
'@neuronection/assistant-ui': minor
---

Add `AccountSessionList` — a presentational active-sessions list with a
current-session badge, per-row device icon and badge slots, preformatted
detail lines, a controlled busy row and a per-row revoke event; and
`SecretOnceBlock` — the shown-once secret body with a wrapping monospace
value, host warning copy and a real copy button with transient copied
feedback. Both are additive: no existing export changes, no fetching, date
parsing, i18n engine or secret storage.
