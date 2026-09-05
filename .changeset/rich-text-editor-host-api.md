---
'@neuronection/assistant-ui': minor
---

RichTextEditor becomes hostable by full apps: `extensions` is now a **full
override** of the built-in `[StarterKit, Markdown]` set (apps declare their
complete extension set), and three composition props land — `contentClassName`
(merged onto the editable region), `onReady` (editor instance on create,
`null` on destroy — the app handle for commands and event wiring), and
`headingLevels` (one toggle per level; `labels.heading` is now
`(level) => string`, default `Heading ${level}`). History buttons now reflect
undo/redo availability and disable while there is nothing to undo/redo.
