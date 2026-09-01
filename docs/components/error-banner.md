# ErrorBanner

Inline alert for app-side errors: `role="alert"`, danger tint, optional
action slot. Renders **nothing** without a message — safe to keep mounted.

## import

```ts
import { ErrorBanner } from '@neuronection/assistant-ui/error-banner'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `message` | `string \| null \| undefined` | — | falsy → renders nothing |
| `action` | `ReactNode` | — | app-owned control (retry, link) |
| `className` | `string` | — | merges |

## controlled contract

None — presentational. The message is app state; the action slot is a real
control the app renders.

## labels & i18n

`message` is an app string (e.g. `(err as Error).message` or a translated
fallback).

## examples

minimal:

```tsx
<ErrorBanner message={error} />
```

realistic (with retry):

```tsx
<ErrorBanner
  message={mutation.isError ? mutation.error.message : null}
  action={
    <Button variant="ghost" size="sm" onClick={() => mutation.mutate()}>
      {t('common.retry')}
    </Button>
  }
/>
```

## accessibility

See [accessibility.md](../accessibility.md#status--feedback): `role="alert"`,
renders nothing without a message, action slot app-owned.

## related

[`EmptyState`](./empty-state.md), [`ConnectionTestRow`](./connection-test-row.md).
