# assistant-ui

Shared React component library for the **Assistant family** of apps
([career-assistant](https://github.com/neuronection/career-assistant),
[study-assistant](https://github.com/neuronection/study-assistant),
[health-assistant](https://github.com/health-assistant-io/health-assistant)).

One package, three apps: family look by default, app flavor via CSS-variable
design tokens. Works in React 18 & 19 and alongside Tailwind 3 or 4 — the
library ships **precompiled CSS**, so your app's Tailwind never compiles
library classes.

## Install

```bash
pnpm add @neuronection/assistant-ui
```

Then do exactly two things in your app entry:

```tsx
import '@neuronection/assistant-ui/styles.css'
import './theme.css' // your app's token overrides, loaded after
```

```tsx
import { Button, ConfirmationModal, Input } from '@neuronection/assistant-ui'
```

## Theming

All visuals flow through `--as-*` CSS variables. The defaults are the family
look (extracted from study-assistant); each app overrides identity tokens in a
small `theme.css`:

```css
:root {
  --as-primary: oklch(0.62 0.15 152);
  --as-radius: 0.75rem;
}
```

See [`themes/`](./themes) for per-app starting points and
`ThemeScope` for scoping tokens to a subtree. Override **tokens**, not
internal class names — class names are not API.

## Peer requirements

| Package | Range |
|---|---|
| react / react-dom | `>=18 <20` |
| lucide-react | `>=0.460 <2` |

Tailwind is **not** required — but if your app uses Tailwind 3 or 4, both work
without configuration. Do **not** add this package to your Tailwind
`content`/`@source`.

## Components

Button, Badge, Card (+Header/Title/Description/Content/Footer), Modal
(+Trigger/Header/Title/Description/Footer/Close), Popover, Tooltip +
InfoTooltip, Input, Spinner, EmptyState, ConfirmationModal, Portal,
ThemeScope, `cn()`. Full props in the
[gallery](https://neuronection.github.io/assistant-ui/) (Ladle build).

API rules: controlled-first, `className` merges (never replaces), `asChild`
where it makes sense, refs forwarded everywhere, English label props with
defaults (translate at call sites), icons as props. No fetching, no stores,
no router — data in, events out.

## Development

```bash
pnpm install
pnpm dev          # Ladle playground on :61000 (CSS watches alongside)
pnpm test --watch
pnpm verify       # lint + typecheck + test + build
```

Testing library changes inside a real app (temporary, never commit):

```jsonc
// app package.json pnpm.overrides
{ "@neuronection/assistant-ui": "link:../assistant-ui/dist" }
```

Releases happen via [Changesets](./CONTRIBUTING.md) — CI publishes, never a
laptop.

## License

Apache-2.0 — same as the family apps this library was extracted from.
