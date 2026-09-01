# ProviderForm

Standard provider-credential fields: name, optional base URL and a
**write-only** API key, plus optional Local/Cloud hosting toggle and country
select. The library never renders a stored key — keyring/storage is the
app's business (ADR-006).

## import

```ts
import { ProviderForm } from '@neuronection/assistant-ui/provider-form'
```

## props

Extends `React.ComponentProps<'div'>` (spread onto the root).

| prop | type | default | notes |
|---|---|---|---|
| `name` | `string` | — | controlled |
| `onNameChange` | `(value: string) => void` | — | |
| `baseUrl` | `string` | — | controlled (ignored when `hideBaseUrl`) |
| `onBaseUrlChange` | `(value: string) => void` | — | |
| `apiKey` | `string` | — | controlled; **write-only** field |
| `onApiKeyChange` | `(value: string) => void` | — | |
| `hideBaseUrl` | `boolean` | `false` | for provider types with a fixed endpoint |
| `namePlaceholder` | `string` | `'Provider name'` | |
| `baseUrlPlaceholder` | `string` | `'https://api.example.com/v1'` | |
| `nameLabel` | `string` | `'Name'` | |
| `baseUrlLabel` | `string` | `'API base URL'` | |
| `apiKeyLabel` | `string` | `'API key'` | |
| `apiKeyHelp` | `string` | — | hint under the key field (apps mention keyring storage here) |
| `hasStoredKey` | `boolean` | `false` | edit mode: shows `•••` + `storedKeyLabel` suffix |
| `storedKeyLabel` | `string` | `'Stored — leave empty to keep'` | |
| `keyPlaceholder` | `string` | `'sk-…'` | |
| `showLocationKind` | `boolean` | `false` | render gate for the Local/Cloud toggle |
| `locationKind` | `'local' \| 'cloud'` | `'cloud'` | |
| `onLocationKindChange` | `(kind: 'local' \| 'cloud') => void` | — | required with `showLocationKind` |
| `locationLabel` / `localLabel` / `cloudLabel` | `string` | `'Hosting'` / `'Local / on-premise'` / `'Cloud'` | |
| `showCountry` | `boolean` | `false` | render gate for the country select |
| `country` | `string` | — | |
| `onCountryChange` | `(country: string) => void` | — | |
| `countryLabel` | `string` | `'Country'` | |
| `countryOptions` | `{ value: string; label: string }[]` | `[]` | |
| `countryPlaceholder` | `string` | `'Select a country…'` | |
| `error` | `string` | — | `role="alert"` line at the bottom |
| `children` | `ReactNode` | — | extra app-side content between fields and error |

## controlled contract

All fields are controlled strings in, change events out. The key field uses
`type="password"` + `autoComplete="new-password"` and only ever reports new
input — to keep an existing key, send nothing upstream when the field stays
empty. `locationKind` and `country` are plain controlled state.

## labels & i18n

All label/button strings are props with English defaults; translate at the
call site.

## examples

minimal:

```tsx
<ProviderForm
  name={name}
  onNameChange={setName}
  baseUrl={baseUrl}
  onBaseUrlChange={setBaseUrl}
  apiKey={apiKey}
  onApiKeyChange={setApiKey}
/>
```

realistic (from study-assistant `ProviderCreateFields.tsx`) — see
[ai-settings guide](../guides/ai-settings.md#1-providers) for the full
create/edit wiring incl. `hideBaseUrl`, hosting toggle and country list.

## accessibility

See [accessibility.md](../accessibility.md#inputs): labelled fields,
write-only key input, error announced via `role="alert"`, hosting toggle is
an `aria-pressed` button group.

## related

[`Input`](./input.md), [`ConnectionTestRow`](./connection-test-row.md),
[`ProviderForm` in the ai-settings guide](../guides/ai-settings.md).
