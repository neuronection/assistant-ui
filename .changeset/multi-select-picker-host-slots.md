---
'@neuronection/assistant-ui': minor
---

`multi-select-picker` host slots (additive) — the browse/selection chrome
hosts need now rides props instead of forks: `MultiSelectPicker` gains
`renderChipExtra` (per-chip leading content, e.g. a relation select),
`showChips` (host renders selections itself) and `browseModalProps`
(forwards the modal's props/slots to the internal `PickerBrowseModal`);
`PickerBrowseModal` gains controlled `category`/`onCategoryChange`,
`filterOption` (host row predicate that leaves pagination alone),
`renderRowContent` (rich row text with the live `{ search, category }` ctx;
the named Add/Added toggle stays), `reloadKey` (re-runs the current search
when a host-side server filter changes), `hasMore` (host-declared
pagination state for the *Load more* button) and `renderBody` (body composition via `PickerBrowseBodyCtx` — default
filter/search/category/list nodes plus `isSelected`/`toggle` so alternate
surfaces like a graph feed the same controlled selection).
