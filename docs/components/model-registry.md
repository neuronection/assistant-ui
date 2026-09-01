# ModelRegistry

Disclosure list of AI providers, each expandable to its registered models,
plus a catalog modal that adds models from the app-fetched remote catalog.
Add and edit are one modal; add-all registers every not-yet-registered
remote id in one event.

## import

```ts
import { ModelRegistry } from '@neuronection/assistant-ui/model-registry'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `providers` | `ModelRegistryProvider[]` | — | `{ id, name, type?, baseUrl?, readOnly? }` — `readOnly` hides Add/Edit/Remove for that provider |
| `models` | `ModelRegistryModel[]` | — | `{ id, providerId, externalId, label?, caps, enabled, reasoningEffort?, temperature?, maxTokens?, extra?, missing? }` |
| `caps` | `CapabilityDescriptor[]` | — | `{ value, label, icon? }` — labels/icons come from the app |
| `expandedProviderId` | `string \| null` | — | which provider card is open |
| `onExpandedProviderChange` | `(providerId: string \| null) => void` | — | disclosure is controlled |
| `remoteModels` | `ModelRegistryRemoteModel[]` | — | `{ id, caps }[]` for the expanded provider, fetched app-side |
| `remoteState` | `'loading' \| 'error' \| 'ready'` | `'ready'` | drives the modal's loading/error/ready views |
| `remoteError` | `string \| null` | — | shown with a retry button in the modal |
| `onRetryRemote` | `() => void` | — | render only to get the retry affordance |
| `onAddModel` | `(providerId: string, draft: ModelRegistryDraft) => void` | — | add modal submit |
| `onAddAll` | `(providerId: string, drafts: ModelRegistryDraft[]) => void` | — | renders the `Add all (n)` button when set |
| `onUpdateModel` | `(model: ModelRegistryModel, patch: ModelRegistryPatch) => void` | — | edit modal submit (sparse patch) |
| `onDeleteModel` | `(model: ModelRegistryModel) => void` | — | row × button; confirm stays app-side |
| `onToggleEnabled` | `(model: ModelRegistryModel, enabled: boolean) => void` | — | renders a native per-row enable checkbox when set |
| `enableLabel` | `string` | `'Enabled'` | accessible name prefix for the row checkbox (`Enabled — <id>`) |
| `extraFields` | `ModelRegistryExtraField[]` | — | app-declared extra modal fields `{ key, label, placeholder?, multiline? }`; values ride `extra` on `Model`/`Draft`/`Patch` |
| `reasoningEffortOptions` | `string[]` | — | enables the effort select + custom option |
| `emptyAction` | `ReactNode` | — | extra CTA under the no-providers empty state |
| ~25 label props | `string` | English | `addLabel`, `addAllLabel`, `addTitle`, `editTitle`, `selectModelLabel`, `manualIdToggleLabel`, `editLabel`, `removeLabel`, `missingLabel`, `capsLabel`, `searchPlaceholder`, `searchLabel`, `emptyProviderLabel`, `externalIdRequiredLabel`, `remoteEmptyLabel`, `remoteLoadingLabel`, `retryLabel`, `customOptionLabel`, `temperatureLabel`, `maxTokensLabel`, `labelLabel`, `reasoningEffortLabel`, `saveLabel`, `cancelLabel`, `addDraftLabel`, `providersEmptyLabel` |
| `className` | `string` | — | merges onto the root `div` |

## controlled contract

- Disclosure is controlled: you own `expandedProviderId`; the library toggles
  via `onExpandedProviderChange` (clicking the open provider reports `null`).
- A provider flagged `readOnly` renders its rows without the Edit/Remove
  controls, the enable checkbox and the Add-model button — use it for
  org-managed / shared providers the current user may not modify
  (permission is the app's decision; the flag is presentational only).
- Remote catalog data is a prop: fetch for the expanded provider only, map
  `remoteState`/`remoteError` from your query, refetch via `onRetryRemote`.
- Add/edit/delete/add-all/enable-toggle are events out; the app persists and
  refreshes `models` — the list only changes when props change.
- The add/edit modal, its draft state (id, label, caps, effort,
  temperature, max tokens, extra fields) and its validation are internal; it
  submits and closes itself. `extraFields` are app-declared (e.g. a
  description line) and carried verbatim on `Model.extra`/`Draft.extra`/
  `Patch.extra` — an edit only includes `extra` when the user touched a
  field or the model already carried non-empty values.

## labels & i18n

Every visible string is a prop with an English default. Apps translate at
the call site (all family apps use i18next) — see
[../guides/ai-settings.md](../guides/ai-settings.md#2-models-modelregistry)
for the full `ModelsTab` wiring.

## examples

minimal:

```tsx
<ModelRegistry
  providers={[{ id: '1', name: 'Ollama', type: 'openai_compatible' }]}
  models={[]}
  caps={[{ value: 'text', label: 'Text' }]}
  expandedProviderId={expanded}
  onExpandedProviderChange={setExpanded}
  onAddModel={(pid, draft) => console.log(pid, draft)}
  onUpdateModel={(model, patch) => console.log(model, patch)}
  onDeleteModel={(model) => console.log(model)}
/>
```

realistic (trimmed from study-assistant `ModelsTab.tsx`, with health-assistant's
extra description field and enable toggle):

```tsx
<ModelRegistry
  providers={registryProviders}
  models={registryModels}
  caps={capDescriptors}
  expandedProviderId={expandedProviderId}
  onExpandedProviderChange={setExpandedProviderId}
  remoteModels={remote.data?.map((m) => ({ id: m.external_id, caps: m.caps }))}
  remoteState={remote.fetchStatus === 'fetching' ? 'loading' : remote.isError ? 'error' : 'ready'}
  remoteError={remote.isError ? remote.error.message : null}
  onRetryRemote={() => void remote.refetch()}
  onAddModel={(pid, draft) => void handleAdd(pid, draft)}
  onAddAll={(pid, drafts) => void handleAddAll(pid, drafts)}
  onUpdateModel={(model, patch) => void handleUpdate(model, patch)}
  onDeleteModel={(model) => void handleDelete(model)}
  onToggleEnabled={(model, enabled) => void handleToggle(model, enabled)}
  enableLabel={t('settings.enabled')}
  extraFields={[{ key: 'description', label: t('settings.modelDescription'), multiline: true }]}
  reasoningEffortOptions={['none', 'low', 'medium', 'high', 'max', 'xhigh']}
  capsLabel={t('settings.modelCaps')}
  searchPlaceholder={t('settings.searchModels')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#settings-blocks): provider headers
are disclosure buttons (`aria-expanded`), row controls carry
`Add/Edit/Remove — <id>` accessible names, the enable checkbox is a native
input, the draft panel inputs are labelled.

## related

[`ModelPicker`](./model-picker.md) (catalog select inside the modal),
[`CapabilityChips`](./capability-chips.md), [`Modal`](./modal.md),
[`ConnectionTestRow`](./connection-test-row.md),
[ai-settings guide](../guides/ai-settings.md).
