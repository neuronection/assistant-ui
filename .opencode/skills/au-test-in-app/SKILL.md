---
name: au-test-in-app
description: Use when testing assistant-ui changes inside a real family app (career-, study-, health-assistant) without publishing — covers pnpm watch, scripts/dev-link.mjs link/unlink/status, the Vite optimizeDeps requirement, and troubleshooting stale-code symptoms. Use whenever library changes need visual/interaction verification beyond the Ladle playground.
---

# Test library changes in a real app

Never publish to test. The library symlinks into the app; rebuilds are live.

## Terminal layout

```text
terminal 1  assistant-ui                    pnpm watch
terminal 2  <app>                           dev server (vite)
```

`pnpm watch` rebuilds `dist/` on save (~0.3 s, ESM-only; run `pnpm build`
when an app's editor needs fresh d.ts).

## Wiring

Run from the library repo:

```bash
node scripts/dev-link.mjs link   ../study-assistant/frontend
node scripts/dev-link.mjs status ../study-assistant/frontend
node scripts/dev-link.mjs unlink ../study-assistant/frontend
```

- pnpm apps (study): `overrides:` in the workspace `pnpm-workspace.yaml`
  → real `link:` symlink. pnpm **copies** `file:` deps — never hand-write a
  `file:` dependency for a pnpm app.
- npm apps (career `frontend/`, health `core/frontend/`): dependency swapped
  to `file:` → npm symlinks it.

Then run the app's install once (workspace root for pnpm apps), and start
its dev server.

## Mandatory in each app (one line, committable)

```ts
optimizeDeps: { exclude: ["@neuronection/assistant-ui"] }
```

Without it Vite pre-bundles a stale snapshot and library edits never reach
the browser.

## Cleanup before committing in the app

`unlink` + app install restores the manifest and lockfile. **Never commit
linked manifests.** `.assistant-ui-dev-link.json` is the marker file — if
you see it, the app is linked.

## Troubleshooting

| Symptom | Fix |
|---|---|
| App doesn't see library edits | App install after link; check `optimizeDeps.exclude` |
| `node_modules/@neuronection/assistant-ui` is a real dir (not symlink) | pnpm copied a `file:` dep — redo via `dev-link` |
| `pnpm watch` not rebuilding | `pkill -f watch-ts.mjs`, restart |
| Styles broken in app | CSS import order: app CSS → `assistant-ui/styles.css` → app `theme.css` |
| Styles broken everywhere | `dist/styles.css` must contain **no `@layer`** — check `scripts/unwrap-layers.mjs` ran |

## Pre-release artifact check

```bash
pnpm build && pnpm pack
# in the app: npm i ../assistant-ui/neuronection-assistant-ui-<ver>.tgz
```

Verifies `exports` map + `files` whitelist — the symlink path can't.
