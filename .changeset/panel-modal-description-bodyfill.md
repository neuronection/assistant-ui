---
'@neuronection/assistant-ui': minor
---

`PanelModal` gains a `description` slot (rendered under the title and wired as
the dialog description, so screen readers announce it) and an opt-in `bodyFill`
that makes the body the fill region above the sticky footer, letting a child
flex column — a form with its own scrolling field area — own scrolling. Both are
additive; existing panels render unchanged apart from one wrapper element around
the title.
