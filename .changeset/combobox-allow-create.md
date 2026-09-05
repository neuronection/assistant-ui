---
'@neuronection/assistant-ui': minor
---

Combobox and ComboboxMulti gain `allowCreate` (+ optional `createLabel`):
when the search term matches no option, an `Add "term"` row is offered
(keyboard included) and picking it reports the raw trimmed term — for
free-text entry into taxonomy-backed pickers.
