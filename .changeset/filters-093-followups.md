---
'@neuronection/assistant-ui': minor
---

Filters: an include-only facet stops excluding, the compact footer can close
its sheet, the active count is announced, and a facet can withhold its counts
while they are not trustworthy. Additive except for one bug fix.

- **Fix — `allowExclude={false}`.** A plain click or Space on an inline or
  popover option used to cycle include → **exclude** on an include-only facet;
  only the row menu and Shift+Enter respected the flag. The cycle is now
  include → clear, so an include-only facet cannot produce an exclusion. The
  menu is not rendered and Shift+Enter is inert, as before, and a stale
  exclusion the host still holds stays removable from its pill.
- **`FilterRail` `footer` accepts a function.** `footer?: ReactNode |
  ((close: () => void) => ReactNode)`. In `compact` the callback closes the
  sheet (the same path as the default *Done* button, including the focus
  return to the trigger); in `rail` it is a no-op. A node footer behaves as
  before and the default footer still renders when `footer` is omitted — a
  host can now render a *Show N results* button without owning the sheet's
  internal open state.
- **The active count is a polite live region.** The rail's `activeCount` badge
  and the compact trigger's label carry `aria-live="polite"`, so a filter
  change is announced instead of silently changing the number.
- **`FilterFacet.countsState?: 'ready' | 'loading' | 'error'`** (default
  `ready`). Anything but `ready` withholds every option count — no badge, no
  `0`, and no count in the option's accessible name, since a stale number is
  worse than none; `loading` also marks the chip `aria-busy`. `ready` renders
  exactly what `0.92.0` rendered, including `0` and `≥N`.

Docs (`docs/components/filters.md`, `docs/accessibility.md`) and two Ladle
stories (`FiltersFunctionFooter`, `FiltersCountsLoading`) ship with it.
