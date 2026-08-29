# Theming

The "family look" lives in CSS variables. Apps override identity tokens; the
library never hard-codes colors.

## Token architecture (two tiers)

```css
:root {
  /* raw tier — private to tokens.css */
  --as-accent: oklch(0.55 0.16 258);
  --as-tone-900: oklch(0.235 0.012 90);

  /* semantic tier — what components consume */
  --as-primary: var(--as-accent);
  --as-fg: var(--as-tone-900);
}
```

- Components reference **semantic** tokens only (`bg-[var(--as-primary)]`).
- A future dark theme re-maps raw→semantic under `prefers-color-scheme` /
  `[data-as-theme="dark"]` — additive, no component rewrites.

Key semantic tokens: `--as-primary(-fg)`, `--as-secondary(-fg)`,
`--as-surface(-raised)`, `--as-border`, `--as-fg`, `--as-muted(-fg)`,
`--as-success/warning/danger(-fg)`, `--as-ai(-fg)`, `--as-focus-ring`,
`--as-overlay`, `--as-radius(-sm/-lg)`, `--as-font-sans/mono`,
`--as-shadow-1/2/3`.

## App integration

```ts
import "./index.css";                              // app's own CSS (any Tailwind)
import "@neuronection/assistant-ui/styles.css";    // tokens + precompiled components
import "./theme.css";                              // identity overrides — loaded LAST
```

Minimal `theme.css` (`themes/` in this repo has per-app starting points):

```css
:root {
  --as-primary: oklch(0.62 0.15 152);
  --as-radius: 0.75rem;
}
```

Do **not** add this package to the app's Tailwind `content`/`@source` — the
CSS ships precompiled.

## Scoped theming

`ThemeScope` overrides tokens for a subtree (playground → "Theming" story):

```tsx
<ThemeScope tokens={{ "--as-primary": "#ff0000" }}>
  <Button>Red only in here</Button>
</ThemeScope>
```

## Styling hooks (what's API vs not)

| Hook | API? |
|---|---|
| `--as-*` token names | Yes — semver'd; renames are major |
| `data-as="button"` etc. attributes | Yes — stable selectors for tests/overrides |
| Internal utility class names | **No** — may change; overrides via tokens only |

## Why the CSS has no `@layer`

`dist/styles.css` is post-processed (`scripts/unwrap-layers.mjs`) to strip
cascade layers. Layered utilities would lose to the *unlayered* preflight of
a Tailwind 3 app (unlayered CSS always beats layered CSS), silently breaking
buttons in career/health. The stylesheet is flat: plain class selectors that
work identically under Tailwind 3, Tailwind 4, or no Tailwind at all.
