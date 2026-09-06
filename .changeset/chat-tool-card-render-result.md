---
'@neuronection/assistant-ui': minor
---

`ChatToolCard` gains a `renderResult?: (result: string) => ReactNode`
slot (family plan 12 L2): apps can render per-tool result views (quiz
previews, state confirmations, domain links) in place of the default
serialized `<pre>` pane. The card is expandable when only the slot is
provided (tools with no serialized output); default behavior is
unchanged when the slot is absent.
