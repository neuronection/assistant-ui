---
'@neuronection/assistant-ui': minor
---

New `multi-select-picker` module — the "two discovery paths" picker
promoted from career-assistant's `SkillPicker` and health-assistant's
`CatalogItemPicker`, made generic and data-agnostic (no fetching inside):
`MultiSelectPicker` (inline debounced type-ahead + in-input browse button,
selection chips, single/multi modes, full combobox ARIA + keyboard nav)
and `PickerBrowseModal` (standalone browse half on `PanelModal`: search,
optional category filter, per-row Add/Added toggles, Load more
pagination, live selected count). Data flows in through either a plain
`options` list (client filtering) or `onSearch`/`onLoadMore` callbacks
(server search); every string is overridable through `labels`.
