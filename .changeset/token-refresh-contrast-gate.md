---
'@neuronection/assistant-ui': minor
---

Refresh the default elevation tokens to softer two-layer ambient+key shadows
(`--as-shadow-1..3` — lower alpha, wider ambient spread: a calmer "floating
surface" feel) and deepen `--as-success` from oklch(0.62 0.15 152) to
oklch(0.55 0.15 152) so white `--as-success-fg` text meets WCAG AA (4.51:1,
was 3.41:1). A new automated contrast gate (`tests/tokens-contrast.test.ts`)
converts the light `:root` tokens OKLCH → sRGB → WCAG relative luminance and
asserts every fg/background text pair stays at 4.5:1 or better, so future
token edits cannot silently regress accessibility. Components consume the
tokens — no API changes; apps that re-map these tokens in their own
`theme.css` are unaffected until they adopt the new defaults.
