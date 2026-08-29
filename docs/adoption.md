# Adopting assistant-ui in an app

The recipe each family app follows. Works for React 18 + Tailwind 3
(career, health) and React 19 + Tailwind 4 (study) alike — no stack changes.

## 1. Install

```bash
pnpm add @neuronection/assistant-ui   # or: npm i @neuronection/assistant-ui
```

## 2. Import CSS (order matters)

In the app entry, after the app's own CSS:

```ts
import "./index.css";                              // app CSS first
import "@neuronection/assistant-ui/styles.css";    // tokens + components
import "./theme.css";                              // identity overrides, LAST
```

Start `theme.css` from `themes/<app>.css` in the library repo. Do **not**
add the package to the app's Tailwind `content`/`@source` — the CSS is
precompiled.

## 3. Vite config (one line, committable)

```ts
optimizeDeps: { exclude: ["@neuronection/assistant-ui"] }
```

Prevents Vite from pre-bundling a stale snapshot (matters for local linked
development; harmless for registry installs).

## 4. Swap components (same-commit delete rule)

For each component the library covers: **delete the local copy and import
the library version in the same commit.** No wrappers, no `// TODO migrate`.

- Start with the basics: `Button`, `Card`, `Badge`, `Spinner`, `Input`,
  `EmptyState`, `ConfirmationModal`, `Modal`, `Popover`, `Tooltip`,
  `Portal`.
- Translation: label props have English defaults — pass translated strings
  from the app's i18next instance at call sites.
- Icons: passed as props (`icon={Loader2}`).

## 5. Drift tripwire (one-time per app)

Copy `.github/drift-audit.snippet.yml` from the library repo into the app's
`.github/workflows/`. It runs weekly, opens an issue when a local copy of a
library component reappears.

## 6. Keep updating

Dependabot (npm ecosystem, weekly) picks up new releases; app CI validates
the bump PR like any other.

## 7. Agent skill (one-time per app)

Create `.opencode/skills/<app-prefix>-assistant-ui/SKILL.md`
(`sa-`/`ca-`/`ha-` prefix per family convention):

```markdown
---
name: sa-assistant-ui
description: Use when building UI in this app with @neuronection/assistant-ui — import patterns, CSS order, theming, the check-library-first rule, and how to test local library changes. Use BEFORE creating any new ui/ component or touching an existing one.
---

# Using assistant-ui in study-assistant

- Import from `@neuronection/assistant-ui` (per-module entries: `/button`,
  `/modal`, …). `cn()` is exported too.
- CSS order in the entry: app CSS → `@neuronection/assistant-ui/styles.css`
  → `./theme.css` (identity tokens — overrides only).
- Styling hooks: `--as-*` tokens and `data-as-*` attributes — never internal
  class names.
- **Check-library-first:** before writing any new shared-looking UI
  component, check the library's catalog (gallery / README). If it exists
  there, import it — do not create a local copy. Local copies of library
  components are deleted in the same commit they're replaced (drift audit
  flags regressions weekly).
- Labels: components take English-default props — pass translated strings
  from i18next at call sites.
- To test local library changes: in `../assistant-ui` run `pnpm watch` +
  `node scripts/dev-link.mjs link <this-app-frontend>`; never commit linked
  manifests (see library docs/local-development.md).
```

Adapt name/paths per app; commit it so every agent session in the app repo
loads it.

## Verifying before you commit an adoption PR

```bash
node scripts/dev-link.mjs link <this-app>     # in the library repo
```

Run the app against the local checkout (see the library's
[local-development docs](https://github.com/neuronection/assistant-ui/blob/main/docs/local-development.md)),
spot-check the swapped components visually, then `unlink` and commit against
the published version.
