---
'@neuronection/assistant-ui': minor
---

Add the `hover-card` module: `HoverCard` (Radix root wrapper with 150/100 ms
open/close grace defaults and the controlled-first `open`/`onOpenChange`
contract), `HoverCardTrigger` (focusable — the card opens from keyboard focus
alone), `HoverCardContent` (`data-as="hover-card"`, tokened surface, `w-72`
default width) and `HoverCardPortal`. Escape/blur close; styling rides
`--as-*` tokens only.
