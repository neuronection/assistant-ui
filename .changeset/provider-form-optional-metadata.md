---
'@neuronection/assistant-ui': minor
---

`ProviderForm` gains optional, flag-gated metadata fields — `showLocationKind` renders a Local/Cloud toggle (`locationKind`/`onLocationKindChange`, icon tile chips) and `showCountry` renders a country select (`country`/`onCountryChange`, app-supplied `countryOptions`). Both default off; apps adopt only what they model.
