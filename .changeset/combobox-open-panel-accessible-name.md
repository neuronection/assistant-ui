---
'@neuronection/assistant-ui': patch
---

Combobox: the portaled open panel now carries an accessible name (`aria-label` derived from the trigger's label/placeholder, overridable per call site via the existing label props). The open-state axe tests previously scanned `container` while Radix portals the panel to `document.body`, so the open picker was never actually asserted — and hid exactly this `aria-dialog-name` violation. Tests now scan `document.body` (the page-level `region` rule disabled for component-level scans, with rationale in the test).

Also documents the ADR-0024 additions the same-commit rule missed: the three country-picker label props on `ProviderForm` (`countrySearchPlaceholder`, `countryEmptyLabel`, `countryClearLabel`) and the `countries` / `languages` data subpaths in the utilities guide.
