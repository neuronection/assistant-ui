---
'@neuronection/assistant-ui': minor
---

ProviderForm gains a controlled preset-catalog select (`presets`,
`presetKey`, `onPresetChange`, `presetLabel`, `customPresetLabel` +
`ProviderPresetOption` and `CUSTOM_PRESET_KEY` exports) so both family apps
render the same provider catalog picker; the catalog data itself stays
app-side (ADR-006). New `@neuronection/assistant-ui/countries` subpath
exports the shared ISO country list (`COUNTRIES`, `CountryOption`,
`getCountryFlag`) for data-residency pickers.
