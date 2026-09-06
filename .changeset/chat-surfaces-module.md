---
'@neuronection/assistant-ui': minor
---

chat surface hosts (plan 11 L6): `ChatPanel` — the composed host behind
the family's three chat shapes (`page` / `sidebar` / `bubble` variants,
header/banner/transcript/composer/footer slots); `ChatDrawer` — the
resizable sidepanel on Radix Dialog (focus trap, Escape, drag +
keyboard resize on a `role="separator"` handle, full-screen below the
breakpoint); `ChatLauncher` — the floating bubble (aria-expanded
launcher, anchored non-modal panel, unread badge). One assembly, three
surfaces — completing the shared chat layer's module set.
