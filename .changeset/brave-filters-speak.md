---
'@neuronection/assistant-ui': minor
---

Add the `filters` module: `FilterBar` + `FacetChip` render faceted filtering
from a view model (`FilterFacet`/`FilterOption`/`FilterValue`) while the host
keeps the state and resolves options. Toggle, single and multi facets, popover
options with counts, a search box above a configurable threshold, removable
active-value pills, folded “More” facets, clear-all and a host-formatted
summary. `FacetChip` has a `popover` (default) and an `inline` pill-row variant
for compact strips, `FilterPills` is the standalone removable row, and both
take `testId`/`optionTestId`/`itemTestId` hooks. Every label is a prop with an
English default; counts are formattable (`formatCount`).
