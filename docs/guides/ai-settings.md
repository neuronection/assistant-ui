# AI settings surfaces (providers → models → tasks)

The settings stack the family uses to wire up AI: **first-run setup**
(one-click provider wizard), **providers** (credentials), **models**
(registered models + remote catalog), **tasks** (task → model assignments,
including the Decision models group). Every component is presentational
(ADR-006): the catalog, the API calls and the persistence are app-side; data
comes in via props and actions go out via events.

| component | module | role |
|---|---|---|
| `SetupFirstRunCard` | `@neuronection/assistant-ui/setup-first-run-card` | empty-state CTA when no provider is configured (local-probe status) |
| `ProviderSetupTiles` | `@neuronection/assistant-ui/provider-setup-tiles` | neutral equal-weight preset grid (family order, no "recommended") |
| `ProviderSetupForm` | `@neuronection/assistant-ui/provider-setup-form` | guided setup form: checklist + copy buttons, write-only key, Advanced disclosure, §15 error copy |
| `SetupReview` | `@neuronection/assistant-ui/setup-review` | editable pre-flight review emitting the five-bind options body |
| `SwitchRow` | `@neuronection/assistant-ui/switch-row` | labeled `role="switch"` row with `now:` sub-line |
| `ProviderLogo` | `@neuronection/assistant-ui/provider-logo` | simple-icons provider mark, monogram fallback, `currentColor` |
| `ProviderForm` | `@neuronection/assistant-ui/provider-form` | name / base URL / write-only API key (+ hosting, country) — manual create/edit |
| `ConnectionTestRow` | `@neuronection/assistant-ui/connection-test-row` | idle/testing/ok/fail status line, app-side ping |
| `ModelRegistry` | `@neuronection/assistant-ui/model-registry` | provider cards → registered model rows + remote-catalog add modal |
| `TaskAssignmentPicker` | `@neuronection/assistant-ui/task-assignment-picker` | task → model mapping rows, capability-filtered, optional fallback |
| `CapabilityChips` / `ModelPicker` | `capability-chips` / `model-picker` | building blocks used inside (and by apps directly) |

The reference implementation is study-assistant
(`frontend/src/features/settings/`): `ProvidersTab.tsx`,
`ProviderFormDialog.tsx`, `ProviderCreateFields.tsx`, `ModelsTab.tsx`,
`TasksTab.tsx`. The snippets below are copied from there.

## 0. The family assembly (plan 26 §6)

One experience across every app — **first-run card → setup wizard →
defaults-first list → re-configure**. The app owns the wizard's phase
machine, every fetch/IPC call and every secret; the library owns structure,
a11y and visuals.

### 1. First run — the empty settings state

When no provider is configured, the AI-settings surface renders
`SetupFirstRunCard`; chat empty states deep-link to it. The local-engine
probe (Ollama) is app-side — the card renders its pending state and the app
drops the detected banner in as children:

```tsx
<SetupFirstRunCard
  title={TEXT.SETUP_CARD_TITLE}
  body={TEXT.SETUP_CARD_SUBTITLE}
  localProbing={probing}
  onSetup={() => setWizardOpen(true)}
>
  {ollamaDetected && <OllamaDetectedBanner onConnect={() => openWizard('ollama')} />}
</SetupFirstRunCard>
```

### 2. The setup wizard — tiles → guided form → editable review → success

The app drives the phases (a modal or the library `Wizard`); each step is a
promoted component:

