---
'@neuronection/assistant-ui': minor
---

web-search-providers: provider type tiles carry an optional hosting chip
(catalog `hosting: 'cloud' | 'self-hosted'`, labels via
`cloudChipLabel`/`selfHostedChipLabel`, unknown values render nothing)
and `ProviderLogo` gains inline simple-icons marks for searxng, brave
and google-pse — tavily/exa/serper have no upstream mark and keep the
monogram fallback, same as openai/groq. Tiles stay minimal: key chip +
hosting chip.
