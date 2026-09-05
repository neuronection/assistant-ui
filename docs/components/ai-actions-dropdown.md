# AiActionsDropdown

AI action menu with an optional custom-prompt form at the bottom: sparkle
trigger → panel of actions (icon, label, description) + custom prompt field.
Busy state disables everything; the API stays app-side.

**Split-button mode** — pass `primaryAction` to render a split-button: the
main segment runs the primary action directly (accessible name = its visible
label, override with `primaryLabel`); a chevron segment opens the panel with
the remaining actions (the primary action is excluded automatically; name it
with `moreLabel`, default `'More AI actions'`).

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
| `label` | `string` | `'AI actions'` | trigger accessible name (icon-only mode) |
| `title` | `string` | — | panel heading + panel `aria-label` |
| `promptLabel` | `string` | `'Ask something custom'` | input accessible name |
| `promptPlaceholder` | `string` | `promptLabel` | |
| `promptSubmitLabel` | `string` | `'Send'` | submit accessible name |
| `disabled` | `boolean` | `false` | |
| `align` / `side` | — | `'end'` / `'bottom'` | popover placement |
| `className` / `panelClassName` | `string` | — | merges |
| `primaryAction` | `AiAction` | — | enables split-button mode |
| `primaryLabel` | `string` | `primaryAction.label` | main-segment accessible name override |
| `moreLabel` | `string` | `'More AI actions'` | chevron accessible name |

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

split-button (primary action + dropdown of the rest):

```tsx
<AiActionsDropdown
  actions={actions}
  primaryAction={actions[0]}
  onAction={(action) => run(action.id)}
  title="AI tools"
  moreLabel={t('ai.moreActions')}
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
the trigger. In split-button mode the main segment's accessible name is its
visible label and the chevron is a separate `aria-expanded` button, so both
are reachable and distinguishable by name.

## related

[`AiButton`](./ai-button.md), [`Menu`](./menu.md).
