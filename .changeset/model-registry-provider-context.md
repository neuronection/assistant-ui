---
'@neuronection/assistant-ui': minor
---

**ModelRegistry: provider context, modern manual toggle, capability implications.** Three additive refinements to the add/edit modal. A discreet **provider context banner** (configured name + base URL, sr-only `providerContextLabel` prefix) sits at the top so the form always answers "model of *what*?". The **manual-id toggle** becomes a labelled ghost control with a pen icon, right-aligned, and swaps direction copy when manual entry is active (`useCatalogLabel`, default 'Pick from the catalog', with a library icon). New `capImplications` prop expresses **selection implications between combinable caps** — e.g. `{ vision: ['text'], tools: ['text'] }`: selecting a modifier auto-enables its text base, and deselecting the base drops everything that implies it (catalog picks normalize the same way). All optional; without them the form behaves exactly as before. Docs updated in the same change.
