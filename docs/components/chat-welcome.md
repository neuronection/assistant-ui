# ChatWelcome

The chat empty-state kit (plan 100 S6): a breathing `--as-ai` identity
orb, greeting + subtitle, and staggered suggestion slots. Drop it into
`ChatTranscript emptyState` (or render it app-side above the composer).
Presentational — suggestion content and targets stay app-side.

## import

```ts
import { ChatWelcome } from '@neuronection/assistant-ui/chat-welcome'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Greeting headline, e.g. "Ask anything about your courses". |
| `subtitle` | `string` | Muted second line. |
| `suggestions` | `ReactNode` | Cards / chips inside the stagger container (`data-as="chat-welcome-suggestions"`); children enter 40 ms apart, `--as-duration-base` rise. |
| `icon` | `ReactNode` | Node inside the orb. Default: `Sparkles` in `--as-ai-fg`. |
| `variant` | `'page' \| 'sidebar' \| 'bubble'` | Density: `page` centers generously, `sidebar` is the default, `bubble` is compact. Carried as `data-variant`. |
| `className` | `string` | Merged onto the root. |

## example (realistic)

```tsx
<ChatTranscript
  items={messages}
  emptyState={
    <ChatWelcome
      title={t('chat.welcome.title')}
      subtitle={t('chat.welcome.subtitle')}
      variant="sidebar"
      suggestions={prompts.map((prompt) => (
        <SuggestionCard key={prompt.id} onClick={() => send(prompt.text)}>
          {prompt.label}
        </SuggestionCard>
      ))}
    />
  }
  …
/>
```

The orb uses `as-anim-breathe` (6 s scale/glow loop) and the whole kit
fades in via `as-anim-fade-swap`; everything is disabled under
`prefers-reduced-motion: reduce`.

## accessibility

Non-interactive by itself (no focusable elements — asserted); the
suggestion slot carries app markup, so app-owned controls keep their own
names and keyboard behavior (axe-verified with a suggestion button
inside). The orb and animations are decorative.

## related

[`chat-transcript`](./chat-transcript.md), [`chat-launcher`](./chat-launcher.md),
[`chat-panel`](./chat-panel.md), [`empty-state`](./empty-state.md).
