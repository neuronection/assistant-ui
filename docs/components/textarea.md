# Textarea

Multi-line counterpart of [`Input`](./input.md): label/hint/error wiring
with auto ids, `aria-invalid`, `role="alert"` errors.

## import

```ts
import { Textarea } from '@neuronection/assistant-ui/textarea'
```

## props

Extends `React.ComponentProps<'textarea'>`.

| prop | type | default | notes |
|---|---|---|---|
| `label` | `string` | — | `<label htmlFor>` bound to the textarea |
| `hint` | `string` | — | muted line under (hidden while `error` shows) |
| `error` | `string` | — | `role="alert"`, `aria-invalid` |
| `id` | `string` | auto | |
| `className` | `string` | — | merges onto the `<textarea>` (default `min-h-16`) |

## controlled contract

Standard textarea semantics (`value` + `onChange`, or uncontrolled).

## labels & i18n

`label`/`hint` are app strings.

## examples

minimal:

```tsx
<Textarea label="Notes" value={text} onChange={(e) => setText(e.target.value)} rows={5} />
```

realistic (with hint + error):

```tsx
<Textarea
  label={t('chat.systemPrompt')}
  hint={t('chat.systemPromptHint')}
  value={prompt}
  onChange={(event) => setPrompt(event.target.value)}
  error={validationError ?? undefined}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): same contract as
`Input` — `<label htmlFor>` + `aria-describedby`, `aria-invalid`, error
`role="alert"`.

## related

[`Input`](./input.md), [`AiMagicFill`](./ai-magic-fill.md).
