---
'@neuronection/assistant-ui': minor
---

web-search-providers: provider type tiles carry an optional hosting chip
(catalog `hosting: 'cloud' | 'self-hosted'`, labels via
`cloudChipLabel`/`selfHostedChipLabel`, unknown values render nothing)
and `ProviderLogo` gains inline simple-icons marks for searxng, brave
and google-pse, plus a composite rounded-square Tavily badge (glyph
knocked out of the tile via evenodd — `IconMark.fillRule`). exa/serper
have no mark yet and keep the monogram fallback. Tiles stay minimal: key chip +
hosting chip, and labels wrap to two lines instead of truncating. The
settings form's main page now keeps only the key (or the base URL when
the catalog requires one — self-hosted instances); the connection name
and the optional base-URL override move under the Advanced disclosure,
and the wizard takes `defaultName(type)` so apps can seed a numbered
default (label, `label 2`, …) from their existing instances.
