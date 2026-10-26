---
'@neuronection/assistant-ui': minor
---

New `translation-providers` module — the translation-provider settings
surface in the AI-providers pattern, composed from the family
primitives: `TranslationProvidersPanel` (composed drop-in),
`TranslationProvidersList` (ProviderCards with the management actions —
enable/disable, reorder, test with the translated sample on the ok line,
edit, delete — in the `⋯` menu), `TranslationProviderWizard` (SetupSteps
progress + engine tiles + catalog-driven settings form, `defaultName`/
`initialType`/`extraFields`/`error` supported), `TranslationEngineTiles`
and `TranslationProviderSettingsForm` (key link, write-only key with
stored-key note on edit, `optionalKey` for public/self-hosted engines,
base URL on the main page only when the catalog requires it, Advanced
disclosure for name, endpoint override and tuning fields). Fully
catalog-driven and controlled — persistence, keys and test calls are
app-side. Story, module docs and tests included.
