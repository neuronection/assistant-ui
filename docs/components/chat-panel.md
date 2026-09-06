# ChatPanel

The composed chat host — the one uniform surface assembly behind the
family's three shapes. Owns layout only (header / banner / transcript /
composer / footer); every feature is an app-composed slot (ADR-006
tier 3, the `RichTextEditor` precedent).

## import

```ts
import { ChatPanel } from '@neuronection/assistant-ui/chat-panel'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `variant` | `'page' \| 'sidebar' \| 'bubble'` | page centers wide, sidebar is a dense column, bubble is the compact widget body. |
| `title` / `actions` | `ReactNode` | Header row (actions: session list, branch tree, expand, close). |
| `banner` | `ReactNode` | Status strip under the header. |
| `transcript` | `ReactNode` | Usually `<ChatTranscript …/>` — owns the flex area. |
| `composer` | `ReactNode` | Usually `<ChatComposer …/>`. |
| `footer` | `ReactNode` | Disclaimer row (health guidance…). |

## the three surfaces

```tsx
// bubble   → <ChatLauncher panel={<ChatPanel variant="bubble" … />} />
// sidepanel→ <ChatDrawer panel={<ChatPanel variant="sidebar" … />} />
// page     → route shell: <ChatSessionList/> aside + <ChatPanel variant="page" … />
```

## accessibility

Layout host — inherits the semantics of its slots; header is a plain
landmark-free row; nothing focusable of its own.

## related

[`chat-drawer`](./chat-drawer.md), [`chat-launcher`](./chat-launcher.md),
[`chat-transcript`](./chat-transcript.md), [`chat-composer`](./chat-composer.md).
