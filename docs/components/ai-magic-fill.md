# AiMagicFill

"Describe it and let AI fill the form" modal built on
[`FormModal`](./form-modal.md): a prompt textarea, optional AI-generated
description block, busy/error states. The extraction API stays app-side.

## import

```ts
import { AiMagicFill } from '@neuronection/assistant-ui/ai-magic-fill'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `open` / `onOpenChange` | — | — | controlled modal state |
| `onSubmit` | `(prompt: string) => void` | — | trimmed, non-empty prompt |
| `busy` | `boolean` | `false` | submit spinner + disable |
| `error` | `string \| null` | — | `role="alert"` line |
| `title` | `string` | `'Magic Fill'` | modal title (submit label derives from it) |
| `subtitle` | `string` | `'AI-powered data extraction'` | modal description |
| `description` | `string` | — | highlighted hint block under the textarea |
| `promptLabel` | `string` | `'Describe details'` | textarea label |
| `placeholder` | `string` | `'Describe the data here…'` | |
| `submitLabel` | `string` | `` `Apply ${title}` `` | |
| `cancelLabel` | `string` | `'Cancel'` | |
| `className` | `string` | — | on the modal content |

## controlled contract

`open`/`onOpenChange` controlled; prompt text internal (cleared after
submit); submit reports via `onSubmit` and is disabled until a prompt
exists. Mapping the AI output onto your form fields is app-side.

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<AiMagicFill
  open={open}
  onOpenChange={setOpen}
  onSubmit={(prompt) => extract.mutate(prompt)}
/>
```

realistic (busy + error + hint, family pattern):

```tsx
<AiMagicFill
  open={open}
  onOpenChange={setOpen}
  title={t('health.magicFill')}
  description={t('health.magicFillHint')}
  promptLabel={t('health.describeVisit')}
  busy={extract.isPending}
  error={extract.isError ? extract.error.message : null}
  onSubmit={(prompt) => extract.mutate(prompt)}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#ai-patterns): prompt textarea +
Apply; submit disabled until a prompt exists; errors `role="alert"`.

## related

[`FormModal`](./form-modal.md), [`AiButton`](./ai-button.md).
