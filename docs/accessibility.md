# Accessibility

Every interactive module ships with keyboard-navigation and
[jest-axe](https://github.com/dequelabs/axe-core-npm) assertions in
`tests/*.test.tsx` (see `docs/adding-a-component.md` for the rule). This page
is the human-readable contract: **every key or behavior listed below is
asserted by a test** — the doc must not promise anything a test doesn't
assert, and a new key or ARIA attribute always lands test-first. ARIA
patterns reflect the rendered markup exercised by the per-module axe run.

If a behavior is *not* listed for a module, it is not (yet) part of the
tested contract, even when the underlying primitive (native button, Radix
overlay) would provide it by default.

Legend for the *Keyboard* column: only asserted interactions are listed.
"native button/link" means the element is a real `<button>`/`<a>` whose
activation semantics come from the platform, with activation covered by a
test where noted.

## Actions

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Button` | native `<button>` | Enter activates; `loading` disables + `aria-busy` marks busy; disabled never fires `onClick` | clean |
| `CopyButton` | native `<button>`, accessible name from `label` | Enter copies; `data-copied` state | clean |
| `UndoNotice` | `role="status"` live region | Enter on *Undo* fires `onUndo`; auto-dismiss via `duration` | clean |
| `SelectionBar` | bar with *Clear selection* button | Enter clears; renders nothing at `count={0}` | clean |
| `CheckIndicator` | `role="checkbox"`, `aria-checked` incl. `mixed` | Enter and Space toggle | clean |
| `ViewToggle` | buttons with `aria-pressed` | Enter switches views | clean |

## Overlays

All overlays render through `Portal` and are Radix-based where noted. Escape
behavior and focus restoration are listed **only where asserted**.

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Modal` | `role="dialog"`, labelled title/description | Escape closes **and restores focus to the trigger**; built-in close button | clean (open) |
| `PanelModal` | `role="dialog"` side panel | Escape reports `onOpenChange(false)` | clean (open) |
| `ConfirmationModal` | `Modal` + confirm/cancel buttons | Enter on confirm fires `onConfirm`; Escape reports `onOpenChange(false)`; busy disables both actions | clean (open) |
| `FormModal` | `Modal` + form | Enter inside a field submits; `disabled` submit blocks submission | clean (open) |
| `Popover` | Radix popover | Escape closes and restores focus to the trigger | clean (open) |
| `PopoverButton` | Radix popover behind a button | Escape closes the panel | clean (open) |
| `InfoButton` | popover button, default name "Information" | opens on click, content exposed | clean |
| `FieldLabel` | wrapper around `InfoButton` (popover button; default name "Information") | opens via the inner `InfoButton`; content exposed | clean |
| `Tooltip` | Radix tooltip (`role="tooltip"`) | **focus** (Tab) shows the tooltip — not hover-only | clean |
| `InfoTooltip` | trigger with default accessible label; `mode="click"` becomes a popover | focus/click per mode | clean |
| `Menu` / `ActionMenu` | `role="menu"` / `menuitem` | ArrowDown moves focus between items; Enter selects; Escape closes; `disabled` items carry `data-disabled` and are not selectable | clean (open) |
| `ContextMenu` | `role="menu"` / `menuitem` at x/y | Enter selects and reports `onClose`; Escape closes | clean (open) |
| `AiActionsDropdown` | `role="menu"` with action items; split mode adds primary + chevron `aria-expanded` buttons | Enter submits the custom prompt; Escape closes the menu; busy disables the trigger | clean (open) |

## Inputs

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Input` | `<label htmlFor>` + `aria-describedby` (hint, error), `aria-invalid` on error, error text `role="alert"` | typing (uncontrolled) | clean |
| `Textarea` | same as `Input` | typing | clean |
| `SearchInput` | `role="search"` wrapper + textbox + clear button | Enter submits (`onSubmit`); clear button empties | clean |
| `ExpandableSearch` | trigger reveals a `role="search"` input | first Escape clears the value, second Escape collapses (collapsed trigger `aria-hidden`) | clean |
| `ChipInput` | labelled input + chip remove buttons | Enter commits a chip; separator keys (`,`) commit; Backspace on empty input removes the last chip; paste splits into chips; blur commits the draft; Tab reaches remove buttons and the input; optional add button commits the draft; optional `hint` is an `aria-describedby` description | clean |
| `ChipList` | presentational pills; remove buttons named `<removeLabel> — <item>`; clickable chips are real buttons | remove/click via native button semantics (asserted: accessible names, Enter activation) | clean |
| `ScaleSlider` | `role="slider"` (native range) paired with a number input | slider `change` emits numeric values; typed input syncs; blur clamps to `min`/`max`; clearing emits `''`; focus ring visible on the range input | clean |
| `ProviderForm` | labelled fields; write-only API-key input (never renders a stored value); preset + country pickers are native labelled `<select>`s; error `role="alert"` | typing reports `onApiKeyChange` | clean |
| `RichTextEditor` | toolbar `role="toolbar"` (name via `labels.toolbar`, default *Formatting*); toolbar buttons are `aria-pressed` toggles named via `labels` — the `heading` group renders one toggle per `headingLevels` level, named via `labels.heading(level)`; editable region is a labelled contenteditable (`aria-label` = required `ariaLabel` prop) | toolbar buttons are tabbable; Enter on a focused button runs its command; `Control+B` toggles bold (editor-level `aria-pressed` follows) | clean (with default toolbar + `toolbarExtra`) |
| `DictationButton` / `DictationStrip` | mic button `aria-pressed` while recording; strip `role="status"` (recording/transcribing) and `role="alert"` for errors; Stop/Cancel/Dismiss are labelled buttons | Enter/click on mic starts; labelled Stop/Cancel/Dismiss buttons | clean (recording, error) |
| `TextDiffView` | header `role`-less label row with `aria-label`led Prev/Next buttons (disabled at range ends); fold/expand and Show-less are labelled buttons; changed rows carry `data-changed`, the navigated block `data-active` | Tab reaches Prev/Next + fold buttons; Enter expands/collapses folds and moves between change groups | clean |
| `MarkdownDiffView` | same header/fold contract as `TextDiffView` (labelled Prev/Next disabled at range ends, labelled fold/Show-less buttons); changed rows carry `data-changed`/`data-kind`, the navigated block `data-active` | Tab reaches Prev/Next + fold buttons; Enter expands/collapses folds and moves between change groups | clean |

## Composite widgets

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Combobox` | combobox + listbox + option, `aria-selected`, `aria-activedescendant`, groups | ArrowDown opens from the trigger; typing filters; ArrowDown moves the active option; Enter selects and closes; Escape closes **and returns focus to the trigger**; keyboard selection skips `disabled` options; *Clear* button empties | clean (open) |
| `ComboboxMulti` | combobox + listbox, `aria-selected` per option | Enter toggles an option **without closing** the listbox; trigger summarizes the selection; keyboard selection skips disabled options | clean (open) |
| `DatePicker` | button trigger ("Choose date") + `role="grid"` day grid, roving tabindex, `aria-current="date"` for today | ArrowRight/ArrowDown move focus across/weeks; Enter selects and closes; Escape closes; out-of-range days disabled; hidden `<input type="hidden">` for form wiring | clean (closed and open) |
| `TimePicker` | button trigger ("Choose time") + clock face as `role="slider"`, hour/minute textboxes, AM/PM segmented buttons | ArrowRight increments the hour; typing the hour + Tab commits a 24-hour value (14 → 2 PM); AM/PM toggles; Done and Escape close | clean (open) |
| `TimeList` | chips + add pill; edit opens the `TimePicker` clock | add/remove/edit via buttons (native button semantics) | clean |
| `Table` | native `<table>`/`<th>`/`<td>` elements (implicit grid semantics) | — (presentational data view) | clean |

## Navigation & structure

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Breadcrumbs` | `<nav>` + link list; current step as text; `linkComponent` for SPA routing | native link semantics | clean |
| `SettingsShell` | `<nav aria-label="Settings sections">`; active entry `aria-current="page"` | nav buttons activate (native button semantics) | clean |
| `SidebarNav` | `<nav aria-label>`; active entry `aria-current="page"`; group triggers `aria-expanded` + `aria-controls`; rail flyout content labelled by its group | Tab traverses in order (main list, then pinned `secondaryItems`); Enter/Space activates (leaves navigate, groups toggle); ArrowUp/Down move between visible items across both regions; ArrowRight expands/enters a group; ArrowLeft collapses/returns to the trigger; Home/End jump; rail flyout: opens on hover/click/Enter, ArrowUp/Down within, Escape closes and focus returns to the trigger | clean (expanded, collapsed, flyout open, compact) |
| `UserMenu` | trigger `aria-haspopup="menu"` + label; panel `role="menu"` with identity header; checkable entries `role="menuitemcheckbox"` + `aria-checked`; pending `aria-busy` blocks selection | Radix menu semantics: arrows, Home/End, typeahead, Escape closes | clean (closed and open) |
| `Wizard` | dialog wizard with steps | Enter advances (*Next*) and goes back (*Back*); `canContinue={false}` disables Next; Escape reports `onOpenChange(false)` | clean (open) |
| `Stepper` | step buttons, current `aria-current="step"` (and disabled); dots variant renders a screen-reader "Step X of Y" summary | jump clicks to earlier steps | clean |
| `Badge`, `Card`, `EmptyState` | presentational; `EmptyState` hosts a consumer-supplied action | — (action slot is app-owned; use an accessible control) | clean |
| `RangeBar` | static low–high band with label | — (display only) | clean |

## AI patterns

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `AiButton` | dialog panel; loading `role="status"`; error `role="alert"` | Enter submits the typed prompt and clears the input; suggestion chips clickable; `closeOnSubmit` closes after submit; controlled `open` defers closing to the app (asserted: app closes on success) | clean (open) |
| `AiActionsDropdown` | menu + custom-prompt field | Enter submits the prompt; Escape closes | clean (open) |
| `AiMagicFill` | prompt textarea + Apply | submit disabled until a prompt exists | clean |
| `MarkdownSurface` / `MarkdownCodeBlock` / `MermaidDiagram` | chat markdown renders into a scoped `div`; heading levels pass through; code blocks have `aria-label` (`<language> code`) + labelled copy button; mermaid renders its `svg` with a plain-code fallback | copy via keyboard-reachable button; no focus traps | clean (headings+table, code, math) |
| `ChatMessage` (+ `MessageVariantSwitcher`, `ChatMessageEditor`) | hover action row also reveals on `focus-within` (keyboard reachable); labelled action buttons; variant switcher is a labelled `role="group"` with per-button labels and disabled ends; errors `role="alert"` | Tab reaches actions and switcher; Enter fires copy/edit/regenerate/select; editor: Cmd/Ctrl+Enter saves, Escape cancels | clean (assistant+variants+error, editing) |
| `ChatReasoning` | toggle `aria-expanded` + `aria-controls`; streaming announced via `role="status"` + sr-only label | Enter/Space toggles | clean (open, streaming) |
| `ChatToolCard` | expandable header is a button with `aria-expanded`/`aria-controls`; running state `role="status"`; sr-only status otherwise; no dead controls on static rows | Enter/Space expands | clean (running, expanded done) |
| `ChatTurnStatus` | `role="status"` region named by the phase label; dots + ticking timer `aria-hidden` (no re-announcements); optional sr-only timer description; dots disabled under `prefers-reduced-motion` | none (non-interactive; asserted present as a status region) | clean (row, card) |
| `ChatComposer` | labelled textarea + labelled send/stop buttons with focus rings; `focus-within` container affordance; drag-drop announced via `role="status"` | Enter submits (Shift+Enter newlines, IME-guarded); Tab reaches toolbar slots then send/stop | clean (idle, sending) |
| `ChatTranscript` | `role="log"` with label; `aria-busy` while streaming; turn completion via visually-hidden `aria-live="polite"` region; labelled jump pill | scroll follows the user; jump pill keyboard-reachable | clean (items+live) |
| `ChatBranchTree` | `role="tree"` / `treeitem` (`aria-selected` on active path, `aria-level` nesting) / `group`; roving tabindex | ArrowUp/Down/Home/End navigate; Enter/Space selects | clean (branched tree) |
| `ChatSessionList` | `role="list"`/`listitem`, `aria-current` on active; labelled searchbox; row actions a labelled `role="group"` revealed on hover AND focus-within | Enter/Space selects; actions keyboard-reachable | clean (grouped, actions) |
| `ChatToolsCatalog` | labelled `role="list"` of entries; each header a real button with `aria-expanded` + `aria-controls`; labelled searchbox; asserted empty/no-results text | Enter/Space toggles an entry; Tab reaches search then headers | clean (collapsed, expanded, filtering) |
| `ChatHistoryButton` | labelled popover trigger (Radix popover semantics); content is app markup | Escape closes, focus returns to trigger | clean (open, closed) |
| `ChatTraceMeta` | static decorative text row; nothing focusable | n/a | clean (full trace) |
| `DetailValue` | informational parsed-detail pane: key/value `dl` rows, value chips, preformatted text; no interactive widgets | n/a — informational | clean (rows, chips, text) |
| `ChatTraceTimeline` | toggle + reasoning disclosure are labelled buttons with `aria-expanded`; bars decorative; summary composed from data; tool rows with args/response add a labelled detail-disclosure button (`aria-expanded` + `aria-controls`, name `"<tool> details"`) and a status dot with `title` | Enter/Space toggles; Enter/Space on the row disclosure | clean (collapsed, expanded, observability) |
| `ChatPanel` | layout host — inherits slot semantics; header row is landmark-free (`div[data-as="chat-panel-header"]`), so the panel embeds cleanly inside app landmarks; nothing focusable of its own | n/a | clean (page/sidebar/bubble, incl. nested in `role="main"`) |
| `ChatDrawer` | Radix Dialog semantics (labelled `role="dialog"`, focus trap, Escape); resize handle is a focusable `role="separator"` | arrows resize (±16, Shift ±48); Escape closes | clean (open) |
| `ChatLauncher` | launcher `aria-expanded` with swapped label; panel is labelled `role="complementary"` + close button; Escape closes while focus is inside. `showClose={false}` moves the close into the app's header actions (keep one there) | toggle + close buttons keyboard-reachable | clean (open, closed, badge, showClose=false) |
| `FlowStatusCard` | step `<ol>` with per-step status icons; running step `aria-current="step"`; header summary `role="status"`; failure block `role="alert"` (code + message); derived action buttons (*Cancel* while running, *Resume* when interrupted, *Retry* on retryable failure) | Tab reaches the visible action(s) in DOM order; Enter fires `onCancel`/`onResume`/`onRetry` | clean (running, failed, interrupted) |
| `FlowTraceCard` | informational run ledger: stage `<ol>` + ops `<ul>` with visible ✓/✗ markers (decorative, `aria-hidden`) and detail tooltips (`title`, `aria-label` on the truncated detail); `<table>` per-call rows with scoped column headers (`task`/`model`/tokens/latency/status) and status dots with `title`; outcome + simulated badges are text | n/a — no interactive widgets (asserted: zero `button`s in the card) | clean (stages+calls+ops, simulated) |
| `FlowTelemetryStrip` | informational digit row (`data-as="flow-telemetry-strip"`), plain text counters with tabular numerals; simulated badge carries a `title` explaining "no real spend" | n/a — informational | clean (counters, simulated) |

## File surface

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `UploadDropzone` | labelled dropzone button ("click or drop") | click **and Enter from keyboard focus** open the OS file picker; drop accepted; suppressed while uploading/disabled | clean |
| `FileCard` | remove button named "`<removeLabel> — <name>`"; include checkbox labelled per file; processing `role="status"`; failure state | remove/include via native controls | clean |
| `FileQueue` | list of `FileCard`s + aggregate summary; empty state text | remove via card buttons; reorder intent reported on drop | clean |

## Settings blocks

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `ModelPicker` | `Combobox` with grouped provider→model options and capability badges | keyboard contract inherited from `Combobox` (asserted there) | clean (closed) |
| `TaskAssignmentPicker` | task rows (flat or in `sections`) with per-row `ModelPicker` (accessible name = the task label) + row-level clear button; optional fallback picker (name `Fallback — <task>`, `secondaryLabel`-prefixed); `secondaryOnly` rows render the fallback picker alone | clear buttons empty exactly their own assignment (`Clear assignment — <task>`, fallback: `Clear assignment — <fallback> <task>`); pickers inherit the `Combobox` keyboard contract | clean |
| `CapabilityChips` | `role="group"` of `aria-pressed` toggle buttons (badge variant renders non-interactive spans) | chips are buttons; below `minSelected` the last chip disables instead of silently refusing | clean |
| `ModelRegistry` | provider headers are disclosure buttons (`aria-expanded`); rows carry labelled icon-only controls (`Add/Edit/Remove — <id>`, `Enabled — <id>`); modal inputs are labelled | header Enter toggles the provider; row enable checkbox is a native input (`Enabled — <id>`); modal inputs are labelled | clean |
| `ConnectionTestRow` | status text (`role="status"` while testing); error message; `variant="inline"` drops the card chrome | Enter on *Test* fires `onTest` | clean |

## Status & feedback

| Module | ARIA pattern | Notes | axe |
| --- | --- | --- | --- |
| `Spinner` | `aria-hidden` without a label; `role="status"` + `aria-live="polite"` with one | announces loading by label | — |
| `ErrorBanner` | `role="alert"` | renders nothing without a message; action slot app-owned | clean |
| `UndoNotice` | `role="status"` | see Actions | clean |

## Utilities (no ARIA contract)

`useDictation` / `useAiTextTransform` (with `AiTextTransformTransport`) / `useChatStream` (with `ChatStreamTransport`, `ChatMessageView`, `liveTurnReducer`) are transport-injected state-machine hooks (no rendered contract of their own); their UI companions above / `FlowStatusCard` / the chat components carry the ARIA contract and the tests. `chat-export` (pure string/DOM-download utility over `ChatExportMessage` / `ChatExportOptions`) has no rendered contract.

- `Portal`, `ThemeScope`, `cn` — rendering/theming primitives (`ThemeScope`
  is axe-checked).
- `Logo` (`NeuronectionMark`, `NeuronectionWordmark`, app marks) — inline
  SVGs; `aria-hidden` by default, `title` exposes an accessible name
  (asserted).
- `About*` (`AboutPanel`, `AboutCard`, `AboutLinkList`, `AboutNote`,
  `AboutFooterLine`, `FamilyBadge`, `TechChips`, `SponsorCard`) —
  presentational composition; link rows are real `<a>`s and copy rows are
  real buttons (`"<label> — Copy to clipboard"`), axe-checked.
- `Marquee` — **pointer-only** drag-selection hook. It intentionally has no
  keyboard mode; apps using it must keep a keyboard-reachable selection
  alternative (e.g. the checkboxes from `CheckIndicator` on the same items).

## Conventions worth knowing when composing

- **Escape discipline:** overlays that assert Escape close and *report*
  `onOpenChange(false)`; `Modal` and `Popover` additionally assert focus
  restoration to the trigger.
- **Roving tabindex** appears in the `DatePicker` grid; `Combobox` uses
  `aria-activedescendant` on the search input instead.
- **Errors announce** via `role="alert"` (`Input`, `Textarea`, `Combobox`,
  `ProviderForm`, `AiButton`, `AiMagicFill`); transient state via
  `role="status"` (`Spinner`, `UndoNotice`, `FileCard` processing,
  `ConnectionTestRow` testing, `ComboboxMulti` option count).
- **Icon-only controls must carry a label** — every icon-only button in the
  catalog has an `aria-label` asserted through its accessible name in tests
  (e.g. "Clear", "Undo", "`Clear selection`", "`<removeLabel> — <name>`").