```tsx
// step 1 — tiles: app data in family order, manual tile appended
<ProviderSetupTiles
  presets={PRESET_ORDER.map((key) => ({ key, name: PRESETS[key].name, local: PRESETS[key].local }))}
  configured={configuredPresetKeys}
  onSelect={openForm}
  label={TEXT.SETUP_TILES_ARIA}
>
  <ProviderSetupManualTile onClick={openManual}>{TEXT.SETUP_MANUAL_CARD}</ProviderSetupManualTile>
</ProviderSetupTiles>

// step 2 — guided form: validation + secrets stay app-side
<ProviderSetupForm
  preset={presetSlice /* {name, keyUrl, steps, freeTierNote, fixedBase, baseUrl, local} */}
  value={formValue /* {name, apiKey, baseUrl} */}
  onChange={setFormValue}
  testing={checking}
  error={classified /* {code: 'invalid_key', suspectedVendor?: 'openrouter'} */}
  errorLabels={translatedCopyPerCode}
  onCopyStep={(step) => ipc.writeToClipboard(step)}   // Electron mirror
  onOpenKeyUrl={(url) => ipc.openExternal(url)}       // Electron link
  advancedExtra={<HostingToggle … />}                 // study/health hosting + country
  submitLabel={preset.local ? connectLabel : validateLabel}
  onSubmit={submit}
  onCancel={backToTiles}
/>

// step 3 — editable review: every edit emits the full five-bind body
<SetupReview
  models={(preset.curatedModels ?? []).map((id) => ({ id, name: id, caps: inferCaps(id), selected: options.curatedIds.includes(id) }))}
  slots={reviewSlots /* text/vision/stt for chat presets; decision-only presets show the decision slot only */}
  onOptionsChange={setOptions /* {curatedIds, bindChat, bindVision, bindStt, bindDecision} */}
  footnote={neverRemovesFootnote}
/>
```

On submit the app sends its setup call with the options body — camelCase
over desktop IPC, snake_case (`curated_ids`, `bind_chat`, `bind_vision`,
`bind_stt`, `bind_decision`) in Python payloads; conversion is app-side.

### 3. Success + ongoing — defaults-first assignment list

The success panel rebinds the just-filled slots (per-slot `ModelPicker` or
`Combobox` rows — app composition). Ongoing, the tasks surface is a
defaults-first list — text, vision, transcription (stt), speech (tts), then
the **Decision models group** (`decision:<cap>` slots, primary + fallback,
transport-filtered) — then derived tasks; see §3 below for the
`TaskAssignmentPicker` wiring and the Decision group contract.

### 4. Re-configuration is first-class

- **Change key:** edit the provider (`ProviderForm` `hasStoredKey` — stored
  key note + write-only field).
- **Revalidate:** `ConnectionTestRow` on the provider row.
- **Re-run setup:** stored-key note + the same `SetupReview` modal — append
  semantics, never removes (the footnote says so).
- **Reassign:** the pickers; **reset-to-defaults** is the per-task clear
  action re-running capability-aware gap-fill as an explicit user action.

## 1. providers

### ProviderForm

Controlled fields; the API-key field is **write-only** — the library never
renders a stored key, the app owns keyring/storage:

```tsx
import { ProviderForm } from '@/components/ui/provider-form'

<ProviderForm
  name={state.name}
  onNameChange={state.setName}
  baseUrl={state.baseUrl}
  onBaseUrlChange={state.setBaseUrl}
  apiKey={state.apiKey}
  onApiKeyChange={state.setApiKey}
  nameLabel={t('settings.providerName')}
  baseUrlLabel={t('settings.baseUrl')}
  baseUrlPlaceholder={custom ? 'http://localhost:11434/v1' : undefined}
  hideBaseUrl={state.selectedType !== 'openai_compatible'}
  apiKeyLabel={t('settings.apiKey')}
  apiKeyHelp={t('settings.apiKeyOptional')}
  showLocationKind
  locationKind={state.isLocal ? 'local' : 'cloud'}
  onLocationKindChange={(kind) => state.setIsLocal(kind === 'local')}
  locationLabel={t('settings.hosting')}
  localLabel={t('settings.localKind')}
  cloudLabel={t('settings.cloudKind')}
  showCountry
  country={state.country}
  onCountryChange={state.setCountry}
  countryLabel={t('settings.country')}
  countryPlaceholder={t('settings.countryPlaceholder')}
  countryOptions={COUNTRIES.map((entry) => ({
    value: entry.code,
    label: `${entry.flag} ${entry.name}`,
  }))}
  error={state.error ?? undefined}
>
  {/* optional children render between the fields and the error line */}
  {custom && !state.baseUrl.trim() ? (
    <p className="text-warning text-[11px]">{t('settings.baseUrlRequired')}</p>
  ) : null}
</ProviderForm>
```

