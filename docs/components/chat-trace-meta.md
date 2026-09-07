# ChatTraceMeta

Compact turn-trace badges (career's `TraceMeta`, generalized):
`model · duration · N tools` in a mono micro-row under an assistant
reply. Renders nothing without data. Reads a normalized view-model —
parsing `metadata_json` (or a live turn) stays app-side.

## import

```ts
import { ChatTraceMeta } from '@neuronection/assistant-ui/chat-trace-meta'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `model` | `string` | Model identifier badge (empty string ignored). |
| `durationMs` | `number` | Formatted ms below 1 s, else seconds (`1.9 s`). |
| `toolCount` | `number` | `N tools` badge (singularized; `0` ignored). |
| `className` | `string` | Extra classes (merges over the default muted mono row). |

## controlled contract

Pure presentational: badges in, badges out; no state, no callbacks.

## label / i18n contract

The only generated text is the tool count (`N tool` / `N tools`); model
and duration are data. Apps needing translated unit words should compose
their own badges instead.

## snippets

```tsx
import { ChatTraceMeta } from '@neuronection/assistant-ui/chat-trace-meta'
import type { ChatMessage } from './types'

function ReplyMeta({ message }: { message: ChatMessage }) {
  const meta = message.metadata_json
  return (
    <ChatTraceMeta
      model={meta?.model}
      durationMs={meta?.elapsed_ms}
      toolCount={Array.isArray(meta?.tools) ? meta.tools.length : undefined}
    />
  )
}
```

```tsx
<ChatTraceMeta model="gpt-5.6" durationMs={1930} toolCount={3} />
```

## accessibility

Static decorative row — plain text, nothing focusable; screen readers
read it as body text following the reply. Clean under jest-axe.

## related

[`chat-message`](./chat-message.md) (`meta` slot),
[`chat-tool-card`](./chat-tool-card.md),
[`chat-turn-status`](./chat-turn-status.md).
