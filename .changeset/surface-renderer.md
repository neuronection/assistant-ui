---
'@neuronection/assistant-ui': minor
---

SurfaceRenderer: the family declarative-surface renderer (ADR-0040 clause 16,
plan 32 Phase 4) — renders the charter's closed component vocabulary
(stat, table, cards, filter-bar, select, badge, progress, actions, evidence)
from a schema + view with RESOLVED labels; controlled facet
facets (aria-pressed chip rows and selects driving a single
`onFilterChange` funnel) and typed `run:*` / `item:*` action ids out via
`onAction` (the host binds semantics). Evidence rows carry host-resolved
summaries in an evidence disclosure; unknown node/action ids never render;
raw markup from an extension never mounts (D17). Promoted from desktop's
PackReportRenderer — career + desktop are the two hosts, pinned by the
family fixture wall (`dev/contracts/surface-renderer.fixtures.json`).
Also adds the previously missing subpath export entry for
`extension-sources` (the panel's module was staged without it).
