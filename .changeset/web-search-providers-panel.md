---
'@neuronection/assistant-ui': minor
---

`WebSearchProvidersPanel` — the family web-search settings surface
(ADR-0035 / plan 28): a controlled, presentational ordered multi-provider
list (enable, reorder, probe-test, edit, delete) with a catalog-driven
add/edit form. Data contracts mirror the family `providers[]` shape and
the vendored `search-providers.json` catalog; persistence, key sealing and
probe calls stay app-side. Study-assistant is the first consumer (its
local panel is deleted same-commit on adoption); desktop and career follow
in plan 28 Phases 3–4.
