---
'@neuronection/assistant-ui': minor
---

ChatLauncher: new `showClose` prop (default `true`). Set it to `false`
when the panel body renders its own header actions — the overlaid
close button pinned to the panel's top-right corner intercepted clicks
meant for top-right header buttons (career's bubble panel: the
"New chat" action was unclickable with a mouse). Compose the close
into the header actions via `onOpenChange(false)` instead.
