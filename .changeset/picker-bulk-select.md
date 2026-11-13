---
"@neuronection/assistant-ui": minor
---

`multi-select-picker`: bulk select, built once and shared.

- **`PickerBulkSelect`** (new export) — the tri-state `role="checkbox"` bulk
  control (`aria-checked="mixed"` when only part of the scope is picked,
  `count={0}` renders nothing, `label`/`clearLabel`/`pickedCount`/
  `onToggle` in, one event out). Hosts whose own body already *is* the
  browser (a card gallery, a graph, a table) place it directly instead of
  re-implementing select-all.
- **`PickerBrowseModal` `selectAll`** (opt-in, forwardable through
  `MultiSelectPicker`'s `browseModalProps`) renders that control above the
  list: one click selects every option matching the active
  search/category/host filter, and the second click removes exactly those,
  leaving the rest of the selection untouched.
- New labels `selectAllLabel` (rendered as `Select all (N)`) and
  `clearSelectionLabel`; `PickerBrowseBodyCtx` gains `selectAll` (node),
  `matching` (the filtered, unpaginated set) and `toggleAll`.

Off by default, so existing pickers are unchanged.
