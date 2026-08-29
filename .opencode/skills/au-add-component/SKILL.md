---
name: au-add-component
description: Use when adding or modifying a component in assistant-ui — covers the boundary rules, forwardRef/cn/asChild conventions, token usage, required companions (tests with keyboard-nav + axe, Ladle story, changeset), per-module entry wiring, and the verify gate. Use BEFORE writing any component code in src/.
---

# Add / modify a library component

## Gate first

- **Two-app rule:** needed by ≥2 family apps? If not, stop — propose adding
  it to the decide-and-record list instead.
- **Boundary (ADR-006):** presentational + controlled only. No fetching,
  stores, router, i18n engine, API keys. Data in, events out.
- **Compat:** no React-19-only APIs (`use`, `useActionState`, ref-as-prop) —
  React 18 + Tailwind 3 apps consume this library. Lint bans them; CI
  typechecks both React majors.

## Component conventions

1. `React.forwardRef` on every DOM-emitting component
   (`React.ComponentProps<'button'>` etc. for prop types).
2. `className` merges: `cn(internal, className)` — never replaces.
3. `asChild` via `@radix-ui/react-slot` where composition matters.
4. Controlled-first: `value` + `onValueChange`; `defaultValue` if cheap.
5. Only semantic tokens: `bg-[var(--as-primary)]`,
   `rounded-[var(--as-radius)]` — never raw colors. Missing token? Add it to
   `src/tokens/tokens.css` (semantic tier, fed by the raw tier) and
   `src/tokens/tokens.ts`.
6. `data-as="<component>"` attribute on the root (stable styling hook).
7. Label strings via props with English defaults — apps translate at call
   sites. Icon props: `icon?: LucideIcon` with conservative defaults.
8. Radix primitives for overlays (dialog/popover/tooltip/combobox) — never
   hand-roll focus traps.

## File wiring

```
src/components/<name>/<Name>.tsx
src/components/<name>/index.ts          public re-exports
```

- `src/index.ts` — add exports
- `package.json` `exports` map + `tsup.config.ts` entry (per-module entry)
- `scripts/audit-usage.mjs` — add names the drift audit should catch

## Required companions (same PR)

- **Tests** `tests/<name>.test.tsx`: render + interaction + **keyboard-nav**
  assertions (Tab/Escape/Enter — keyboard tests are never deferred) +
  `axe` no-violations check (pattern: existing tests).
- **Story** `playground/<name>.stories.tsx` — the gallery is the design
  review surface.
- **Changeset** (`pnpm changeset`): minor for a new component / new optional
  prop; patch for fixes; major for breaking API/DOM/token renames.

## Gate

```bash
pnpm verify        # lint + typecheck + test + build — all must pass
```

If it replaces existing app components: verify live in an app via
`au-test-in-app`, and remember the app-side same-commit delete rule.
