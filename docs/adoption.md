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
- To test local library changes: dev server — in `../assistant-ui` run
  `pnpm watch` + `node scripts/dev-link.mjs link <this-app-frontend>`;
  test suite — `node scripts/verify-in-app.mjs <this-app-frontend>`
  (tarball flow; never commit linked manifests).
```

Adapt name/paths per app; commit it so every agent session in the app repo
loads it.

## Verifying before you commit an adoption PR

```bash
node scripts/verify-in-app.mjs <app-frontend-dir>
```

Builds + packs the library, runs the app's full test suite against the
tarball, then restores the app manifest and lockfile. Use dev-link
(`node scripts/dev-link.mjs link <app-dir>`) only for interactive dev
server checks — app test suites need the tarball flow (see
[local-development docs](https://github.com/neuronection/assistant-ui/blob/main/docs/local-development.md)).