Key props:

- `hideBaseUrl` — collapse the base-URL field for provider types with a fixed
  endpoint (state stays controlled either way).
- `showLocationKind` + `locationKind`/`onLocationKindChange` — Local/Cloud
  toggle (`'local' | 'cloud'`); render only when `showLocationKind`.
- `showCountry` + `country`/`onCountryChange`/`countryOptions` — country
  select (`{ value, label }[]`).
- `hasStoredKey` + `storedKeyLabel` — edit mode: label gets a
  "(Stored — leave empty to keep)" suffix and the field shows `•••`. Only
  send `api_key` upstream when the user typed one:

  ```ts
  ...(trimmedKey ? { api_key: trimmedKey } : {})
  ```

- `error` renders a `role="alert"` line; `children` render before it.

### ConnectionTestRow

The ping is app-side — flip `status` from the test handler:

```tsx
import { ConnectionTestRow } from '@/components/ui/connection-test-row'

<ConnectionTestRow
  variant="inline"
  className="mt-1"
  label={t('settings.connection')}
  status={
    busyId === provider.id
      ? 'testing'
      : provider.status
        ? provider.status.ok
          ? 'ok'
          : 'fail'
        : 'idle'
  }
  errorMessage={provider.status?.error ?? null}
  meta={
    provider.status?.model_count != null
      ? `${provider.status.model_count} ${t('settings.modelsCount')}`
      : undefined
  }
  testLabel={t('settings.test')}
  okLabel={t('settings.testOk')}
  failLabel={t('settings.testFail')}
  onTest={() => test.mutate(provider.id)}
  disabled={busyId === provider.id}
/>
```

- `variant="row"` (default) draws the bordered card row; `variant="inline"`
  drops the chrome for embedding in app cards.
- `latencyMs` renders `· <n>ms` in the ok state; `meta` is free-form
  app-side context (model count, region, …).

### create + edit dialog

Study wraps `ProviderForm` in a `Card`-based dialog: create uses a preset
select + `ProviderCreateFields`; edit pins the provider type to a read-only
line and keeps the key empty unless replaced. See
`ProviderFormDialog.tsx` / `useProviderCreate.ts` for the full wiring.

## 2. models (ModelRegistry)

### data in

```tsx
import {
  ModelRegistry,
  type ModelRegistryDraft,
  type ModelRegistryModel,
  type ModelRegistryPatch,
} from '@/components/ui/model-registry'

const registryProviders = (providers.data ?? []).map((provider) => ({
  id: String(provider.id),
  name: provider.name,
  type: provider.type,
  baseUrl: provider.base_url ?? undefined,
}))
const registryModels: ModelRegistryModel[] = (models.data ?? [])
  .filter((model) => model.enabled)
  .map((model) => ({
    id: String(model.id),
    providerId: String(model.provider_id),
    externalId: model.external_id,
    label: model.label || undefined,
    caps: model.caps,
    enabled: model.enabled,
    reasoningEffort: model.reasoning_effort ?? undefined,
    missing: model.missing,
  }))
```

Caps are descriptors (value + translated label + icon) built app-side:

```tsx
const capDescriptors: CapabilityDescriptor[] = MODEL_CAPS.map((cap) => ({
  value: cap,
  label: t(`settings.caps.${cap}`),
  icon: CAP_ICONS[cap],
}))
```

### remote catalog — fetch keyed per expanded provider

The registry is a disclosure list: one provider expanded at a time
(`expandedProviderId` + `onExpandedProviderChange`). Fetch the remote model
list **only for the expanded provider** and map the fetch state in:

```tsx
const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null)
const providerId = expandedProviderId !== null ? Number(expandedProviderId) : null
const remote = useQuery({
  queryKey: ['remote-models', expandedProviderId],
  queryFn: () => listRemoteModels(providerId!),
  enabled: providerId !== null,
  retry: false,
})
```

