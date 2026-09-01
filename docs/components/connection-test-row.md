# ConnectionTestRow

Presentational connection-test line: idle/testing/ok/fail with latency and
error message. The actual ping is app-side — flip `status` from the test
handler. `variant="row"` draws a bordered row; `variant="inline"` drops the
chrome for embedding in app cards.

## import

```ts
import {
  ConnectionTestRow,
  type ConnectionTestStatus,
} from '@neuronection/assistant-ui/connection-test-row'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `status` | `'idle' \| 'testing' \| 'ok' \| 'fail'` | — | controlled state |
| `latencyMs` | `number \| null` | — | renders `· <n>ms` in the ok state |
| `label` | `string` | `'Connection'` | leading label |
| `testLabel` | `string` | `'Test'` | button label + "testing…" text |
| `okLabel` | `string` | `'Connected'` | |
| `failLabel` | `string` | `'Failed'` | |
| `latencyLabel` | `string` | `'ms'` | |
| `errorMessage` | `string \| null` | — | truncated, shown next to the fail state |
| `onTest` | `() => void` | — | omit to hide the button |
| `disabled` | `boolean` | `false` | button disabled (also while `testing`) |
| `variant` | `'row' \| 'inline'` | `'row'` | |
| `meta` | `ReactNode` | — | extra app-side context after the status (model count, …) |
| `className` | `string` | — | merges onto the root |

## controlled contract

State in (`status`), one event out (`onTest`). The component renders the
spinner during `testing` and disables the button; the app owns the ping,
the result and the latency value. Root carries `data-status="<status>"` and
`data-variant="<variant>"` for token-safe overrides.

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<ConnectionTestRow status="idle" onTest={runPing} />
```

realistic (from study-assistant `ProvidersTab.tsx`) — inline variant inside
a provider card, status derived from app state:

```tsx
<ConnectionTestRow
  variant="inline"
  className="mt-1"
  label={t('settings.connection')}
  status={busyId === provider.id ? 'testing' : provider.status ? (provider.status.ok ? 'ok' : 'fail') : 'idle'}
  errorMessage={provider.status?.error ?? null}
  meta={provider.status?.model_count != null ? `${provider.status.model_count} ${t('settings.modelsCount')}` : undefined}
  testLabel={t('settings.test')}
  okLabel={t('settings.testOk')}
  failLabel={t('settings.testFail')}
  onTest={() => test.mutate(provider.id)}
  disabled={busyId === provider.id}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#settings-blocks): `role="status"`
while testing, error message text, Enter on *Test* fires `onTest`,
`variant="inline"` drops the card chrome.

## related

[`ProviderForm`](./provider-form.md), [`Spinner`](./spinner.md),
[ai-settings guide](../guides/ai-settings.md#connectiontestrow).
