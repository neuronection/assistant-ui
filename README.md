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

## Documentation

- [Local development](./docs/local-development.md) — live-test library changes in the family apps without publishing
- [Adopting in an app](./docs/adoption.md) — the install/switchover recipe each family app follows
- [Theming](./docs/theming.md) — tokens, app themes, styling hooks
- [Publishing](./docs/publishing.md) — the Changesets release flow and CI setup
- [Adding a component](./docs/adding-a-component.md) — rules, checklist, required companions

## Components

Every module has its own entry point (`import { Menu } from
'@neuronection/assistant-ui/menu'`) and everything is re-exported from the
package root. Authoritative props for your installed version: the `.d.ts`
files in the package's `dist/`. Visual reference:
[gallery](https://neuronection.github.io/assistant-ui/).

| Module | Exports |
|---|---|
| `button` / `badge` / `card` | `Button`, `buttonVariants` · `Badge`, `badgeVariants` · `Card`, `CardHeader/Title/Description/Content/Footer` |
| `modal` / `confirmation-modal` / `form-modal` | `Modal` + parts, `modalContentVariants` · `ConfirmationModal` · `FormModal` (form-in-modal shell) |
| `popover` / `popover-button` | compound Radix `Popover` + parts · `PopoverButton` (self-contained trigger + panel, hover-open, lazy children, `closeSignal`) |
| `menu` / `context-menu` | `Menu`, `MenuTrigger/Content/Item/Separator/Label`, `ActionMenu` (items-driven) · `ContextMenu` (coordinate-anchored, `{x, y, items, onClose}`) |
| `combobox` | `Combobox`, `ComboboxMulti` — async mode (`onSearchChange` + `loading`), grouping, full keyboard nav |
| `tooltip` | `Tooltip` + parts, `InfoTooltip` |
| `wizard` | `Wizard` (steps config + `renderStep`, per-step validation gates, modal/drawer variants), `Stepper` (dots/labels) |
| `input` / `search-input` / `expandable-search` | `Input` (label/hint/error wiring) · `SearchInput` · `ExpandableSearch` |
| `check-indicator` / `selection-bar` / `view-toggle` | `CheckIndicator` (tri-state) · `SelectionBar` (bulk-select bar) · `ViewToggle` (grid/list) |
| `error-banner` / `undo-notice` / `empty-state` / `spinner` | presentational feedback: alert banner with `action` slot · undo toast · `EmptyState` · `Spinner` |
| `info-button` / `field-label` | `InfoButton` (info popover) · `FieldLabel` (label + info affordance) |
| `marquee` | `useMarquee`, `MarqueeSurface`, `MarqueeBand` (rubber-band selection) |
| `portal` / `theme-scope` / `tokens` | `Portal` · `ThemeScope` · token name lists + types |

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

Testing library changes inside a real app (no publishing needed) — full
guide in [docs/local-development.md](./docs/local-development.md):

```bash
pnpm watch                                  # library: rebuild TS + CSS on change
node scripts/dev-link.mjs link <app-dir>    # wire app (pnpm override / npm file:)
# ...run the app dev server; reload picks up library changes
node scripts/dev-link.mjs unlink <app-dir>  # restore before committing in the app
```

Releases happen via [Changesets](./CONTRIBUTING.md) — CI publishes, never a
laptop.

## License

Apache-2.0 — same as the family apps this library was extracted from.
