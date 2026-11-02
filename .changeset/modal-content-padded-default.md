---
'@neuronection/assistant-ui': minor
---

**ModalContent owns popup padding by default.** `ModalContent` gains a
`padding` variant — `'padded'` (default) renders a `p-6` frame with
`gap-4` between sections; `'none'` opts out for full-bleed dialogs
(command palettes, media, self-chromed editors). `ModalHeader`,
`ModalBody` and `ModalFooter` are now layout-only — their padding moved
into the frame.

**Migration (all apps):** delete hand-rolled `px-6 pb-6` body wrappers
and `p-6`-family padding on composed dialogs — the frame provides them;
double padding is the failure mode. Full-bleed dialogs move `p-0` /
`gap-0` overrides to `padding="none"` (existing explicit classes keep
winning via twMerge, but prefer the prop). `PanelModal` is unchanged
(it already defaulted its body padding). Docs: `modal.md` → "spacing
rhythm".
