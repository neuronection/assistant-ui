---
'@neuronection/assistant-ui': minor
---

web-search-providers: provider type tiles carry an optional hosting chip
(catalog `hosting: 'cloud' | 'self-hosted'`, labels via
`cloudChipLabel`/`selfHostedChipLabel`, unknown values render nothing)
and `ProviderLogo` learns multi-path marks with brand fills
(`IconMarkPath.fill` — absent falls back to currentColor): new vendor
marks for openai, claude, gemini (flattened from the layered-gradient
source), deepl, exa and the four-color google-pse 'G', alongside the
simple-icons marks for searxng/brave/anthropic/mistral/deepseek/
ollama/openrouter and the composite rounded-square Tavily badge
(`IconMark.fillRule` evenodd knockout). serper/groq/typesafe keep the
monogram fallback. All source SVGs audited: no scripts, handlers,
external refs or entity tricks; gemini's dangling gradient fills
flattened to a solid brand blue. Tiles stay minimal: key chip +
hosting chip, and labels wrap to two lines instead of truncating. The
settings form's main page now keeps only the key (or the base URL when
the catalog requires one — self-hosted instances); the connection name
and the optional base-URL override move under the Advanced disclosure,
and the wizard takes `defaultName(type)` so apps can seed a numbered
default (label, `label 2`, …) from their existing instances.
