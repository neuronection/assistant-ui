---
name: au-test-in-app
description: Use when testing assistant-ui changes inside a real family app (career-, study-, health-assistant) without publishing — covers scripts/verify-in-app.mjs (tarball flow for app test suites), pnpm watch + scripts/dev-link.mjs (dev server), the Vite optimizeDeps requirement, and troubleshooting stale-code symptoms. Use whenever library changes need verification beyond the Ladle playground.
---

# Test library changes in a real app

Never publish to test.

## Two paths, pick by intent

| You want to… | Use |
|---|---|
| Run the app's **test suite** against local library changes | `node scripts/verify-in-app.mjs <app-frontend-dir>` (tarball flow) |
| Click around the app's **dev server** with live rebuilds | `pnpm watch` + `dev-link` (symlink flow) |

**App test suites must use the tarball flow.** Under pnpm, `dev-link`'s
`link:` override makes library internals (Radix, lucide) resolve their own
react/react-dom copies → app vitest dies with "invalid hook call / more
than one copy of React". App-side aliases + `deps.inline` only paper over
parts of it; don't chase that rabbit hole — use the script.

## Tarball flow (test suites, pre-release checks)

```bash
node scripts/verify-in-app.mjs ../study-assistant/frontend   # build+pack+test+restore
node scripts/verify-in-app.mjs ../career-assistant/frontend --test "npm test"
node scripts/verify-in-app.mjs <app> --keep                  # leave installed for iterating
```

One command: `pnpm build` + `pnpm pack`, installs the tarball into the
app, runs the app's suite, then restores manifest + lockfile and
reinstalls. Gotchas if doing it manually:

- **pnpm skips re-resolution when a `file:` spec is unchanged** — remove +
  re-add (or bump version) to pick up a repacked tarball.
- npm apps: `npm i --no-save <tgz>` avoids manifest mutation entirely.
- Never commit a manifest pointing at a tarball.

## Dev-server flow (interactive)

```text
terminal 1  assistant-ui                    pnpm watch
terminal 2  <app>                           dev server (vite)
```

`pnpm watch` rebuilds `dist/` on save (~0.3 s, ESM-only; run `pnpm build`
when an app's editor needs fresh d.ts).

Wiring, from the library repo:

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
| App tests: "invalid hook call / two Reacts" under dev-link | Expected — use `verify-in-app.mjs` (tarball flow) |
| App doesn't see library edits (dev server) | App install after link; check `optimizeDeps.exclude` |
| Repacked tarball not picked up | pnpm cached the `file:` spec — remove + re-add or bump version |
| `node_modules/@neuronection/assistant-ui` is a real dir (not symlink) | pnpm copied a `file:` dep — redo via `dev-link` |
| `pnpm watch` not rebuilding | `pkill -f watch-ts.mjs`, restart |
| Styles broken in app | CSS import order: app CSS → `assistant-ui/styles.css` → app `theme.css` |
| Styles broken everywhere | `dist/styles.css` must contain **no `@layer`** — check `scripts/unwrap-layers.mjs` ran |
