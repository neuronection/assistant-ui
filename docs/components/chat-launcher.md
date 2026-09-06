# ChatLauncher

The floating chat bubble (career's `ChatWidget` launcher, family
standard): fixed launcher button opening an anchored, non-modal panel
(`role="complementary"`), with badge support and Escape-to-close while
focus is inside the panel.

## import

```ts
import { ChatLauncher } from '@neuronection/assistant-ui/chat-launcher'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `panel` | `ReactNode` | Usually `ChatPanel variant="bubble"`. |
| `open` / `defaultOpen` / `onOpenChange` | | Controlled-first visibility. |
| `position` | `'bottom-right' \| 'bottom-left'` | Default bottom-right. |
| `label` / `closeLabel` | `string` | Launcher accessible names. |
| `badge` | `number \| string` | Unread/activity pill (hidden for 0/empty). |
| `icon` / `closeIcon` | `LucideIcon` | Defaults MessageCircle / X. |
| `container` | `HTMLElement \| null` | Portal target. |

## accessibility

Launcher carries `aria-expanded` and swaps its label when open; the
panel is a labelled `role="complementary"` with its own close button;
Escape closes while focus is inside (non-modal by design — the page
stays usable).

## related

[`chat-panel`](./chat-panel.md), [`chat-drawer`](./chat-drawer.md).
