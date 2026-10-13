---
'@neuronection/assistant-ui': minor
---

**ProviderSetupTiles: per-tile capability chips (plan 26 §13.3 follow-up).** Preset entries gain an additive optional `chips?: { key: string; label: string }[]` (`ProviderSetupTileChip`), rendered with the existing `CapabilityChips` badge pattern — neutral styling, i18n labels prop-injected per the family rule (the app derives chips from its preset data: wire type → chat/vision/stt, `decision_models` → decision, keyless-local → local). Frozen props untouched; chips carry text (part of the tile's accessible name) and never rank tiles. Story, docs page, a11y row and README updated in the same change — visual baselines need the CI rebaseline flow for the `ai-settings-setup-tiles-story`.