```tsx
remoteModels={remote.data?.map((remoteModel) => ({
  id: remoteModel.external_id,
  caps: remoteModel.caps,
}))}
remoteState={
  remote.fetchStatus === 'fetching' ? 'loading' : remote.isError ? 'error' : 'ready'
}
remoteError={remote.isError ? remote.error.message : null}
onRetryRemote={() => void remote.refetch()}
```

### capability guesses (app-side inference)

`ModelRegistry` renders exactly the caps it is given. If a provider's
catalog doesn't report capabilities, **the app guesses before handing over
`remoteModels`** — e.g. infer `embeddings`/`audio` from the model id
(`*-embed-*`, `whisper-*`), default everything else to `text`, then pass the
resulting `{ id, caps }[]`. Keep the inference in one app-side function so
add-all and quick-add stay consistent.

### add / edit / add-all wiring

Add and edit share one catalog modal (internal to the component). The app
pays out four events:

```tsx
onAddModel={(pid, draft) => void handleAdd(pid, draft)}
onAddAll={(pid, drafts) => void handleAddAll(pid, drafts)}
onUpdateModel={(model, patch) => void handleUpdate(model, patch)}
onDeleteModel={(model) => void handleDelete(model)}
```

`ModelRegistryDraft` is the create/edit payload — `{ externalId, label?,
caps, reasoningEffort?, temperature?, maxTokens? }`. Study persists the
tuning fields per model:

```ts
await createModel({
  provider_id: Number(pid),
  external_id: draft.externalId,
  label: draft.label ?? null,
  caps: draft.caps,
  enabled: true,
  reasoning_effort: draft.reasoningEffort || null,
  temperature: draft.temperature ?? null,
  max_tokens: draft.maxTokens ?? null,
})
```

Updates are sparse patches — only forward the keys the user changed:

```ts
await updateModel(Number(model.id), {
  ...(patch.label !== undefined ? { label: patch.label } : {}),
  ...(patch.caps !== undefined ? { caps: patch.caps } : {}),
  ...(patch.reasoningEffort !== undefined
    ? { reasoning_effort: patch.reasoningEffort || null }
    : {}),
  ...(patch.temperature !== undefined ? { temperature: patch.temperature } : {}),
  ...(patch.maxTokens !== undefined ? { max_tokens: patch.maxTokens } : {}),
})
```

Add-all sends every remote id the app hasn't registered yet (the component
computes the pending set and labels the button `Add all (n)`); study batches
creates 20 at a time. Deletes go through the app's confirm flow.

`reasoningEffortOptions` (e.g. `['none','low','medium','high','max','xhigh']`)
turns on the reasoning-effort select with a Custom escape hatch. If a model's
stored effort isn't in the list, the select opens in custom mode.

### full label set

`ModelRegistry` takes ~25 label props with English defaults (add/addAll
titles, search, caps, temperature/maxTokens/label/reasoning-effort, retry,
empty states). Pass all of them through i18next at the call site — see
`ModelsTab.tsx` for the complete list; every prop exists so no library
string leaks untranslated into an app.

## 3. tasks (TaskAssignmentPicker)

### catalog + value maps

Build a provider catalog from enabled models, then two maps: primary
(task → model) and optional fallback:

```tsx
const catalog: ModelPickerProvider[] = Object.values(
  enabledModels.reduce<Record<number, ModelPickerProvider>>((acc, model) => {
    acc[model.provider_id] = acc[model.provider_id] ?? {
      id: String(model.provider_id),
      name: providerNames.get(model.provider_id) ?? `#${model.provider_id}`,
      models: [],
    }
    acc[model.provider_id].models.push({
      id: String(model.id),
      name: model.label || model.external_id,
      capabilities: model.caps,
    })
    return acc
  }, {}),
)

