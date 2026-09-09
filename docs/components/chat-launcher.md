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
| `showClose` | `boolean` | Overlay close pinned to the panel's top-right (default `true`). Set `false` when the panel body renders its own header actions — the overlay intercepts clicks meant for top-right buttons; compose the close into those actions calling `onOpenChange(false)`. |
| `container` | `HTMLElement \| null` | Portal target. |

## accessibility

Launcher carries `aria-expanded` and swaps its label when open; the
panel is a labelled `role="complementary"` with its own close button;
Escape closes while focus is inside (non-modal by design — the page
stays usable). With `showClose={false}` keep a close affordance in the
panel's own header actions so keyboard users can still dismiss it.

## related

[`chat-panel`](./chat-panel.md), [`chat-drawer`](./chat-drawer.md).
