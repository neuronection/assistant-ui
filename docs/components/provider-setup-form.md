# ProviderSetupForm

Guided one-click setup form (plan 26 §6): the selected provider's mark
beside its name (`ProviderLogo`, keyed by `preset.key` — the same mark the
tiles show), vendor checklist with copy buttons
and a get-a-key link, factual free-tier note, connection name, a **write-only
API key** (`type="password"` + `autoComplete="new-password"` — the library
never renders a stored key, ADR-006), and an **Advanced disclosure** whose
base-URL field is read-only for fixed-endpoint presets. Validation, secrets,
IPC/REST are the app's business — the form reports `onSubmit(value)`;
classified failures render copy keyed off the shared §15 error enum with
**labels prop-injected** (no i18n engine in the library).

## import

```ts
import {
  ProviderSetupForm,
  SETUP_ERROR_CODES,
  type SetupErrorCode,
} from '@neuronection/assistant-ui/provider-setup-form'
```

## props

Extends `React.ComponentProps<'form'>` (spread onto the root form).

| prop | type | default | notes |
|---|---|---|---|
| `preset` | `ProviderSetupFormPreset` | — | `{ key?, name, keyUrl?, steps?, freeTierNote?, fixedBase?, baseUrl, local? }`; `key` renders the provider mark beside the name (same `ProviderLogo` the tiles use — omit for keyless/manual entries); `steps` entries interpolate `{url}` → `keyUrl`; `local` renders `noKeyLabel` instead of the key field |
| `value` | `ProviderSetupFormValue` | — | controlled `{ name, apiKey, baseUrl? }` |
| `error` | `{ code, suspectedVendor? } \| null` | — | §15 enum code + optional vendor-key mis-paste hint |
| `testing` | `boolean` | `false` | disables + marks the submit busy |
| `onSubmit` | `(value) => void` | — | form submit (Enter works) |
| `onCancel` | `() => void` | — | renders the back/cancel button when provided |
| `onChange` | `(value) => void` | — | every field edit |
| `errorLabels` | `Partial<Record<string, string>>` | — | translated copy per code (English defaults ship in `DEFAULT_SETUP_ERROR_COPY`) |
| `suspectedVendorHint` | `string` | `'This looks like a {vendor} API key.'` | `{vendor}` interpolates |
| `onCopyStep` | `(step: string) => void` | — | notified on checklist copy (Electron apps mirror via IPC; the browser write always happens) |
| `onOpenKeyUrl` | `(url: string) => void` | — | renders a button instead of an anchor (Electron `openExternal`) |
| `advancedExtra` | `ReactNode` | — | app content inside the Advanced disclosure (hosting toggle, country select) |
| `checklistLabel` | `string` | `'Setup steps'` | checklist `aria-label` |
| `copyLabel` | `string` | `'Copy'` | copy button name |
| `getKeyLabel` | `string` | `'Get an API key'` | link/button label |
| `nameLabel` / `apiKeyLabel` / `keyPlaceholder` | `string` | `'Connection name'` / `'API key'` / `'sk-…'` | field labels |
| `noKeyLabel` | `string` | `'Runs on your machine — no API key needed.'` | shown for `local` presets |
| `advancedLabel` / `baseUrlLabel` / `baseUrlHint` | `string` | `'Advanced'` / `'API base URL'` / — | disclosure + base-URL field (hint renders only when the base is editable) |
| `submitLabel` / `cancelLabel` | `string` | `'Connect'` / `'Back'` | action row |

The submit button disables while `testing` or — for non-local presets —
while the key field is empty.

## controlled contract

Fully controlled: `value` in, `onChange(value)` per keystroke,
`onSubmit(value)` on submit. The key field is write-only by design.

## labels & i18n

Every visible string is a prop. Error copy: pass your translated per-code
map through `errorLabels`; unknown codes fall back to the `unknown` entry.
`SETUP_ERROR_CODES` / `SetupErrorCode` mirror the §15 enum
(`invalid_key | insufficient_credit | new_user_quota |
region_unavailable | timeout | local_not_running | unknown`).

## examples

minimal:

```tsx
<ProviderSetupForm
  preset={{ key: 'openai', name: 'OpenAI', keyUrl, steps, fixedBase: false, baseUrl }}
  value={value}
  onChange={setValue}
  onSubmit={submit}
  onCancel={backToTiles}
/>
```

realistic (i18n + classified error + Electron bridges):

```tsx
<ProviderSetupForm
  preset={presetSlice}
  value={value}
  onChange={setValue}
  testing={checking}
  error={result?.ok === false ? { code: result.errorCode ?? 'unknown', suspectedVendor: result.suspectedVendor } : null}
  errorLabels={ERROR_LABELS}
  suspectedVendorHint={TEXT.SETUP_SUSPECTED_PREFIX}
  onCopyStep={(step) => void window.electronAPI.writeToClipboard(step)}
  onOpenKeyUrl={(url) => void window.electronAPI.openExternal(url)}
  submitLabel={preset.local ? TEXT.SETUP_OLLAMA_CONNECT : TEXT.SETUP_SUBMIT}
  cancelLabel={TEXT.SETUP_BACK_TILES}
  onSubmit={submit}
  onCancel={() => setPhase('tiles')}
/>
```

## accessibility

Labelled fields via the library `Input`; checklist is an `aria-label`ed
`<ol>` with named copy buttons; Advanced is a native `<details>` disclosure
(keyboard-operable for free); the error block is `role="alert"`; submit is a
real submit button (Enter submits from any field). Asserted in
`tests/provider-setup-form.test.tsx`.

## related

[`ProviderSetupTiles`](./provider-setup-tiles.md) (step one),
[`SetupReview`](./setup-review.md) (pre-flight), [`ProviderForm`](./provider-form.md)
(manual edit), [ai-settings guide](../guides/ai-settings.md).
