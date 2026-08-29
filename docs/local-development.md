# Local development

How to develop `assistant-ui` and see changes live in the family apps —
**without publishing anything**.

## Terminal layout

```text
terminal 1  assistant-ui          pnpm watch
terminal 2  <app>                 dev server (vite)
```

`pnpm watch` rebuilds `dist/` on every save (~0.3 s: ESM only; types are
built by `pnpm build`). The app reads `dist/` live through a symlink.

## Wiring an app to the local checkout

From the library repo:

```bash
node scripts/dev-link.mjs link   ../study-assistant/frontend
node scripts/dev-link.mjs status ../study-assistant/frontend
node scripts/dev-link.mjs unlink ../study-assistant/frontend
```

What it does per package manager:

| App | Manager | Mechanism |
|---|---|---|
| study-assistant | pnpm | `overrides:` entry in the workspace `pnpm-workspace.yaml` → `link:` symlink |
| career-assistant, health-assistant | npm | dependency swapped to `file:` → npm symlinks it |

Rules:

- **Never commit the manifest edits.** Run `unlink` (and reinstall) before
  committing in the app. The lockfile also changes while linked — `unlink` +
  install reverts it.
- Run the app's install command once after `link` (and once after `unlink`).
- Prefer reproducing bugs in the Ladle playground (`pnpm dev`) when possible —
  faster loop, no app wiring.

## Required: one line in each app's Vite config

Add to the app's `vite.config.ts` (safe to commit permanently — harmless for
registry installs):

```ts
optimizeDeps: { exclude: ["@neuronection/assistant-ui"] }
```

Without it Vite pre-bundles the linked package into `.vite/deps` and serves a
**stale snapshot** — library edits silently never reach the browser.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| App doesn't reflect library edits | App not reinstalled after `link`, or Vite pre-bundle | Re-run app install; check `optimizeDeps.exclude` |
| `node_modules/@neuronection/assistant-ui` is a real directory, not a symlink | pnpm installed a `file:` dep (pnpm **copies**, unlike npm) | Must go through `dev-link` (uses `link:` overrides for pnpm) |
| Styles look broken in the app | App imports `styles.css` before its base CSS or overrides order | Import order: app CSS → `assistant-ui/styles.css` → app `theme.css` |
| Types stale in the app's editor | Watch mode builds ESM only | Run `pnpm build` in the library (rebuilds d.ts) |
| `pnpm watch` not picking changes up | An old `tsup --watch` process may be lingering | `pkill -f watch-ts.mjs` and restart |

## Final-artifact check (before risky releases)

```bash
pnpm build && pnpm pack
# in the app, temporarily:
npm i ../assistant-ui/neuronection-assistant-ui-<version>.tgz
```

This verifies the `exports` map and `files` whitelist — the symlink path
can't catch those mistakes.
