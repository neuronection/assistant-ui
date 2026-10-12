---
'@neuronection/assistant-ui': minor
---

**Surfaces (plan 100 S6):** the three surface hosts get their final motion pass, plus the chat welcome kit.

- **New `ChatWelcome`** (`@neuronection/assistant-ui/chat-welcome`) — the chat empty-state kit: a breathing `--as-ai` identity orb (default `Sparkles` icon, overridable node), greeting + subtitle, and a staggered suggestion container (children enter 40 ms apart). Densities `page | sidebar | bubble` via `data-variant`. Non-interactive by itself — suggestion controls are app markup. Intended as `ChatTranscript emptyState`.
- **`ChatLauncher`:** the panel now springs in from the launcher corner (`--as-ease-spring`, bottom transform-origin), the launcher icon ↔ close icon morph on toggle (never on first mount), and the unread badge pulses once on every value change.
- **`ChatDrawer`:** the slide-in re-curved onto the spring token (`--as-duration-spring` / `--as-ease-spring`).
- **`ChatPanel`:** the `banner` strip slides up in when it appears.
- **`as-anim-pulse-once` rework:** the one-shot attention pulse is now a box-shadow ripple (position-independent) instead of a `::after` overlay — safe on absolutely-positioned hosts like badges; visual behavior on existing consumers (interrupted chip) unchanged.

Everything is disabled under `prefers-reduced-motion: reduce` (motion contract test enforced).
