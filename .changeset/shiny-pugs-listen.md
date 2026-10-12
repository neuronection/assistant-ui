---
'@neuronection/assistant-ui': minor
---

**Composer intelligence (plan 101 P1):** `ChatComposer` gains the three interaction features modern chat inputs have.

- **Slash commands / @-mentions:** new `commands` prop — `{ trigger? ('/' default), items, maxItems?, onSelect }`. The palette opens while the caret touches a trigger-started word (caret-aware, works mid-sentence), fuzzy-filters via `searchScore`, and is fully keyboard-driven: ArrowUp/Down move, Enter/Tab select — never submitting while open — Escape dismisses. `onSelect(id, token)` receives the draft span (`start/end/query`) so the app performs the insertion. A11y: `role="listbox"`/`option` + `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant` on the textarea.
- **Escape to stop:** pressing Escape while a turn is in flight now fires `onStop` (after the palette-dismiss Escape, when both apply).
- **Prompt recall:** new `history` prop — ArrowUp on an empty draft recalls the last sent prompt, ArrowUp/Down walk the stack, editing a recalled draft exits it.

New `labels.commands` (listbox name, default "Commands"). Existing behavior (IME guard, canSubmit, drag-drop, multiline hysteresis) unchanged — all 24 composer tests green incl. the new palette/history/keyboard cases.
