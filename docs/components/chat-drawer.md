# ChatDrawer

The resizable chat sidepanel (health's `AIDrawer` + study's resizable
sidebar, family-standard): portal overlay built on Radix Dialog (focus
trap, Escape, `role="dialog"`), drag and keyboard resize on a
`role="separator"` handle, full-screen below the breakpoint.

## import

```ts
import { ChatDrawer } from '@neuronection/assistant-ui/chat-drawer'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `open` / `onOpenChange` | | Controlled visibility. |
| `panel` | `ReactNode` | Usually `ChatPanel variant="sidebar"`. |
| `side` | `'right' \| 'left'` | Default right. |
| `width` / `onWidthChange` | `number` | Controlled px width — persist app-side (health: localStorage). Default 480. |
| `minWidth` / `maxWidth` | `number` | Resize bounds. Default 320 / 860. |
| `resizable` | `boolean` | Default true. |
| `fullScreenBreakpointPx` | `number` | Below → full-screen. Default 768. |
| `title` / `closeLabel` / `resizeLabel` | `string` | Accessible names. |
| `container` | `HTMLElement \| null` | Portal target. |

Keyboard resize: arrows ±16 px (Shift ±48) on the separator handle.

## accessibility

Radix Dialog semantics (focus trap, Escape, labelled `role="dialog"`);
the resize handle is a focusable `role="separator"` with arrow-key
resize; full-screen mode on narrow viewports keeps one escape route.

## related

[`chat-panel`](./chat-panel.md), [`chat-launcher`](./chat-launcher.md),
[`modal`](./modal.md).
