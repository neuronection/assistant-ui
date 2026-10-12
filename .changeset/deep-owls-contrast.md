---
'@neuronection/assistant-ui': patch
---

**Default accent contrast (a11y):** the family blue `--as-accent` deepens from `oklch(0.55 0.16 258)` (#2d6fcd) to `oklch(0.52 0.17 258)` (#1c65c8), lifting white/tone-50 text on primary surfaces (user chat bubbles, primary buttons, links, focus rings) from 4.72:1 to **5.39:1** — WCAG AA for normal-size text with headroom. `--as-accent-strong` is unchanged and stays the darker hover tier.

**User bubble legibility:** two fixes for text inside primary user bubbles. `MarkdownSurface` no longer hard-codes `text-[var(--as-fg)]` on its root — it inherits color from its context, so user messages render in `--as-primary-fg` (white) instead of near-black text on the blue bubble; and user bubbles render `font-medium`, since 14px regular strokes read washed-out on saturated backgrounds even when the ratio passes.

Apps that brand their own accent (health-assistant overrides `--as-accent`) are unaffected by the token change. Apps consuming the default — or duplicating it, as study-assistant's palette currently does — should bump their `--primary` to `oklch(0.52 0.17 258)` to match.
