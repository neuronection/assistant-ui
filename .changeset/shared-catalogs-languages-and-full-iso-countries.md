---
'@neuronection/assistant-ui': minor
---

Reference catalogs per ADR-0024: `./countries` is now the complete officially assigned ISO 3166-1 alpha-2 list (249 entries, CLDR English names, code-derived flags, `GB` — not `UK` — for the United Kingdom, plus `findCountry`/`pickCountries`/`countryDisplayName`), and a new `./languages` subpath ships the ISO 639-1 superset (43 entries with `nativeName` endonyms and optional flags, plus `findLanguage`/`isLanguageCode`/`pickLanguages`/`languageDisplayName`). No alias maps or normalization shims — clean break. `scripts/export-catalogs.mjs` emits the backend-facing JSON templates. `ProviderForm`'s country field now uses the library `Combobox` (searchable, clearable — the catalog is ~250 entries) instead of a native `<select>`; the `countryOptions` contract is unchanged, with new optional `countrySearchPlaceholder`/`countryEmptyLabel`/`countryClearLabel` label props.
