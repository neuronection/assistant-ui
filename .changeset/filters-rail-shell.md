---
'@neuronection/assistant-ui': minor
---

Add the vertical filter shell: `FilterSection` and `FilterRail`.

`FilterSection` is a collapsible rail section — controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`) — with a real `<button>` header whose `aria-expanded` follows the actual state and whose `aria-controls` points at the content element, an active dot plus an sr-only *filtered* label (`labels.active`) that never forces the section open, a count that renders `0` (and `≥N` via `countAtLeast`, ignored at zero so it can never read `≥0`), no badge when the count is unknown, a 44px header, an RTL-aware chevron and a `motion-reduce:transition-none` guard.

`FilterRail` is the shell and takes a required `layout`: `rail` renders a vertical `<aside>` with a title, the active count (formatted via `formatCount` and isolated in a `bdi`) and Clear all; `compact` renders a toolbar (host page-level `search` slot plus a `Filters (n)` button with `aria-haspopup="dialog"` / `aria-expanded`) that opens the same children in assistant-ui's `PanelModal`, closes on Escape and returns focus to the trigger. An unknown `activeCount` omits the badge rather than rendering `0`. A host `footer` replaces the default *Done* footer. The rail adds no sticky or scroll CSS — the app owns it.

The rail sections host the existing `FacetChip variant="inline"` row, so counts, the exclude menu, the null chip and the focus rules are the A1 implementation, not a second one. The inline row now mirrors the popover's roles (`group`/`checkbox`, `radiogroup`/`radio`) and gives its option chips and per-row menu triggers a 44px minimum at phone widths.

Count badges in both `FilterSection` and `FacetChip` now isolate their numerals with `<bdi dir="ltr">`, so `≥N` no longer reorders to `N≤` in an RTL document.
