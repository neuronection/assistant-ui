# Adding a component

Checklist for landing a new component in the library.

## Before you build

- **Two-app rule**: is it needed by ≥2 family apps? If it exists in only one
  app, it belongs on the "decide-and-record" list (see
  `dev/plans/03-component-catalog.md` locally) until a second app needs it.
- **Boundary (ADR-006)**: presentational + controlled only. No fetching, no
  stores, no router, no i18n engine, no API keys. Data in, events out.
- **React 18 + Tailwind 3/4 compatibility**: no React-19-only APIs (banned by
  lint), no assumptions about the app's Tailwind.

## Implementation rules

1. `forwardRef` on every DOM-emitting component.
2. `className` merges via `cn(internal, className)` — never replaces.
3. `asChild` (Radix Slot) where composition matters.
4. Controlled-first: `value` + `onValueChange`; `defaultValue` if cheap.
5. Semantic `--as-*` tokens only — no raw colors in component code.
6. `data-as="<component>"` attribute on the root element.
7. Label/button strings via props with English defaults (apps translate at
   call sites; all three apps use i18next).
8. Icons via props (`icon?: LucideIcon`) with conservative defaults.
9. **No `-translate-x/y-*` utilities for overlay positioning.** On Tailwind 3
   apps those class names also resolve through the app stylesheet
   (transform-based) and double-apply with the library's translate-property
   version — center with `inset-0` + `m-auto` instead (guarded by a CI test).
10. **Overlay z-index goes through tokens** (`z-[var(--as-z-modal)]` /
    `z-[var(--as-z-popover)]`) — never a literal, so apps can restack.
11. App-glue files that shadow a library export name must import from
    `'@neuronection/assistant-ui'` **directly** (not via the app barrel) or
    the drift audit flags them.

## File layout

```
src/components/<name>/
├── <Name>.tsx
└── index.ts        (public re-exports)
```

Then wire it up:

- `src/index.ts` — add exports
- `package.json` `exports` + `tsup.config.ts` entry (per-module entry point)
- `scripts/audit-usage.mjs` — add the names drift-audit should catch

## Required companions (same PR)

- **Tests** (`tests/<name>.test.tsx`): render + interaction + **keyboard-nav
  assertions** + jest-axe. Keyboard tests are not deferred to later.
- **Matrix row** in [docs/accessibility.md](./accessibility.md): the
  documented contract may not promise anything the tests don't assert —
  write the test first, the doc row second.
- **Ladle story** (`playground/<name>.stories.tsx`): the gallery is the
  review surface for design — and CI screenshots it. New or intentionally
  changed stories need refreshed baselines in the same PR:
  `pnpm exec playwright test --update-snapshots`, commit
  `tests/visual/__screenshots__/`.
- **Docs page** (`docs/components/<name>.md`): purpose, import line, props
  table (derive it from the component's Props interface — never invent),
  controlled contract, label/i18n contract, minimal + realistic snippets,
  accessibility link, related modules. See an existing page (e.g.
  [`docs/components/button.md`](./components/button.md)) as the template.
  The docs coverage check (`scripts/check-docs.mjs`, part of `pnpm verify`)
  fails when the page, the README row, the story or the accessibility row
  is missing.
- **Changeset** (`pnpm changeset`): minor for the new component.

## Verify

```bash
pnpm verify          # lint + typecheck + test + build
pnpm test:visual     # pixel-diffs every story against committed baselines
```

Check the component in a real app via the [local dev loop](./local-development.md)
before merging, especially if it replaces an existing app component
(same-commit delete rule).

## After a component replaces app-local copies

When apps adopt it: the app PR **deletes the local copy and imports the
library in the same commit**. No wrappers, no TODOs. The weekly drift-audit
workflow in each app (snippet: `.github/drift-audit.snippet.yml`) catches
regressions.
