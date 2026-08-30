# Contributing to assistant-ui

Internal library for the Assistant family (career-, study-, health-assistant).
External contributions are welcome but scoped to the family's needs — this is
not a general-purpose design system.

## Ground rules

- **Boundary (ADR-006):** presentational, controlled components only. No
  fetching, no stores, no router, no i18n engine, no API keys. Data in,
  events out — no exceptions, or the boundary dissolves.
- **Two-app rule:** a component graduates into the library only when at least
  two family apps need it. Proposals open an issue with the component
  proposal template first.
- **React 18 + 19, Tailwind 3 + 4 compatibility is the contract.** No
  React-19-only APIs (`use`, `useActionState`, ref-as-prop) — CI typechecks
  against both majors and the lint config bans the known offenders. App
  Tailwind must never compile library classes.
- **Tokens, not colors:** components reference `--as-*` semantic tokens; raw
  palette values never appear in component code.
- **Styling hooks are tokens and `data-as-*` attributes**, never internal
  class names.
- **Tests ship with the component:** render + interaction + keyboard-nav
  assertions + jest-axe, in the same PR. Keyboard tests are not deferred.
  The documented contract lives in [docs/accessibility.md](./docs/accessibility.md).
- **Every story needs a Ladle story** in `playground/` — the gallery is the
  review surface for design changes, and CI screenshots every story
  (`pnpm test:visual`). Intentional pixel changes update the baselines in the
  same reviewed PR: `pnpm exec playwright test --update-snapshots` and commit
  `tests/visual/__screenshots__/`. The job also fails if the story count drops
  below its floor, so a broken stories glob can't ship an empty gallery again.

## Workflow

1. Branch, code, add/update stories and tests
   ([adding a component](./docs/adding-a-component.md)).
2. `pnpm verify` (lint + typecheck + test + build).
3. Add a changeset: `pnpm changeset` — patch / minor / major per
   [publishing](./docs/publishing.md) discipline.
4. Test in a real app via the [local dev loop](./docs/local-development.md).
5. PR; CI must be green (incl. the React×Tailwind smoke matrix).
6. Merging to `main` triggers the Changesets version PR; merging that
   publishes to npm with provenance. Nobody publishes from a laptop.

## App adoption rules (for the three apps)

When the library covers a local component: **delete the local copy and import
the library version in the same commit.** No `// TODO migrate`, no thin local
wrappers. Each app runs the weekly drift-audit workflow (snippet in
`.github/drift-audit.snippet.yml`) that opens an issue when a local copy
reappears.
