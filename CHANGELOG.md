# @neuronection/assistant-ui

## 0.18.0

### Minor Changes

- [`f3f37bc`](https://github.com/neuronection/assistant-ui/commit/f3f37bc8ad65e3219e0d7997a786e8131c0de2c1) Thanks [@constLiakos](https://github.com/constLiakos)! - New `flow-status` module: `FlowStatusCard`, a presentational + controlled
  card for multi-step AI flows (per-node status, current-step emphasis,
  progress summary, error + `retryable`, controlled `onRetry`/`onCancel`/
  `onResume`, `detail` payload slot). Apps map the family event vocabulary
  (`flow_started`/`node_*`/`flow_failed`/`interrupt`) to props; the component
  never sees transports.

## 0.17.0

### Minor Changes

- [`6df699b`](https://github.com/neuronection/assistant-ui/commit/6df699b8070318b88a33ba124c7b9d2d90855241) Thanks [@constLiakos](https://github.com/constLiakos)! - SidebarNav: new `compact` prop — a denser layout for short viewports (tighter item padding, smaller icons/typography, slimmer list/pinned/footer regions, `data-as-compact` on the root). Presentational and controlled per ADR-006: the app owns the trigger (e.g. a `max-height` media query hook) and decides whether to hide its footer block in the same state. Composes with `collapsed`; keyboard traversal and the a11y contract are unchanged.

## 0.16.0

### Minor Changes

- [`d0d648b`](https://github.com/neuronection/assistant-ui/commit/d0d648b3a5142badd32de81fdd992fdff803127c) Thanks [@constLiakos](https://github.com/constLiakos)! - SidebarNav: add `secondaryItems` — flat nav items pinned below the scroll area, above `footer` (the Settings/About pattern). Pinned items share the main list's rendering, active state, collapsed-rail behavior and keyboard traversal order (arrows and Home/End cross between regions).

### Patch Changes

- [`d0d648b`](https://github.com/neuronection/assistant-ui/commit/d0d648b3a5142badd32de81fdd992fdff803127c) Thanks [@constLiakos](https://github.com/constLiakos)! - SponsorCard: compact redesign — the decorative primary glow blob, large icon chip and tinted highlight block are gone. The title is bolder with a small inline heart, the footnote renders as a plain second line under the description, and the highlighted channel is emphasized with a primary border and primary name instead of a filled background. The channel list is a responsive grid — one column below the `sm` viewport breakpoint, two above — with a new `columns` prop (`'auto'` default, `1`, `2`) for narrow surfaces like modals.

  FamilyBadge: the current app's card is now clickable to its own hub page (it was rendered as a non-interactive div; the ring and "Current app" badge still mark it).

- [`d0d648b`](https://github.com/neuronection/assistant-ui/commit/d0d648b3a5142badd32de81fdd992fdff803127c) Thanks [@constLiakos](https://github.com/constLiakos)! - SponsorCard: the highlighted channel renders as a soft primary tint (8–12% color-mix fill, primary-mix border, primary text/icon) instead of a solid primary block, with slightly tighter row padding — calmer, more modern hierarchy.

## 0.15.0

### Minor Changes

- [`e7a75e3`](https://github.com/neuronection/assistant-ui/commit/e7a75e3a3970e01f7bdcaf9060f54abe145d5a27) Thanks [@constLiakos](https://github.com/constLiakos)! - ChipInput: the typed draft now renders as a dashed pending chip
  (`data-pending` on the container while a draft exists) so it is visually
  explicit that each entry is its own separate item, and a new `hint` prop
  renders helper text below the field wired to the input via
  `aria-describedby` — use it to spell out the "press Enter or Add after each
  one" contract.

- [`163e5e4`](https://github.com/neuronection/assistant-ui/commit/163e5e4f13d5a097dea56727447fe7e1070e3395) Thanks [@constLiakos](https://github.com/constLiakos)! - ScaleSlider: modern track + thumb (filled progress, larger thumb, visible
  focus ring) via new `styles.css` range rules scoped to
  `[data-as='scale-slider']`; low/high labels are larger and readable
  (text-xs, medium weight, muted color) instead of 9px uppercase.

  ChipInput: new `addLabel` prop renders an explicit add button that commits
  the draft (disabled while empty, re-focuses the input) — makes the
  multi-entry affordance discoverable without keyboard knowledge.

- [`3826518`](https://github.com/neuronection/assistant-ui/commit/3826518fd86f03cbef56344bec9b34b2234086c9) Thanks [@constLiakos](https://github.com/constLiakos)! - New `SidebarNav` component: the family-standard vertical navigation panel
  (groups + section dividers, icons, badges, controlled `activeId`, optional
  collapsed icon rail with hover flyouts, header/footer slots). Fully
  presentational + controlled per ADR-006 — routing, role filtering and i18n
  stay app-side. Ships with keyboard-nav + axe assertions, Ladle stories and
  a docs page; adoption across the family apps is tracked in the nav
  primitives program (family ADR-0007).

- [`3df9ac1`](https://github.com/neuronection/assistant-ui/commit/3df9ac1dbc90079cf1910e34bd213f63e700688b) Thanks [@constLiakos](https://github.com/constLiakos)! - `SidebarNav`: top-level `NavItem` entries now accept `section` — a divider
  label rendered above the item (first occurrence only) so flat sidebars can
  group their entries visually without nested expand/collapse. Sections are
  ignored in the collapsed rail. (Career's sidebar adoption is the first
  consumer; matches the existing child-level `section` dividers.)

- [`3826518`](https://github.com/neuronection/assistant-ui/commit/3826518fd86f03cbef56344bec9b34b2234086c9) Thanks [@constLiakos](https://github.com/constLiakos)! - New `UserMenu` component: the family-standard user menu (avatar or
  initials-disc trigger with name/email, identity header in the panel, item
  model with `tone: 'danger'`, `pending`, and checkable items for
  theme/language toggles). Built on the `Menu` primitives; also adds
  `MenuCheckboxItem` (Radix checkbox menu item with an indicator) to the
  menu module. Health's hand-rolled header dropdown and career's plain
  sign-out button are the adoption targets (family ADR-0007 program).

## 0.14.0

### Minor Changes

- [`d94e5a8`](https://github.com/neuronection/assistant-ui/commit/d94e5a82e3ddaa67e7157a8775b42347b2a6ecdb) Thanks [@constLiakos](https://github.com/constLiakos)! - `ModelRegistry` gains an app-supplied extra-field slot and a per-row enable
  toggle. `extraFields` (`{ key, label, placeholder?, multiline? }[]`) renders
  app-declared fields inside the add/edit modal — e.g. health-assistant's model
  description — with the string values carried verbatim on
  `Model.extra`/`Draft.extra`/`Patch.extra` (included in a patch only when the
  user touched a field or the model already carried non-empty values).
  `onToggleEnabled(model, enabled)` renders a native per-row checkbox
  (`Enabled — <id>` accessible name, hidden for read-only providers) so apps can
  persist the model's enabled flag from the row itself. Note: the visual
  baseline for `model-registry--model-registry-story` needs a CI rebaseline.

- [`4401664`](https://github.com/neuronection/assistant-ui/commit/4401664b46b0a76a70fbca4711c31f5277913982) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentTask` gains `secondaryOnly` — renders ONLY the fallback picker
  line for that row (Fallback badge + picker + info + clear, no primary line)
  for tasks whose assignment itself is a fallback, e.g. an app's single global
  default model; the value round-trips via `secondaryValue`/`onAssignSecondary`.
  It implies `secondary`, so it works flat or inside a section without the
  section-level flag.

### Patch Changes

- [`2e1fe5a`](https://github.com/neuronection/assistant-ui/commit/2e1fe5a0383d810cb01ed1d40c13dea30a7b9292) Thanks [@constLiakos](https://github.com/constLiakos)! - `ConnectionTestRow` wraps long error messages (`whitespace-pre-wrap` +
  `break-words` instead of a single clipped line) so full provider API errors —
  e.g. OpenAI's multi-line 400 payloads — stay readable in app cards.

- [`6d6d6b4`](https://github.com/neuronection/assistant-ui/commit/6d6d6b4c4b8ea8fc73cfd1ff37956bbbe73e5aa2) Thanks [@constLiakos](https://github.com/constLiakos)! - `ModelRegistry` providers accept a `readOnly` flag: read-only providers render their model rows without the Edit/Remove controls and without the Add-model button — for org-managed providers the current user may not modify.

## 0.13.1

### Patch Changes

- [`aff5f8d`](https://github.com/neuronection/assistant-ui/commit/aff5f8df4834e704a0d329ed621a3fcac6df96ad) Thanks [@constLiakos](https://github.com/constLiakos)! - UX clarity from live testing: `ModelRegistry` gains `capsHint` (muted explainer under the capability chips in the catalog modal), and `TaskAssignmentPicker` renders a visible uppercase fallback marker before the secondary picker so the primary/fallback pair is self-explanatory.

- [`aff5f8d`](https://github.com/neuronection/assistant-ui/commit/aff5f8df4834e704a0d329ed621a3fcac6df96ad) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` marks the primary/fallback pickers with compact badges (`primaryLabel`, default "Primary"; the fallback uses `secondaryLabel`) and optional `primaryInfo`/`fallbackInfo` popups (via the library InfoButton) explaining when each is used.

- [`ab46892`](https://github.com/neuronection/assistant-ui/commit/ab468925f37d6bc4a56c91cff4541fab8f8ace22) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` defaults rows use a column layout: the Primary and Fallback badges act as column headers with their pickers aligned beneath (fixed widths keep the columns stuck across rows); override rows render a single unbadged picker; the task title block can no longer be squeezed out by the action columns.

- [`67fed2e`](https://github.com/neuronection/assistant-ui/commit/67fed2ea4a85b96c46cbdf524fcc7590ad7675f8) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` fallback rows get their own clear button (visible when a fallback is assigned) alongside the primary one — each row's X clears exactly its own assignment.

- [`77913e3`](https://github.com/neuronection/assistant-ui/commit/77913e369c260bad9370a1a93376d45efebb3305) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` info buttons are always visible and their popups open on click only — no hover-triggered description popups while moving across the rows.

- [`783ae31`](https://github.com/neuronection/assistant-ui/commit/783ae317463213a084ab95f8d558bf18d5d1af7f) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` defaults cards stack the pickers in rows instead of columns — the fallback picker sits on the first row, the primary picker (with the assignment clear button) on the second; override rows keep a single unbadged picker row.

## 0.13.0

### Minor Changes

- [`f684e2c`](https://github.com/neuronection/assistant-ui/commit/f684e2cece799d89c97de2b334315373e0dacbbf) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` row polish: every task tile falls back to a default `Cpu` icon, the duplicated "Model: provider / model" status line is removed (the row pickers show the selection themselves), the pickers no longer carry an internal clear button (the row-level X is the single remove affordance, vertically centered), accessible names are now just the task label, and `unassignedLabel`/`modelLabel` props are gone. New `@neuronection/assistant-ui/fuzzy` subpath exports `beautifyId` (display-name beautifier) alongside `fuzzyScore`/`searchScore`.

### Patch Changes

- [`f684e2c`](https://github.com/neuronection/assistant-ui/commit/f684e2cece799d89c97de2b334315373e0dacbbf) Thanks [@constLiakos](https://github.com/constLiakos)! - `Combobox`/`ModelPicker` gain `hideLabel` — keeps the accessible name derived from `label` while suppressing the visible label element, for surfaces where the surrounding component already titles the row (e.g. `TaskAssignmentPicker` rows).

## 0.12.1

### Patch Changes

- [`404c345`](https://github.com/neuronection/assistant-ui/commit/404c3453aadafcede9e34dc6bc43f8af68657dca) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentSection` gains an optional `description` rendered as a muted context line under the section label — lets apps carry the explanatory hint once per section instead of repeating it on every row.

## 0.12.0

### Minor Changes

- [`7f69a7d`](https://github.com/neuronection/assistant-ui/commit/7f69a7d8f373e3bf66293d5eb423a2ad7b8115b6) Thanks [@constLiakos](https://github.com/constLiakos)! - `ModelRegistry` moves model add/edit into a **catalog modal** (replacing the inline draft panel and always-visible catalog zone): the picker is a searchable, scrollable `ModelPicker` over the provider's live catalog with a manual-id escape hatch; the draft form gains a **reasoning-effort dropdown with a Custom… option** (free-text), plus **clearable temperature and max-tokens fields** (empty = unset, `null` in drafts/patches — apps persist them per model). Registered rows keep edit/delete; Add-all moves to the modal footer. New labels: `addTitle`, `editTitle`, `selectModelLabel`, `manualIdToggleLabel`, `customOptionLabel`, `temperatureLabel`, `maxTokensLabel`, `emptyProviderLabel`, `externalIdRequiredLabel`; removed: `browseLabel`, `configureLabel`, `addedLabel`, `capFilterLabel`, `unclassifiedLabel`, `manualAddLabel`, `externalIdLabel`, `reasoningEffortPlaceholder`.

- [`7f69a7d`](https://github.com/neuronection/assistant-ui/commit/7f69a7d8f373e3bf66293d5eb423a2ad7b8115b6) Thanks [@constLiakos](https://github.com/constLiakos)! - `ProviderForm` gains optional, flag-gated metadata fields — `showLocationKind` renders a Local/Cloud toggle (`locationKind`/`onLocationKindChange`, icon tile chips) and `showCountry` renders a country select (`country`/`onCountryChange`, app-supplied `countryOptions`). Both default off; apps adopt only what they model.

### Patch Changes

- [`7f69a7d`](https://github.com/neuronection/assistant-ui/commit/7f69a7d8f373e3bf66293d5eb423a2ad7b8115b6) Thanks [@constLiakos](https://github.com/constLiakos)! - `Combobox` search is resilient and accurate: the default filter now ranks matches (exact > substring > token subsequence > bounded typo) instead of plain substring filtering — misspelled queries (`gemni`, `gemeni`, `vicion`) still find their models, separator-agnostic subsequences work (`qwen vl` → `qwen2.5-vl:7b`), and unrelated queries return nothing. New `src/lib/fuzzy` exports `fuzzyScore`/`searchScore` for app reuse.

- [`7f69a7d`](https://github.com/neuronection/assistant-ui/commit/7f69a7d8f373e3bf66293d5eb423a2ad7b8115b6) Thanks [@constLiakos](https://github.com/constLiakos)! - The `Combobox` panel popover is now Radix-`modal` so its list scrolls with the mouse wheel inside dialogs — the dialog's scroll lock was swallowing wheel events on the portaled panel. Outside clicks still close the panel; behavior while closed is unchanged.

- [`7f69a7d`](https://github.com/neuronection/assistant-ui/commit/7f69a7d8f373e3bf66293d5eb423a2ad7b8115b6) Thanks [@constLiakos](https://github.com/constLiakos)! - Model-registry modal polish from live testing: the combobox panel re-enables `pointer-events` so catalogs scroll with the mouse inside dialogs (Radix Dialog blocks body-level pointer events on portaled panels); temperature/max-tokens fields use a dedicated number field with spinner chevrons at the far right (native spinners hidden) and an inline clear button; picking a catalog model auto-fills an editable display name (dashes/colons/dots → spaces, version dots preserved, acronym-aware title case — ports the health-assistant beautifier) unless the label was hand-edited.

## 0.11.0

### Minor Changes

- [`b69b713`](https://github.com/neuronection/assistant-ui/commit/b69b713f4a61887bf1ae1aee3c65f150f6e459e9) Thanks [@constLiakos](https://github.com/constLiakos)! - Model-registry family adopts the health-assistant settings design language, all on tokens: provider cards gain the chevron icon tile (primary-filled when expanded), tinted border + shadow on the open card, an entry fade, and an enabled/total count pill; `CapabilityDescriptor` gains `icon` and every chip/badge carries `data-as-cap` so apps can re-tint per capability; `TaskAssignmentTask` gains `icon` (leading tile). Behavior changes: the remote-catalog zone (search, capability filters, manual add, add-all, catalog rows) is collapsed behind a `browseLabel` trigger button (`aria-expanded`) instead of always visible, and the per-row enable checkbox is removed — apps filter the `models` prop themselves (disabled models re-enter via the catalog's normal add path). `enabledLabel` is gone; `tasks` is optional on `TaskAssignmentPicker`.

### Patch Changes

- [`4f9e9bb`](https://github.com/neuronection/assistant-ui/commit/4f9e9bb923ea09fb5f186312627b124779a0035f) Thanks [@constLiakos](https://github.com/constLiakos)! - `ModelRegistry` draft payloads always carry `reasoningEffort` (empty string when cleared) so apps can distinguish "unset" from "cleared" — previously clearing the field sent `undefined` and the stored value could never be removed.

- [`a93f657`](https://github.com/neuronection/assistant-ui/commit/a93f657ed7577bb347909e211c62a40a36fda87a) Thanks [@constLiakos](https://github.com/constLiakos)! - `ProviderForm` gains `hideBaseUrl` for provider types with a fixed endpoint (Google, Anthropic) — the base URL field is omitted instead of rendering an inert input.

- [`6d8c694`](https://github.com/neuronection/assistant-ui/commit/6d8c694ffdc5b1358d49cc2e596639fbab3818a2) Thanks [@constLiakos](https://github.com/constLiakos)! - `TaskAssignmentPicker` makes `tasks` optional — sections-only usage no longer needs an empty `tasks` array.

## 0.10.0

### Minor Changes

- [`e6a78cf`](https://github.com/neuronection/assistant-ui/commit/e6a78cfda0ccd3f8b4014e8d40f726803ae3c0e2) Thanks [@constLiakos](https://github.com/constLiakos)! - Add the `model-registry` module and the AI-settings patterns it composes. `ModelRegistry` renders provider cards with registered model rows and the remote model catalog behind a two-stage add: quick-add with the app-provided cap guess, or an expandable draft panel where label, capabilities, and reasoning effort are editable before confirming — the same panel doubles as the inline editor, so apps can retire their separate edit dialogs. Adds `CapabilityChips` (controlled cap toggle group / badge display with `minSelected`), a `variant="inline"` + `meta` option on `ConnectionTestRow` for embedding in app provider cards, and v2 additions to `TaskAssignmentPicker`: `requires`-based capability filtering of the row catalog, `sections` grouping, per-task fallback (secondary) model assignment, and a `renderMeta` slot. `ModelPickerModel` gains an optional `capabilities: string[]`. All additions are backward compatible; flat `TaskAssignmentPicker` usage is unchanged.

- [`44d22a7`](https://github.com/neuronection/assistant-ui/commit/44d22a7d3c346d56e4a9c75ffb96c33f0d8ecc20) Thanks [@constLiakos](https://github.com/constLiakos)! - Add `SponsorCard` to the about module and a `sponsor` prop on `AboutPanel`. Channels are data-driven (`SponsorChannel[]`), so apps can start with Buy Me a Coffee (`https://buymeacoffee.com/neuronection`) and add future funding methods without API changes. Highlighted channels render as primary CTAs; per-channel `data-as-channel="<id>"` hooks allow app-side brand theming.

## 0.9.0

### Minor Changes

- [`71f029b`](https://github.com/neuronection/assistant-ui/commit/71f029b3193460db28293b811186a2f46516bf10) Thanks [@constLiakos](https://github.com/constLiakos)! - Add about module: a uniform family "about page" kit. `AboutPanel` composes hero (logo, name, tagline, version badge), creator/license/links cards, tech chips, a toned note (e.g. medical disclaimer), the `FamilyBadge` showcase and a version/copyright footer — all content via props so apps keep their i18n and data. `FamilyBadge` presents the Neuronection brand lockup (mark + wordmark), an open-source/self-hosted family blurb, a prominent hub CTA, and one tile per app (logo, name, tagline, links to its presentation page, GitHub and website where applicable) with the current app highlighted. Building blocks (`AboutCard`, `AboutLinkList`, `AboutNote`, `AboutFooterLine`, `FamilyBadge`, `TechChips`) are also exported individually.

- [`71f029b`](https://github.com/neuronection/assistant-ui/commit/71f029b3193460db28293b811186a2f46516bf10) Thanks [@constLiakos](https://github.com/constLiakos)! - Add logo module with inline brand marks for the Assistant family: `NeuronectionMark`, `NeuronectionWordmark`, `CareerMark`, `StudyMark`, `HealthMark`. All are theme-aware (`theme="light" | "dark"`, mirroring the hub artwork pairs), decorative and non-focusable by default, labeled via an optional `title` prop, sized via `size`, and use per-instance gradient ids so several marks can share a page. The wordmark also accepts `mono` for a `currentColor` fill. Brand artwork keeps its fixed fills as a deliberate exception to the semantic-token rule.

## 0.8.1

### Patch Changes

- [`0421e0e`](https://github.com/neuronection/assistant-ui/commit/0421e0e02ed994182ac3d2e79c23f786aff87b36) Thanks [@constLiakos](https://github.com/constLiakos)! - README: family showcase — neuronection.com, the three Assistant apps
  (career / study / health-assistant.io) front and center; complete component
  index incl. PanelModal, Textarea and the dark-mode / z-token theming notes.
  Docs: correct CSS import order in theming.md, TW3 translate-collision +
  z-index notes in adoption.md, positioning/z-index/audit-import rules in
  adding-a-component.md, AGENTS.md gotchas updated.

## 0.8.0

### Minor Changes

- [`8f92588`](https://github.com/neuronection/assistant-ui/commit/8f92588f6b294c8661fd56d57991c394a1ac9dc1) Thanks [@constLiakos](https://github.com/constLiakos)! - New `TimePicker` (+ standalone `TimePickerContent`): clock-face time picker
  with a 12h AM/PM UI over a 24-hour `HH:MM` value, editable HH:MM fields
  (typing 13–23 or 0 normalizes the period), keyboard-navigable dial, and
  default/unstyled trigger variants. New `TimeList`: chip-based editor for
  `HH:MM` lists with per-chip pickers, remove-on-hover and a max cap.
  Ported from health-assistant (i18n → label props, Radix popover, tokens).

### Patch Changes

- [`077def0`](https://github.com/neuronection/assistant-ui/commit/077def0835ab7d962b7dec04fd4e2cd26ff08bc3) Thanks [@constLiakos](https://github.com/constLiakos)! - `AiButton`: new `showLabel` (icon-only trigger), `closeOnSubmit`
  (auto-close after submit) and controlled `open`/`onOpenChange` props
  (close-on-success form-fill flows).

## 0.7.1

### Patch Changes

- [`904aa08`](https://github.com/neuronection/assistant-ui/commit/904aa083306facd19cf45c03be39ec459400a474) Thanks [@constLiakos](https://github.com/constLiakos)! - Fix modals rendering off-center (bottom-left, outside the viewport) on
  Tailwind 3 apps: overlay centering no longer uses `-translate-x/y-1/2`
  utilities. On a TW3 app those class names also resolve through the app's own
  stylesheet (transform-based), stacking a second translation on top of the
  library's (translate-property) one. `ModalContent`, `PanelModal` and the
  Wizard modal now center with `inset-0` + auto margins; small decorations use
  arbitrary `translate:` properties; the `as-zoom-in` keyframe no longer
  hardcodes a translate.

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
