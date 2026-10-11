---
'@neuronection/assistant-ui': minor
---

**Composer micro-interactions (plan 100 S4):** `ChatComposer` state changes now animate.

- **Send ↔ Stop morph:** the swap rotates through (−90° + fade in, `--as-duration-fast`) — only on state change, never on first mount, so pages don't animate on load. Buttons, labels and focus behavior unchanged.
- **Focus glow:** the input row's `:focus-within` affordance is now CSS-owned and token-timed (accent border + 3px primary glow ring) instead of Tailwind `focus-within:` classes — TW3 app CSS can never collide.
- **Drag-over pulse:** while files drag over the composer (`data-dragging`), a 1.4s primary drop-zone pulse runs under the existing dashed border styling.
- **Rails slide in:** the `attachments` and `suggestions` slot wrappers rise + fade on mount (`as-anim-slide-up`).

All of it is disabled under `prefers-reduced-motion: reduce` (enforced by the motion contract test). No API changes.
