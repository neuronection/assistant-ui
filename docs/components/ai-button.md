# AiButton

"Ask AI" affordance: a pill trigger opening a prompt panel with suggestion
chips, submit button, loading/error lines and an `onResponse` slot for
streamed/returned content. The API call stays app-side (`onSubmit` out).

## import

```ts
import { AiButton } from '@neuronection/assistant-ui/ai-button'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `onSubmit` | `(prompt: string) => void` | — | trimmed, non-empty prompt |
| `suggestions` | `string[]` | `[]` | chips above the input; clicking submits |
| `onResponse` | `ReactNode` | — | app-rendered answer slot inside the panel |
| `loading` | `boolean` | `false` | `role="status"` line (`loadingLabel`), input/submit disable |
| `error` | `string \| null` | — | `role="alert"` line |
| `label` | `string` | `'Ask AI'` | trigger accessible name (+ visible text) |
| `promptLabel` | `string` | `'Ask a question'` | input accessible name + fallback placeholder |
| `submitLabel` | `string` | `'Send'` | submit button accessible name |
| `loadingLabel` | `string` | `'Thinking…'` | |
| `placeholder` | `string` | `promptLabel` | |
| `disabled` | `boolean` | `false` | |
| `open` / `defaultOpen` / `onOpenChange` | — | — | controlled panel state |
| `showLabel` | `boolean` | `true` | `false` = icon-only pill |
| `closeOnSubmit` | `boolean` | `false` | `true` for form-fill flows; Q&A keeps it open |
| `side` / `align` | — | `'bottom'` / `'end'` | popover placement |
| `className` / `panelClassName` | `string` | — | merges |

## controlled contract

Prompt text is internal (cleared on submit). Panel open state: internal or
controlled — in controlled mode the library never closes on its own; with
`closeOnSubmit` it reports the close and the app decides. Submitting while
`loading` is a no-op.

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<AiButton onSubmit={(prompt) => ask(prompt)} />
```

realistic (suggestions + controlled open + rendered answer):

```tsx
<AiButton
  open={open}
  onOpenChange={setOpen}
  suggestions={[t('ai.summarize'), t('ai.quizMe')]}
  loading={isPending}
  error={error?.message ?? null}
  onResponse={answer ? <Markdown text={answer} /> : null}
  onSubmit={(prompt) => ask.mutate(prompt)}
  label={t('ai.ask')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#ai-patterns): dialog panel;
loading `role="status"`; error `role="alert"`; Enter submits and clears;
suggestion chips are buttons; controlled `open` defers closing to the app.

## related

[`AiActionsDropdown`](./ai-actions-dropdown.md),
[`AiMagicFill`](./ai-magic-fill.md).
