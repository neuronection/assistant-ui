# Adopting assistant-ui in an app

The recipe each family app follows. Works for React 18 + Tailwind 3
(career, health) and React 19 + Tailwind 4 (study) alike — no stack changes.

## 1. Install

```bash
pnpm add @neuronection/assistant-ui   # or: npm i @neuronection/assistant-ui
```

## 2. Import CSS (order matters)

```ts
import "@neuronection/assistant-ui/styles.css";    // tokens + components FIRST
import "./index.css";                              // app CSS second
import "./theme.css";                              // identity overrides, LAST
```

Library CSS goes **before** the app's own CSS. Both ship unlayered, so on a
Tailwind 3 app the cascade is decided by order at equal specificity — if the
app loads last, its variant utilities (e.g. `lg:relative` on a layout column)
can beat the library's base utilities (`.fixed`), and vice versa. App-last
keeps layout utilities app-owned; the library's own components are unaffected
because app utilities with the same name define the same properties.
(Tailwind 4 apps are layered, so order doesn't matter there.)

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
  from the app's i18next instance at call sites. If app tests query by
  accessible name, pass `label={t('common.info')}` etc. at those call
  sites (Phase 1 lesson from study).
- Icons: passed as props (`icon={Loader2}`).

### The Phase 1 pattern: shims + app-owned glue (ADR-006)

How study's `components/ui` became pure re-export shims:

1. **Generic UI → re-export shim.** `ui/popover.tsx` becomes
   `export { PopoverButton as Popover } from '@neuronection/assistant-ui'`
   — old import paths keep working, call-site diffs stay mechanical.
2. **App-coupled logic moves out of `ui/`, not into the library.** Study
   split these app components, each composing library primitives:
   - `ErrorBanner` (regex + router link to settings) over the library's
     presentational `ErrorBanner` (message + `action` slot)
   - `UndoDeleteNotice` (react-query mutation + cache invalidation) over
     the library's `UndoNotice` (props-driven)
   - `RenameDialog` rebuilt on `FormModal` (focus/select/trim stays app-side)
   - `useStoredView` (localStorage) moved to `lib/`; the library ships
     only the controlled `ViewToggle`
   - `AiHelperPopover`'s movable/resizable panel stayed app-side
     (`FloatingPanel`) — one consumer, two-app rule
3. **Superseded app tests are deleted** — the library's tests (keyboard
   nav + axe per component) own coverage from then on.

**Keep the shims forever, even where imports could point straight at the
package.** They are the exit hatch: replacing a shim with a local
implementation is how you undo any single library bet without touching
call sites.

### Radix behavioral notes (migrating hand-rolled overlays)

The library builds overlays on Radix; apps migrating hand-rolled
popovers/menus will hit these differences:

- **Menus open on `pointerdown`, not click.** App tests using
  `fireEvent.click(trigger)` need `fireEvent.pointerDown` (or user-event).
  Menu *items* still select on click.
- **Modal layers `aria-hidden` the rest of the app.** Toolbar/context
  menus in the library ship `modal={false}` — keep that default when
  composing.
- **Focus restore on close can blur (and cancel) content an item just
  opened** — the coordinate `ContextMenu` prevents
  `onCloseAutoFocus` for exactly this reason. If you compose menus that
  spawn inline editors with blur-cancel, verify that flow.
- **`type="search"` changes the ARIA role** (textbox → searchbox). Library
  search inputs stay `type="text"` for query compatibility.
- Hand-rolled dialogs (fixed div + backdrop onClick) should be rebuilt on
  the library `Modal`/`FormModal` during adoption — that's what makes
  "new floating closes old floating" work through Radix layering instead
  of app-wide coordination.

## 5. Drift tripwire (one-time per app)

Copy `.github/drift-audit.snippet.yml` from the library repo into the app's
`.github/workflows/` (adjust the src path). It runs weekly, opens an issue
when a local copy of a library component reappears, and comments on the
existing issue instead of duplicating it. Self-hosted Gitea + act_runner
runs the same file.

Also at each phase boundary: audit library components with only one
consumer — either confirm the roadmap says the next app adopts them, or
move them back into the app (two-app rule).

## 6. Keep updating

Dependabot (npm ecosystem, weekly, allow-listed to
`@neuronection/assistant-ui`) picks up new releases; app CI validates the
bump PR like any other. See study's `.github/dependabot.yml` for the
pattern.

## 7. Agent skill + AGENTS.md (one-time per app)

Create `.opencode/skills/<app-prefix>-assistant-ui/SKILL.md`
(`sa-`/`ca-`/`ha-` prefix per family convention). **Skills are local-only
— never committed** (family policy; the library repo's `.opencode` is
gitignored too). Copy a sibling app's skill from its local checkout as the
starting point and keep your own backups, like `dev/plans/`.

The skill makes agents treat the package as **first-party**, and encodes:

- **Check-library-first** — no local copies of library components (the
  drift audit enforces weekly); if the API doesn't fit, *change the
  library*, never fork/wrap it.
- **How to explore what's implemented** — module inventory + authoritative
  API via the installed package's `dist/*.d.ts`, the gallery for visuals,
  CHANGELOG on the library repo for what's new, `package.json` for the
  installed version.
- **Conventions** — per-module imports, `cn()`, ui/ re-export shims as the
  import path + exit hatch, `--as-*`/`data-as-*` styling, label props +
  i18n at call sites, app-coupled glue stays app-side.
- **The contribution workflow** — two-app rule, library repo rules
  (boundary, tokens, tests+axe, story, changeset), verification via
  `scripts/verify-in-app.mjs`, release via changesets, never editing
  `node_modules`.

Also add a short "Shared UI library" section to the app's `AGENTS.md`
pointing at the skill with the check-library-first rule — AGENTS.md loads
in every session; skills load on trigger.

## Verifying before you commit an adoption PR

```bash
node scripts/verify-in-app.mjs <app-frontend-dir>
```

Builds + packs the library, runs the app's full test suite against the
tarball, then restores the app manifest and lockfile. Use dev-link
(`node scripts/dev-link.mjs link <app-dir>`) only for interactive dev
server checks — app test suites need the tarball flow (see
[local-development docs](https://github.com/neuronection/assistant-ui/blob/main/docs/local-development.md)).
