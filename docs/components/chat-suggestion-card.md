# ChatSuggestionCard

The family suggestion card (plan 101 P4): the standard action chip for
`ChatWelcome suggestions` and composer suggestion strips — icon + title
+ optional trailing hint, left-aligned, with a border/shadow lift on
hover (no transform utilities: TW3-safe) and a staggered entrance when
used inside the welcome suggestions container.

## import

```ts
import { ChatSuggestionCard } from '@neuronection/assistant-ui/chat-suggestion-card'
```

## props

Extends `React.ComponentProps<'button'>` (`onClick`, `disabled`,
`className`, …):

| Prop | Type | Description |
| --- | --- | --- |
| `icon` | `LucideIcon` | Leading icon. |
| `hint` | `string` | Trailing hint text, e.g. "5 min". |
| `children` | `ReactNode` | Suggestion title. |

## example (realistic)

```tsx
<ChatWelcome
  title={t('chat.welcome.title')}
  suggestions={prompts.map((prompt) => (
    <ChatSuggestionCard key={prompt.id} icon={prompt.icon} hint={prompt.hint} onClick={() => send(prompt.text)}>
      {prompt.label}
    </ChatSuggestionCard>
  ))}
/>
```

## accessibility

A real labelled button (name = the title text) — keyboard-reachable,
Enter/Space fire `onClick`; the hover lift has a visible focus
equivalent (accent border + ring). No extra ARIA needed.

## related

[`chat-welcome`](./chat-welcome.md), [`chat-composer`](./chat-composer.md),
[`empty-state`](./empty-state.md).
