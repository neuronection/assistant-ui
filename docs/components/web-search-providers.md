# web-search-providers

The family's web-search settings surface (ADR-0035 / plan 28), rendered in
the AI-providers UI pattern: configured providers as **ProviderCards** with
a `⋯` management menu, and an add flow that starts from **provider tiles**
("choose") before showing the **settings form** ("configure"). The module
is a composable family — mount the composed panel, or the pieces behind
your own chrome (modal wizard, detail-page edit).

All components are presentational and controlled: providers, the catalog
and probes come in as data, every mutation goes out as an event.
Persistence, key sealing and the actual probe calls are app-side; the
first *enabled* provider that answers wins is the family's fallback
semantics, surfaced by card order.

## import

```ts
import {
  WebSearchProvidersPanel,
  WebSearchProvidersList,
  WebSearchProviderWizard,
  WebSearchProviderTiles,
  WebSearchProviderSettingsForm,
} from '@neuronection/assistant-ui/web-search-providers'
```

## data contracts

- `WebSearchProviderView` — one configured provider: `id, name, type,
  enabled, baseUrl, googleCx, keyHint, keySet` (mirrors the family
  `providers[]` preference shape).
- `WebSearchProviderCatalog` — `{ order, entries }` from the vendored
  `search-providers.json`: per type, `label`, `requiresKey`, `keyUrl` +
  `baseUrl`/`baseUrlRequired`/`baseUrlHint`, optional `notes` and extra
  `fields` (label, required, placeholder, `type: 'text' | 'number'`,
  `advanced`). The tiles, the settings form and the card badges all render
  from it.
- `WebSearchProviderFormValue` — the form's controlled value:
  `{ name, apiKey, baseUrl, fields }` (`fields` keyed by catalog/app field
  id, e.g. `google_cx`).
- `WebSearchProviderSaveInput` — what `onSave` emits: `{ id?, type, name,
  baseUrl, googleCx, apiKey, fields }` — `apiKey: null` keeps the stored
  key, a value replaces it.
- `WebSearchProviderProbeView` — `{ status, latencyMs, error }` with
  `status ∈ ok | unreachable | auth | rate_limit | json_disabled | error`.

## WebSearchProvidersPanel

The composed section (drop-in): header + card list; Add swaps in the
tiles → form wizard; Edit (from a card's menu) swaps in the settings form
prefilled from the provider.

| prop | type | notes |
|---|---|---|
| `providers` | `WebSearchProviderView[]` | ordered list; order = fallback priority |
| `catalog` | `WebSearchProviderCatalog` | provider catalog (vendored contract) |
| `probes` | `Record<id, WebSearchProviderProbeView>` | latest probe per provider; renders the inline connection-test line |
| `testingId` | `string \| null` | provider mid-test (spinner state) |
| `busy` | `boolean` | disables all actions and the submit |
| `labels` | `WebSearchProvidersPanelLabels` | English defaults; apps translate (panel + list + wizard + form labels, probe labels) |
| `onSave` | `(input: WebSearchProviderSaveInput) => void` | create (`id` absent) or update |
| `onDelete` | `(id: string) => void` | app owns confirmation |
| `onMove` | `(id, 'up' \| 'down') => void` | boundary moves are disabled menu items |
| `onToggle` | `(id, enabled: boolean) => void` | enable/disable from the menu |
| `onTest` | `(id: string) => void` | triggers the app-side probe |
| `className` | `string` | merged onto the root |

## WebSearchProvidersList

The card list alone (compose behind your own header): one `ProviderCard`
per provider — mark by type key, type + priority badges (disabled and
no-key render as danger badges), base-URL subtitle, probe status as the
connection line, and the management actions in the `⋯` menu
(enable/disable, move up/down, test, edit, delete). Extra labels beyond
the panel's: `orderLabel(position)`, `actionsLabel(name)`,
`enableLabel`/`disableLabel`, `idleLabel`/`okLabel`/`failLabel`.

## WebSearchProviderWizard

The two-step add flow body (mount in a modal or inline): `SetupSteps`
progress ("Choose provider" → "Configure"), provider tiles, then the
settings form for the selected type. `initialType` opens the form step
directly; `extraFields` appends app-declared tuning fields (rendered by
the same form machinery); `error` surfaces a save failure on the form
step. `onSave` emits the final `WebSearchProviderSaveInput`; `onCancel`
fires from the tiles step's back button (the form step backs into the
tiles first).

## WebSearchProviderSettingsForm

The catalog-driven settings form for one type (the wizard's step 2 and
the body of an edit page): vendor key link (`onOpenKeyUrl` bridges
Electron's `openExternal` — anchor by default), connection name, write-only
API key (or the no-key note), base URL (required/optional per catalog,
with hint), catalog fields, and an Advanced disclosure for
`advanced: true` fields. `mode: 'edit'` renders the stored-key note
(`storedKeyHint`) instead of gating on a key; submit stays disabled until
the catalog's required fields are filled.

## WebSearchProviderTiles

The "choose" step alone: the family `ProviderSetupTiles` fed from the
catalog — one tile per type in catalog order, a key/keyless chip derived
from `requiresKey` (equal weight, no ranking).

## minimal snippet

```tsx
<WebSearchProvidersPanel
  providers={providers}
  catalog={catalog}
  probes={probes}
  testingId={testingId}
  labels={labels}
  onSave={save.mutate}
  onDelete={confirmThenRemove}
  onMove={move.mutate}
  onToggle={(id, enabled) => toggle.mutate({ id, enabled })}
  onTest={test}
/>
```

App-owned chrome (desktop-assistant's AI-providers composition):

```tsx
<Modal open={adding} onOpenChange={setAdding}>
  <ModalContent size="lg">
    <ModalHeader><ModalTitle>{TEXT.SEARCH_ADD}</ModalTitle></ModalHeader>
    <ModalBody>
      <WebSearchProviderWizard catalog={catalog} onSave={save} onCancel={() => setAdding(false)} />
    </ModalBody>
  </ModalContent>
</Modal>
```

## a11y

See the [accessibility matrix](../accessibility.md): the card menu is
labelled per provider, tiles are buttons named by type, every form input
carries its catalog label, and the save button gates on the catalog's
required fields (disabled, not hidden).
