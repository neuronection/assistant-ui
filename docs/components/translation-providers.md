# translation-providers

The family's translation-provider settings surface, in the AI-providers
pattern: configured engines as **ProviderCards** with a `⋯` management
menu, and an add flow that starts from **engine tiles** ("choose") before
showing the **settings form** ("configure"). Composable — mount the
composed panel, or the pieces behind your own chrome (modal wizard,
detail-page edit).

All components are presentational and controlled: providers, the engine
catalog and test results come in as data, every mutation goes out as an
event. Persistence, key sealing and the actual test calls are app-side;
array order is the failover priority.

## import

```ts
import {
  TranslationProvidersPanel,
  TranslationProvidersList,
  TranslationProviderWizard,
  TranslationEngineTiles,
  TranslationProviderSettingsForm,
} from '@neuronection/assistant-ui/translation-providers'
```

## data contracts

- `TranslationProviderView` — one configured provider: `id, name, type,
  enabled, apiBase, keyHint, keySet`.
- `TranslationEngineCatalog` — `{ order, entries }`: per engine `label`,
  `requiresKey`, `optionalKey` (public/self-hosted instances accept a key
  without gating save), `keyUrl`, `baseUrlRequired`/`baseUrl`/
  `baseUrlHint`, optional `notes` and `hosting`, plus extra `fields`
  (label, required, placeholder, `type: 'text' | 'number'`, `advanced`).
  The tiles, the settings form and the card badges all render from it.
- `TranslationProviderFormValue` — `{ name, apiKey, apiBase, fields }`.
- `TranslationProviderSaveInput` — `{ id?, type, name, apiBase, apiKey,
  fields }` — `apiKey: null` keeps the stored key.
- `TranslationProbeView` — `{ status: 'ok' | 'error', latencyMs, detail,
  error }`; `detail` is the test translation, shown on the ok line
  (`ok · Hola`).

## TranslationProvidersPanel

The composed section (drop-in): header + card list; Add swaps in the
tiles → form wizard; Edit (from a card's menu) swaps in the settings
form prefilled from the provider. `defaultName(type)` seeds the wizard's
name field (app-computed — label, numbered when taken).

## TranslationProvidersList

The card list alone: one `ProviderCard` per provider — mark by engine
key, engine + priority badges (disabled and no-key render as danger
badges), base-URL subtitle, test result as the connection line, and the
management actions in the `⋯` menu (enable/disable, move up/down, test,
edit, delete).

## TranslationProviderWizard / TranslationEngineTiles / TranslationProviderSettingsForm

The two-step add flow body (`SetupSteps` progress, engine tiles, then
the settings form — `initialType`, `defaultName`, `extraFields`, `error`
supported), the "choose" step alone, and the catalog-driven form for one
engine (key link, write-only key with stored-key note on edit, base URL
on the main page when required, name + optional override + `advanced`
tuning under the Advanced disclosure).

## minimal snippet

```tsx
<TranslationProvidersPanel
  providers={providers}
  catalog={catalog}
  probes={probes}
  testingId={testingId}
  defaultName={generateDefaultName}
  labels={labels}
  onSave={save.mutate}
  onDelete={confirmThenRemove}
  onMove={move.mutate}
  onToggle={(id, enabled) => toggle.mutate({ id, enabled })}
  onTest={test}
/>
```

## a11y

See the [accessibility matrix](../accessibility.md): the card menu is
labelled per provider, tiles are buttons named by engine, every form
input carries its catalog label, and the save button gates on the
catalog's required fields (disabled, not hidden).
