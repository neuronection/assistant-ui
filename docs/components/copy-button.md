# CopyButton

Icon-only clipboard button with built-in copied state (checkmark +
`data-copied`, auto-reset). Falls back to `execCommand` when the async
clipboard API is unavailable.

## import

```ts
import { CopyButton } from '@neuronection/assistant-ui/copy-button'
```

## props

Extends `React.ComponentProps<'button'>` minus `value`/`children`.

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string` | — | text to copy |
| `label` | `string` | `'Copy'` | accessible name + title |
| `size` | `number` | `14` | icon pixel size |
| `hideWhenEmpty` | `boolean` | `true` | renders nothing while `value` is empty |
| `copiedDuration` | `number` | `1500` | ms before the checkmark resets |
| `onCopied` | `() => void` | — | success callback |
| `onCopyError` | `(error: unknown) => void` | — | failure callback |
| `className` | `string` | — | merges |

## controlled contract

Copied state is internal. Events out: `onCopied` / `onCopyError`. The
button stops propagation and prevents default so it works inside clickable
rows; a parent that needs the raw click can check `event.defaultPrevented`.

## labels & i18n

`label` is the accessible name — translate it (`aria-label`/`title`).

## examples

minimal:

```tsx
<CopyButton value={apiKey} label={t('common.copy')} />
```

realistic (with side effects):

```tsx
<CopyButton
  value={inviteUrl}
  label={t('common.copyLink')}
  onCopied={() => toast.success(t('common.copied'))}
  onCopyError={(err) => setError(String(err))}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#actions): native `<button>`,
accessible name from `label`, Enter copies, `data-copied` state.

## related

[`InfoButton`](./info-button.md), [`AboutLinkList`](./about.md) (rows with
built-in copy).
