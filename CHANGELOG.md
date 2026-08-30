# @neuronection/assistant-ui

## 0.7.0

### Minor Changes

- [`8022462`](https://github.com/neuronection/assistant-ui/commit/80224625682e6f59b1d40e2622f4935a50494063) Thanks [@constLiakos](https://github.com/constLiakos)! - Phase-4 file-attachment surface (presentational; upload controllers stay
  app-side): `UploadDropzone` (block/row variants, drag events + file-picker
  results out via `onFiles`, optional folder picker, uploading state),
  `FileCard` (name/size/status/thumbnail, remove, include-in-processing
  toggle) and `FileQueue` (aggregate summary, drag-to-reorder intent via
  `onReorder(fromId, toId)`).

- [`58445ab`](https://github.com/neuronection/assistant-ui/commit/58445ab109ec5c9dce8073b04b9f780f11d8ad50) Thanks [@constLiakos](https://github.com/constLiakos)! - Phase-4 settings-trio blocks (part 2): `ModelPicker` (grouped, searchable
  provider → model combobox with capability chips) and
  `TaskAssignmentPicker` (task → model mapping rows with inline pickers and
  clear buttons). `ComboboxOption` gains an optional `badge` chip.

### Patch Changes

- [`6202ef0`](https://github.com/neuronection/assistant-ui/commit/6202ef0957e2edaaecdd9dce8aa8d25ca5d65344) Thanks [@constLiakos](https://github.com/constLiakos)! - Fix the package-root re-exports for `SettingsShell`, `ProviderForm` and
  `ConnectionTestRow` (missing from `index.d.ts` in 0.6.0 — the per-module
  entry points `/settings-shell`, `/provider-form`, `/connection-test-row`
  were unaffected).

## 0.6.0

### Minor Changes

- [`fc350c6`](https://github.com/neuronection/assistant-ui/commit/fc350c6a684eb85dd5ef18a73af5c0d1a368b315) Thanks [@constLiakos](https://github.com/constLiakos)! - New `AiMagicFill` (describe-in-words prompt modal over `FormModal`, with
  busy/error states — the app applies the extracted data) and a `Textarea`
  primitive with the same label/hint/error wiring as `Input`.

- [`048e70a`](https://github.com/neuronection/assistant-ui/commit/048e70abfcaa349b8e61193ac85961ca834ca8b1) Thanks [@constLiakos](https://github.com/constLiakos)! - Phase-4 settings-trio blocks (part 1): `SettingsShell` (controlled two-pane
  nav — router/store stay app-side), `ProviderForm` (name/base URL plus a
  **write-only** masked API-key field; keyring stays app-side, ADR-006) and
  `ConnectionTestRow` (idle/testing/ok/fail + latency presentation; the ping is
  app-side). `Input`'s `label`/`hint` now accept ReactNode.

## 0.5.0

### Minor Changes

- [`59c5f5a`](https://github.com/neuronection/assistant-ui/commit/59c5f5a545f230c88e11b056088bfbbf991dd5a8) Thanks [@constLiakos](https://github.com/constLiakos)! - Phase-4 assistant patterns: new `AiButton` (sparkles trigger + popover with
  suggestion chips, typed prompt, loading/error state and an `onResponse` render
  slot — the app owns the API call) and `AiActionsDropdown` (action list +
  optional custom prompt, `onAction`/`onPrompt` callbacks). `AiBadge` folds into
  the existing `Badge variant="ai"` instead of a new component; health's live
  task-monitor AIBadge stays app-side (store-coupled, ADR-006).

### Patch Changes

- [`8df2f7a`](https://github.com/neuronection/assistant-ui/commit/8df2f7ad0baee8649e73318857a2c9d9baa6354c) Thanks [@constLiakos](https://github.com/constLiakos)! - `ChipList`/`ChipVariant`: add an `info` variant (accent tint) — health's
  taxonomy chips use it.

- [`2b3da08`](https://github.com/neuronection/assistant-ui/commit/2b3da0894dc56fa6814a083ba0700692a0b70cfb) Thanks [@constLiakos](https://github.com/constLiakos)! - `Table`'s `emptyText` is opt-in now: an empty table renders no filler row
  unless `emptyText` is provided (health-assistant shows nothing for empty
  tables; pass `emptyText` to keep the previous default-row behavior).

- [`8cce666`](https://github.com/neuronection/assistant-ui/commit/8cce666585b7a7cb4553c1c34e359d9fdaaa3c82) Thanks [@constLiakos](https://github.com/constLiakos)! - Overlay stacking is token-driven: new `--as-z-modal` and `--as-z-popover`
  (default 50, see `tokens.css`) replace the hardcoded `z-50` on modal,
  popover, menu, combobox, tooltip and wizard surfaces. Apps with high-z chrome
  (health's sidebar at z-950) raise them in `theme.css`. Also: for Tailwind 3
  apps, import `styles.css` **before** the app's own CSS so app variant
  utilities (`lg:relative` vs a library `.fixed`) win the cascade.

## 0.4.0

### Minor Changes

- [`5b2ff4c`](https://github.com/neuronection/assistant-ui/commit/5b2ff4cc6304c90fa8b15497fd554fd0a14ced21) Thanks [@constLiakos](https://github.com/constLiakos)! - Phase-3 groundwork for health-assistant adoption: `FormModal` gains
  `headerActions`, `onReject`/`rejectLabel`, `hideFooter` and `bodyClassName`
  (health's HITL flows need them); new `CopyButton` (clipboard with legacy
  fallback, copied state, `onCopied`/`onCopyError` callbacks — apps own
  toasts/i18n) and `Breadcrumbs` (router-free: `linkComponent` prop for SPA
  links); `themes/health.css` now matches health's real blue-600 accent with a
  `.dark` token block for its class-based dark mode. New `PanelModal`:
  header (icon/title/actions/close) + scrollable body + sticky footer,
  full-screen on mobile — the shared shape both career and health used as
  their hand-rolled `Modal`. `DatePicker` gains `variant="unstyled"` for
  inline dense usage.

## 0.3.0

### Minor Changes

- [`e8a56d3`](https://github.com/neuronection/assistant-ui/commit/e8a56d33427fc2e8e03784fe7959037f24efb95a) Thanks [@constLiakos](https://github.com/constLiakos)! - Add the six components career-assistant's Phase-2 adoption needs, all shared
  with health-assistant (catalog T1): `ChipInput`, `ChipList` (superset with
  variants + clickable chips), `Table` (tokenized, with empty state), `RangeBar`
  (with optional `label`/`valueLabel`), `ScaleSlider` (+ `scaleColorForValue`),
  and `DatePicker` (Radix popover calendar with days/months/years views, min/max,
  allowClear, and a roving-tabindex arrow-key day grid — an a11y upgrade over
  both app copies). New dependency: `date-fns`.

### Patch Changes

- [`e5252f2`](https://github.com/neuronection/assistant-ui/commit/e5252f26d6f8732a2f5ba4a3fe849b4df50b30c2) Thanks [@constLiakos](https://github.com/constLiakos)! - Ship CHANGELOG.md inside the published package so consuming apps (and their agents) can read what changed without visiting GitHub.

## 0.2.0

### Minor Changes

- [`ec2a8bf`](https://github.com/neuronection/assistant-ui/commit/ec2a8bf7d49bb96435990e9b8cca4d74fc31748b) Thanks [@constLiakos](https://github.com/constLiakos)! - Phase 1: 16 new modules for study-assistant full adoption

  - PopoverButton: self-contained trigger+panel popover on Radix (hover-open, lazy children, closeSignal, controlled mode)
  - InfoButton + FieldLabel: info affordances with popover help
  - Menu: Radix DropdownMenu primitives (Menu, MenuItem, MenuContent…) + items-driven ActionMenu
  - ContextMenu: coordinate-anchored menu with full Radix keyboard/typeahead semantics
  - Combobox + ComboboxMulti: WAI-ARIA listbox pattern, grouping, async mode (onSearchChange + loading), multi-select, clearable
  - FormModal: form-in-modal shell (submit/cancel/busy/disabled) on Modal primitives
  - Wizard + Stepper: wizard state machine with per-step validation gates, modal and drawer variants; dots/labels steppers
  - Ported from study-assistant ui/: CheckIndicator, SearchInput, ExpandableSearch, SelectionBar, ViewToggle, ErrorBanner, UndoNotice, Marquee (useMarquee/MarqueeBand/MarqueeSurface)

  All components: forwardRef where DOM-emitting, semantic --as-\* tokens only, data-as hooks, English-default label props, keyboard-nav + axe tests.

## 0.1.0

### Minor Changes

- [`a211003`](https://github.com/neuronection/assistant-ui/commit/a211003348a5248f65a7995806500325408b6f92) Thanks [@constLiakos](https://github.com/constLiakos)! - Initial release (Phase 0): Button, Badge, Card, Modal, Popover, Tooltip + InfoTooltip, Input, Spinner, EmptyState, ConfirmationModal, Portal, ThemeScope and `cn()` — CSS-variable design tokens, precompiled `styles.css`, React 18/19 and Tailwind 3/4 compatible.