const value: Record<string, string | null> = {}          // taskId → modelId
const secondaryValue: Record<string, string | null> = {} // taskId → fallback id
```

### sections + requires + fallback

Rows render flat (`tasks`) or grouped (`sections`). `requires` filters each
row's picker catalog down to models carrying that capability
(`capabilities` or legacy single `capability`); section-level `secondary: true`
adds the fallback picker to every task in the section:

```tsx
const sections: TaskAssignmentSection[] = [
  {
    id: 'defaults',
    label: t('settings.defaultModelsTitle'),
    secondary: true,
    tasks: CAP_ORDER.map((cap) => ({
      id: `default:${cap}`,
      label: t('settings.defaultModelLabel', { cap: t(`settings.caps.${cap}`) }),
      requires: cap,
      icon: CAP_ICONS[cap],
    })),
  },
  {
    id: 'overrides',
    label: t('settings.taskOverrides'),
    tasks: (tasks.data ?? []).map((task) => ({
      id: task.task,
      label: task.task,
      description: task.description,
      requires: task.requires,
      icon: TASK_ICONS[task.task],
    })),
  },
]

<TaskAssignmentPicker
  sections={sections}
  providers={catalog}
  value={value}
  secondaryValue={secondaryValue}
  onAssign={handleAssign}
  onAssignSecondary={handleAssignSecondary}
  secondaryLabel={t('settings.defaultFallbackLabel')}
```

### Decision models group (plan 26 / ADR-0032)

Decision models are ordinary catalog rows whose `capabilities` include
`decision`; their assignment slots are ordinary rows with
`requires: 'decision'` and `decision:<capability>` ids
(`decision:tool-dispatch | decision:boolean-gate | decision:choice |
decision:score` — `open-args` is reserved and never offered). The picker's
capability filter enforces slot separation in both directions for free:
decision slots list only decision-capable models, and text/vision slots
never list them. Ship the group with `secondary: true` (primary +
fallback — a second provider's decision model is the resilience story)
and surface the app's privacy notice at assignment time (cloud decision
models are explicit opt-in; prompt + candidate tool data leave the
device). The capability vocabulary is app-supplied — add a `decision`
descriptor to your `caps` array alongside the others.

```tsx
{
  id: 'decision',
  label: t('settings.decisionGroupTitle'),
  description: t('settings.decisionGroupDescription'),
  secondary: true,
  tasks: DECISION_SLOTS.map((slot) => ({
    id: slot,
    label: t(`settings.decisionSlots.${slot}`),
    requires: 'decision',
    icon: DECISION_ICONS[slot],
  })),
}
```


Both handlers receive `(taskId, modelId | null)` — `null` means cleared.
Fallback writes must round-trip the primary assignment (send both ids, not
just the changed one):

```ts
const handleAssignSecondary = (taskId: string, modelId: string | null) => {
  const cap = taskId.slice('default:'.length)
  const entry = defaultByCap.get(cap)
  assignDefault.mutate({
    requires: cap,
    modelId: entry?.model_id ?? null,
    fallbackModelId: modelId ? Number(modelId) : null,
  })
}
```

### renderMeta

`renderMeta(task)` injects app-side context under each row (inheritance
notes, spend, budgets, warnings — anything):

```tsx
renderMeta={(task) => {
  const info = (tasks.data ?? []).find((entry) => entry.task === task.id)
  if (!info) return null
  return (
    <div className="space-y-0.5">
      <p>
        <span className="text-muted-foreground rounded-full bg-subtle px-2 py-0.5 text-[11px]">
          {info.requires}
        </span>
      </p>
      {info.inherits_default && info.default_model_label ? (
        <p className="text-muted-foreground text-[11px]">
          {t('settings.inheritedFromDefault', { label: info.default_model_label })}
        </p>
      ) : null}
    </div>
  )
}}
```

## boundary recap

- Library: rendering, keyboard/ARIA, draft state inside the add/edit modal,
  catalog filtering. **No fetching, no storage, no i18n, no key handling.**
- App: provider/model/task CRUD, remote-catalog fetch (keyed per expanded
  provider), cap inference, keyring storage, cost/budget data, confirm
  dialogs, translations.
- The API-key input is write-only by design — the library renders no stored
  secret, ever.
