---
'@neuronection/assistant-ui': minor
---

ChatComposer: the input row now exposes styling hooks —
`data-as="chat-composer-row"` plus a `data-multiline` attribute that is
present whenever the auto-growing textarea renders more than one line
(measured in the same layout pass as the auto-grow height). Layout stays
unchanged by default; apps opt in via the hook (first consumer:
desktop-assistant wraps the toolbars into a footer row under the
full-width textarea once a draft is multiline).
