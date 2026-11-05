# assistant-ui — Agent Instructions

Shared React component library for the Assistant family (career-, study-,
health-, desktop-assistant). Published as `@neuronection/assistant-ui` on npm.
Longer-range planning notes are local-only; the tracked `docs/` are the
source of truth for workflows.

## Non-negotiable rules

1. **Never commit untested code.** `pnpm verify` (lint + typecheck + test +
   build) before every commit.
2. **Boundary (ADR-006):** presentational + controlled components only — no
   fetching, stores, router, i18n engine, or secrets. Data in, events out.
3. **React 18 + 19, Tailwind 3 + 4 are the compatibility contract.** No
   React-19-only APIs (lint bans them; CI typechecks both majors).
4. **Semantic `--as-*` tokens only** in component code; no raw colors.
   Styling hooks are tokens + `data-as-*` attributes, never class names.
5. **Two-app rule:** a component enters only when ≥2 family apps need it.
6. **Every component change ships with tests (incl. keyboard-nav + axe) and
   a Ladle story in the same PR.**
7. **Every PR that changes `src/` includes a changeset** (`pnpm changeset`).
8. **No comments in code** unless requested. Mimic existing style.
9. **Never publish from a laptop** — releases go through the Changesets flow
   (`docs/publishing.md`).

## Commands

```bash
pnpm dev            # Ladle playground :61000
pnpm watch          # watch build for live app testing (docs/local-development.md)
pnpm verify         # the gate
node scripts/dev-link.mjs link <app-dir>   # wire an app to this checkout (dev server only)
node scripts/verify-in-app.mjs <app-dir>   # run an app's test suite against a packed tarball
pnpm test:visual                          # Playwright screenshots of every Ladle story vs baselines
```

## Gotchas learned the hard way

- `pnpm dev` (its `watch:css`) rewrites `dist/styles.css` — unminified, in a
  loop — for as long as Ladle runs, and the test suite reads
  `dist/styles.css` from the PREVIOUS build (`verify` runs tests before
  build). Verifying while a Ladle session is live, or right after killing
  one, fails `tests/styles.test.ts` on the minified-CSS assertion through no
  fault of the change. Never overlap `pnpm dev` with `pnpm verify`; run
  `pnpm build` once after killing Ladle before re-verifying.
- `pnpm test:visual -- --update-snapshots` **doesn't work** — pnpm mangles
  the flag; use `pnpm exec playwright test --update-snapshots`.
- `dist/styles.css` must ship **without `@layer`s** (TW3 preflight is
  unlayered and would override library utilities) — never remove
  `scripts/unwrap-layers.mjs` from the CSS build.
- Apps need `optimizeDeps: { exclude: ["@neuronection/assistant-ui"] }` in
  their Vite config, or they serve a stale pre-bundle.
- pnpm **copies** `file:` deps; npm symlinks them — hence `dev-link` uses
  `link:` overrides for pnpm apps.
- tsup's own watch mode doesn't fire on this machine; `scripts/watch-ts.mjs`
  replaces it.
- **TW3 apps double-apply translate utilities**: the library's TW4 CSS and an
  app's TW3 CSS can emit the same `-translate-x/2` class with different
  mechanics (translate property vs transform) — overlays ended up
  off-screen once; never use translate utilities for positioning
  (`inset-0` + `m-auto`; CI test guards it).
- `pnpm build:ts` needs `NODE_OPTIONS=--max-old-space-size=8192` (already in
  the `build` script) — the DTS worker OOMs at default heap with 40+ entry
  points.
