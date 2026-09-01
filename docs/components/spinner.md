# Spinner

Loading indicator. Without `label` it is `aria-hidden` decoration (pair
with visible text); with `label` it becomes a `role="status"` live region
announcing the text.

## import

```ts
import { Spinner } from '@neuronection/assistant-ui/spinner'
```

## props

Extends `React.ComponentProps<'span'>`.

| prop | type | default | notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 14px / 16px / 24px |
| `label` | `string` | — | when set: `role="status"` + `aria-live="polite"` + sr-only text |
| `className` | `string` | — | merges |

## controlled contract

None — presentational; mount/unmount is app state.

## labels & i18n

`label` is an app string (e.g. `t('common.loading')`).

## examples

minimal:

```tsx
<Spinner size="sm" />
```

realistic (announcing, library pattern):

```tsx
{isPending ? (
  <p className="flex items-center gap-2 text-sm text-[var(--as-muted-fg)]">
    <Spinner />
    {t('common.loading')}
  </p>
) : null}
```

## accessibility

See [accessibility.md](../accessibility.md#status--feedback): `aria-hidden`
without a label; `role="status"` + `aria-live="polite"` with one.

## related

[`Button`](./button.md) (`loading`), [`ConnectionTestRow`](./connection-test-row.md).
