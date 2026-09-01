# import and theming

How to wire `@neuronection/assistant-ui` into a family app: import paths, CSS
load order, tokens, and the styling hooks that are (and are not) public API.
Adoption step-by-step lives in [../adoption.md](../adoption.md); the token
reference in [../theming.md](../theming.md).

## import paths (three layers)

Every module ships a subpath entry point and is re-exported from the root:

```ts
// 1. subpath — one module, smallest graph
import { ModelRegistry } from '@neuronection/assistant-ui/model-registry'

// 2. root barrel — everything
import { Button, Card, Modal } from '@neuronection/assistant-ui'
```

```tsx
// 3. the app's own re-export shim (family policy)
import { Button } from '@/components/ui/button'
```

The shim layer (`frontend/src/components/ui/*` in each app) is a one-line
re-export of the package:

```ts
export { Button, buttonVariants } from '@neuronection/assistant-ui'
```

Family policy: **apps import from their shims**, and the shims stay even where
a direct import would work. They are the exit hatch — replacing one shim with
a local implementation undoes any single library bet without touching call
sites. Docs (including the per-module pages under [docs/components/](../components/button.md))
show the raw package import; translate it to your shim path at call sites.

Two glue rules:

- An app file that shadows a library export name must import from
  `'@neuronection/assistant-ui'` directly, not via the app barrel — or the
  drift audit flags it (`docs/adding-a-component.md` rule 11).
- Never edit anything inside `node_modules`. If the API doesn't fit, change
  the library.

## setup checklist

1. `pnpm add @neuronection/assistant-ui` (peer deps: React 18/19,
   lucide-react).
2. Import the stylesheet **before** the app's own CSS, and the theme last:

   ```ts
   import '@neuronection/assistant-ui/styles.css' // tokens + precompiled components FIRST
   import './index.css'                           // app CSS (any Tailwind) second
   import './theme.css'                           // identity overrides LAST
   ```

   Order matters on Tailwind 3 apps: both bundles ship unlayered, so at equal
   specificity the cascade is decided by load order. App-last keeps layout
   utilities app-owned. Tailwind 4 apps are layered, so the order is less
   strict there — keep the same order anyway so the recipe is identical.
3. Vite: exclude the package from dep pre-bundling, or Vite serves a stale
   snapshot (this bites during linked local development):

   ```ts
   export default defineConfig({
     optimizeDeps: { exclude: ['@neuronection/assistant-ui'] },
   })
   ```

4. Do **not** add the package to the app's Tailwind `content`/`@source` —
   `styles.css` is precompiled (and stripped of `@layer`s so TW3 preflight
   can't override it).
5. Create `theme.css` (start from `themes/<app>.css` in the library repo) and
   re-map only identity tokens.
6. Compatibility contract: React 18 **and** 19, Tailwind 3 **and** 4. The
   library never compiles against your Tailwind and ships no React-19-only
   APIs.

## the `--as-*` token system

Two tiers (see [../theming.md](../theming.md)):

- **raw tier** (private): `--as-tone-*`, `--as-accent`, `--as-success`,
  `--as-warning`, `--as-danger`, `--as-ai`.
- **semantic tier** (what components consume): `--as-primary(-fg)`,
  `--as-secondary(-fg)`, `--as-surface(-raised)`, `--as-border`, `--as-fg`,
  `--as-muted(-fg)`, `--as-success/warning/danger-fg`, `--as-ai-fg`,
  `--as-focus-ring`, `--as-overlay`, `--as-z-modal` / `--as-z-popover`,
  `--as-radius(-sm/-lg)`, `--as-font-sans/mono`, `--as-shadow-1/2/3`.

Components reference semantic tokens only. Apps re-map the semantic tier in
`theme.css` to get their identity; dark mode is the same move under `.dark` /
`[data-as-theme="dark"]` — no component rewrites:

```css
:root {
  --as-primary: oklch(0.62 0.15 152);
  --as-radius: 0.75rem;
}
.dark {
  --as-surface: var(--as-tone-900);
  --as-fg: var(--as-tone-50);
}
```

Raise `--as-z-modal` / `--as-z-popover` (default 50) when app chrome sits
above library overlays. For a subtree-local flavor, `ThemeScope` sets tokens
via inline style (see [../components/theme-scope.md](../components/theme-scope.md)).

## styling hooks: what's API vs not

| hook | API? | notes |
|---|---|---|
| `--as-*` token names | yes | semver'd; renames are major |
| `data-as="<module>"` on roots | yes | stable test/override selector (`data-as="button"`) |
| `data-as-*` state attributes | yes | e.g. `data-status="fail"` on `ConnectionTestRow`, `data-as-cap="vision"` + `data-active` on `CapabilityChips`, `data-dragging` on `UploadDropzone` |
| internal utility class names | **no** | may change; style via tokens/`data-as-*` only |

Example: target a failing connection row without knowing class names:

```css
[data-as='connection-test-row'][data-status='fail'] {
  /* app-side extra emphasis, if you must */
}
```

## local development loop

`node scripts/dev-link.mjs link <app-dir>` wires an app to this checkout
(dev server only; pnpm copies `file:` deps, so the script uses `link:`
overrides). App test suites use the tarball flow instead:
`node scripts/verify-in-app.mjs <app-dir>`. Details in
[../local-development.md](../local-development.md).
