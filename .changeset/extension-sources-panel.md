---
'@neuronection/assistant-ui': minor
---

ExtensionSourcesPanel: the family's extension-source surface (ADR-0040 D13+D22,
plan 32 Phase 3) — ordered git sources with their discovered candidates
(consent payloads rendered verbatim: capabilities, provenance, pinned digest,
the T3 perimeter disclosure), digest-pinned installs with origin-class chips
(imported never renders as official, D25), update-available/digest-drift
states, park/tombstone affordances, and a controlled add-from-git form.
Presentational like WebSearchProvidersPanel: data via props, mutations as
events, every label overridable; a `renderConsent` content slot keeps the
verbatim-disclosure law while allowing host copy around it.
