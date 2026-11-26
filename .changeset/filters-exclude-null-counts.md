---
'@neuronection/assistant-ui': minor
---

Extend the filters module with exclude, the null bucket and honest counts.

Three shapes change: `FilterValue.multi` becomes `{ include: (string | null)[], exclude: (string | null)[] }` (was `{ values: string[] }`), `FilterValue.single.value` widens from `string` to `string | null`, and `FilterOption.value` widens from `string` to `string | null` so the “not recorded” bucket is a real `null` instead of an invented sentinel string.

`FacetChip` option rows are tri-state — include, exclude, clear — reachable by keyboard (Enter include, Shift+Enter exclude, Delete clear, Shift+F10 opens the row menu) and by touch (per-row menu). Both applied states use `role="checkbox"` with `aria-checked="true"`, the excluded state suffixes the accessible name with `(excluded)`, and counts stay in the name (`≥N` via `FilterOption.countAtLeast`, `0` visible and still selectable, `none match now` on a zero count). `FilterFacet.allowExclude` turns the tri-state off. Active pills are derived from include, exclude and the options, so a selected value that is absent from an empty option list still renders a removable pill with no fabricated count, and removal moves focus to the next pill, or to the facet trigger (popover) / first option (inline) after the last. `FacetChipLabels` gains `excluded`, `noneMatch`, `notRecorded`, `remove` (renamed from `removeNamed`), `include`, `exclude`, `clear` and `optionMenu`; `onToggleOption` now reports the tri-state action instead of a boolean.

No app imports the filters module yet.
