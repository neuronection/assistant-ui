# AiActionsDropdown

AI action menu with an optional custom-prompt form at the bottom: sparkle
trigger → panel of actions (icon, label, description) + custom prompt field.
Busy state disables everything; the API stays app-side.

## import

```ts
import { AiActionsDropdown, type AiAction } from '@neuronection/assistant-ui/ai-actions-dropdown'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `actions` | `AiAction[]` | — | `{ id, label, description?, icon }` (icon required) |
| `onAction` | `(action: AiAction) => void` | — | action click |
| `onPrompt` | `(prompt: string) => void` | — | omit to hide the prompt form |
| `busy` | `boolean` | `false` | disables trigger + items, `role="status"` dots |
| `error` | `string \| null` | — | `role="alert"` line |
| `label` | `string` | `'AI actions'` | trigger accessible name |
| `title` | `string` | — | panel heading + panel `aria-label` |
| `promptLabel` | `string` | `'Ask something custom'` | input accessible name |
| `promptPlaceholder` | `string` | `promptLabel` | |
| `promptSubmitLabel` | `string` | `'Send'` | submit accessible name |
| `disabled` | `boolean` | `false` | |
| `align` / `side` | — | `'end'` / `'bottom'` | popover placement |
| `className` / `panelClassName` | `string` | — | merges |

## controlled contract

Panel open state and prompt text are internal (prompt clears on submit).
Events out: `onAction`, `onPrompt`. Submitting while `busy` or empty is a
no-op.

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<AiActionsDropdown
  actions={[{ id: 'summary', label: 'Summarize', icon: FileText }]}
  onAction={(action) => run(action.id)}
/>
```

realistic (custom prompt + busy + error):

```tsx
<AiActionsDropdown
  actions={[
    { id: 'explain', label: t('ai.explain'), description: t('ai.explainHint'), icon: GraduationCap },
    { id: 'flashcards', label: t('ai.flashcards'), icon: Layers },
  ]}
  onPrompt={(prompt) => ask.mutate(prompt)}
  onAction={(action) => run.mutate(action.id)}
  busy={ask.isPending || run.isPending}
  error={error?.message ?? null}
  title={t('ai.title')}
  promptLabel={t('ai.customPrompt')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#ai-patterns): `role="menu"` with
action items; Enter submits the custom prompt; Escape closes; busy disables
the trigger.

## related

[`AiButton`](./ai-button.md), [`Menu`](./menu.md).
