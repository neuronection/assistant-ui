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
| `SegmentedTabs` | `role="tablist"`+`tab`, `aria-selected`, roving tabIndex, thumb `aria-hidden` | Arrow/Home/End move selection (wrap, skips disabled), selection follows focus | clean |
| `ViewToggle` | buttons with `aria-pressed` | Enter switches views | clean |

## Overlays

All overlays render through `Portal` and are Radix-based where noted. Escape
behavior and focus restoration are listed **only where asserted**.

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Modal` | `role="dialog"`, labelled title/description; `ModalBody` is a plain padded `div` (no controls) | Escape closes **and restores focus to the trigger**; built-in close button | clean (open) |
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
| `LoginForm` | `<form data-as="login-form">` with labelled email + password fields (`label htmlFor` wiring via `Input`); the visibility toggle is an icon-only button named from `labels.showPassword`/`hidePassword` with `aria-pressed`; mapped errors `role="alert"` | Tab runs email → password → toggle → submit → links in DOM order; Enter submits from any field (native form semantics); `loading` (or a pending `onSubmit` promise) disables every control; email/password validation is HTML5 (`type=email`, `required`, `minLength` asserted) | clean (idle, loading + error) |
| `RegisterForm` | `<form data-as="register-form">` with labelled email + password + confirm fields, optional full name; both visibility toggles named from `labels` with `aria-pressed`; confirm mismatch sets `aria-invalid` + `aria-describedby` and announces via `role="alert"`; mapped errors `role="alert"` | Tab runs full name (when shown) → email → password → toggle → confirm → toggle → submit → link; Enter submits from any field; a confirm mismatch blocks `onSubmit` and clears once either password field changes; `loading` disables every control; HTML5 validation attributes asserted | clean (with full name, error) |
| `RichTextEditor` | toolbar `role="toolbar"` (name via `labels.toolbar`, default *Formatting*); toolbar buttons are `aria-pressed` toggles named via `labels` — the `heading` group renders one toggle per `headingLevels` level, named via `labels.heading(level)`; editable region is a labelled contenteditable (`aria-label` = required `ariaLabel` prop) | toolbar buttons are tabbable; Enter on a focused button runs its command; `Control+B` toggles bold (editor-level `aria-pressed` follows) | clean (with default toolbar + `toolbarExtra`) |
| `DictationButton` / `DictationStrip` | mic button `aria-pressed` while recording; strip `role="status"` (recording/transcribing) and `role="alert"` for errors; Stop/Cancel/Dismiss are labelled buttons | Enter/click on mic starts; labelled Stop/Cancel/Dismiss buttons | clean (recording, error) |
| `TextDiffView` | header `role`-less label row with `aria-label`led Prev/Next buttons (disabled at range ends); fold/expand and Show-less are labelled buttons; changed rows carry `data-changed`, the navigated block `data-active` | Tab reaches Prev/Next + fold buttons; Enter expands/collapses folds and moves between change groups | clean |
| `MarkdownDiffView` | same header/fold contract as `TextDiffView` (labelled Prev/Next disabled at range ends, labelled fold/Show-less buttons); changed rows carry `data-changed`/`data-kind`, the navigated block `data-active` | Tab reaches Prev/Next + fold buttons; Enter expands/collapses folds and moves between change groups | clean |

## Composite widgets

| Module | ARIA pattern | Keyboard (asserted) | axe |
| --- | --- | --- | --- |
| `Combobox` | combobox + listbox + option, `aria-selected`, `aria-activedescendant`, groups, portaled panel named via `aria-label` (trigger label/placeholder) | ArrowDown opens from the trigger; typing filters; ArrowDown moves the active option; Enter selects and closes; Escape closes **and returns focus to the trigger**; keyboard selection skips `disabled` options; *Clear* button empties | clean (open — panel scanned via `document.body`, `region` disabled as a page-level rule) |
| `ComboboxMulti` | combobox + listbox, `aria-selected` per option | Enter toggles an option **without closing** the listbox; trigger summarizes the selection; keyboard selection skips disabled options | clean (open) |
| `MultiSelectPicker` | combobox + portaled listbox + option, `aria-activedescendant`, `aria-autocomplete="list"`; chips and browse rows carry per-item names (`Remove <label>`, `Add/Added <label>` with `aria-pressed`); browse modal = titled modal dialog (`PanelModal`) with named search/category controls and a live selected count; host slots (`renderChipExtra`/`renderRowContent`/`renderBody`) leave the named `Add/Added <label>` toggles and per-chip `Remove <label>` in place | typing filters; ArrowDown/ArrowUp/Home/End move the active option; Enter adds it and clears the query; Escape closes the listbox **keeping the query**; Tab closes; Escape/×/overlay click close the browse modal; row toggles flip Add↔Added | clean (open listbox + open modal — `document.body`, `region` disabled as a page-level rule) |
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
| `UserMenu` | trigger `aria-haspopup="menu"` + label; panel `role="menu"` with identity header (role badge + status pill are presentational text); checkable entries `role="menuitemcheckbox"` + `aria-checked`; pending `aria-busy` blocks selection; typing targets inside the `switcher` slot are excluded from menu typeahead so embedded inputs keep text entry | Radix menu semantics: arrows, Home/End, typeahead, Escape closes, focus returns to the trigger on close | clean (closed and open); a `menu` expects `menuitem` descendants — app-owned interactive widgets in the `switcher` slot are the app's axe surface |
| `ProfileSwitcher` | trigger `aria-haspopup="dialog"` + `labels.trigger` name; panel `role="dialog"` labelled by `labels.panelTitle`; rows mark the active profile with `aria-current`; icon-only rename/set-Default/delete actions named from label templates; errors `role="alert"` | Enter/Space opens and focus lands on the first row; Tab runs select → row actions → rows → create form; Enter selects a row, submits the rename draft and the create form (empty/blank names never fire); Escape cancels an inline rename without closing, a second Escape closes the panel and restores focus to the trigger | clean (closed and open) |
| `AuthGate` | `<div data-as="auth-gate">` wrapper; default checking splash is a `role="status"` live region showing `labels.checking`; the login surface is the app's composition (shared `LoginForm`/`RegisterForm` carry their own contract) | while checking the splash renders no focusable content (asserted); once authenticated children render as plain DOM — first focusable reachable via Tab (asserted); all three states axe-clean | clean (checking, anonymous, authenticated) |
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
| `ChatMessage` (+ `MessageVariantSwitcher`, `ChatMessageEditor`) | hover action row (`data-as="chat-message-actions"`) also reveals on `focus-within` (keyboard reachable; reveal owned by token-timed CSS, disabled under reduced motion); labelled action buttons whose `aria-label` tracks the copied feedback ("Copy" → "Copied"); variant switcher is a labelled `role="group"` with per-button labels and disabled ends; errors `role="alert"`; editor autofocuses its labelled textarea | Tab reaches actions and switcher; Enter fires copy/edit/regenerate/select; editor: Cmd/Ctrl+Enter saves, Escape cancels | clean (assistant+variants+error, editing, interrupted, copied feedback) |
| `ChatReasoning` | toggle `aria-expanded` + `aria-controls`; streaming announced via `role="status"` + sr-only label; collapsed region `visibility: hidden` (out of tree + tab order after the reveal); reveal + auto-collapse disabled under `prefers-reduced-motion` | Enter/Space toggles | clean (open, closed, streaming) |
| `ChatToolCard` | expandable header is a button with `aria-expanded`/`aria-controls`; running state `role="status"`; sr-only status otherwise; no dead controls on static rows; collapsed panes `visibility: hidden` (out of tree + tab order after the reveal) | Enter/Space expands + collapses | clean (running, expanded done, collapsed done) |
| `ChatPending` | phase narration delegated to the `ChatTurnStatus` `role="status"` region; shimmer placeholder `aria-hidden`; shimmer disabled under `prefers-reduced-motion` | none (non-interactive; asserted zero focusable elements) | clean (pending with timer) |
| `ChatWelcome` | non-interactive by itself (asserted zero focusable elements); suggestion slot carries app markup whose controls keep their own names; orb + stagger decorative, disabled under `prefers-reduced-motion` | none of its own (suggestion controls are app-owned) | clean (page with suggestion button, bubble) |
| `ChatSuggestionCard` | a real labelled button (name = title text) with focus ring and accent-border focus affordance | Enter/Space fire `onClick` (tested) | clean |
| `HitlProposalCard` (+ `FieldDiff`) | resolve actions are real labelled buttons (disabled while `busy`); destructive ops arm a two-step confirm (re-labelled Confirm button + Cancel) instead of a modal; terminal states render zero controls; `error` carries `role="alert"`; diff rows are text (long text via `TextDiffView`, structured collections as chip lists) | Tab reaches Approve then Reject; Enter fires each; destructive: Enter arms, Enter again confirms, Cancel disarms; Tab reaches Preview (pending or approved) first when given | clean (pending with diff, destructive armed, conflict, preview slot, reverted) |
| `ChatTurnStatus` | `role="status"` region named by the phase label; dots + ticking timer `aria-hidden` (no re-announcements); optional sr-only timer description; dots disabled under `prefers-reduced-motion` | none (non-interactive; asserted present as a status region) | clean (row, card) |
| `ChatComposer` | labelled textarea + labelled send/stop buttons with focus rings; `focus-within` container affordance; drag-drop announced via `role="status"`; command palette is a `role="listbox"` with options, textarea carries `aria-controls`/`aria-autocomplete="list"`/`aria-activedescendant` while open | Enter submits (Shift+Enter newlines, IME-guarded); Escape stops while `sending`; palette: ArrowUp/Down + Enter/Tab select (no submit while open) + Escape dismisses; ArrowUp on empty draft recalls `history`; Tab reaches toolbar slots then send/stop | clean (idle, sending, palette open) |
| `ChatTranscript` (+ `ChatSearchField`) | `role="log"` with label; `aria-busy` while streaming; turn completion via visually-hidden `aria-live="polite"` region; labelled jump pill whose accessible name carries the unread count (badge chip `aria-hidden`); search field is a labelled input with labelled prev/next/clear + sr-labelled `n/N` readout; matches are `<mark>` semantics; top fade mask + thin scrollbar are decorative | scroll follows the user; jump pill keyboard-reachable; search: Enter/Shift+Enter jump, Escape clears | clean (items+live, grouped, unread pill, search+marks) |
| `ChatBranchTree` | `role="tree"` / `treeitem` (`aria-selected` on active path, `aria-level` nesting) / `group`; roving tabindex | ArrowUp/Down/Home/End navigate; Enter/Space selects | clean (branched tree) |
| `ConceptGraphView` | search is a labelled textbox with a live match count; layout toggles are labelled `aria-pressed` buttons; legend is a labelled disclosure button; hover preview + edge labels are decorative; node colors carry no meaning alone (legend + `primary_kind` badge text on every node) | search: Enter centers the first match, Escape clears; Tab reaches layout toggles, PNG, then React Flow controls (zoom in/out/fit) | clean (force graph with legend open) |
| `ChatSessionList` | `role="list"`/`listitem`, `aria-current` on active; labelled searchbox; row actions a labelled `role="group"` revealed on hover AND focus-within; inline rename input is labelled (`labels.renameInput`), autofocuses, Enter/blur commits and Escape cancels without selecting the row | Enter/Space selects; actions keyboard-reachable; inline rename keyboard-complete | clean (grouped, actions, editing) |
| `ChatToolsCatalog` | labelled `role="list"` of entries; each header a real button with `aria-expanded` + `aria-controls`; labelled searchbox; asserted empty/no-results text | Enter/Space toggles an entry; Tab reaches search then headers | clean (collapsed, expanded, filtering) |
| `ChatHistoryButton` | labelled popover trigger (Radix popover semantics); content is app markup | Escape closes, focus returns to trigger | clean (open, closed) |
| `ChatTraceMeta` | static decorative text row; nothing focusable | n/a | clean (full trace) |
| `DetailValue` | informational parsed-detail pane: key/value `dl` rows, value chips, preformatted text; no interactive widgets | n/a — informational | clean (rows, chips, text) |
| `ChatTraceTimeline` | toggle + reasoning disclosure are labelled buttons with `aria-expanded`; bars decorative; summary composed from data; tool rows with args/response add a labelled detail-disclosure button (`aria-expanded` + `aria-controls`, name `"<tool> details"`) and a status dot with `title` | Enter/Space toggles; Enter/Space on the row disclosure | clean (collapsed, expanded, observability) |
| `ChatPanel` | layout host — inherits slot semantics; header row is landmark-free (`div[data-as="chat-panel-header"]`), so the panel embeds cleanly inside app landmarks; nothing focusable of its own | n/a | clean (page/sidebar/bubble, incl. nested in `role="main"`) |
| `ChatDrawer` | Radix Dialog semantics (labelled `role="dialog"`, focus trap, Escape); resize handle is a focusable `role="separator"` | arrows resize (±16, Shift ±48); Escape closes | clean (open) |
| `ChatLauncher` | launcher `aria-expanded` with swapped label (icon ↔ close morphs on toggle, never on mount); panel is labelled `role="complementary"` + close button, spring-pop from the launcher corner; badge pulses once per unread change; Escape closes while focus is inside. `showClose={false}` moves the close into the app's header actions (keep one there) | toggle + close buttons keyboard-reachable | clean (open, closed, badge, showClose=false, morph, badge pulse) |
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
| `TaskAssignmentPicker` | task rows (flat or in `sections`) with per-row `ModelPicker` (accessible name = the task label) + row-level clear button; optional fallback picker (name `Fallback — <task>`, `secondaryLabel`-prefixed); `secondaryOnly` rows render the fallback picker alone | clear buttons empty exactly their own assignment (`Clear assignment — <task>`, fallback: `Clear assignment — <fallback> <task>`); pickers inherit the `Combobox` keyboard contract | clean || `CapabilityChips` | `role="group"` of `aria-pressed` toggle buttons (badge variant renders non-interactive spans) | chips are buttons; below `minSelected` the last chip disables instead of silently refusing | clean |
| `ModelRegistry` | provider headers are disclosure buttons (`aria-expanded`); rows carry labelled icon-only controls (`Add/Edit/Remove — <id>`, `Enabled — <id>`); modal inputs are labelled | header Enter toggles the provider; row enable checkbox is a native input (`Enabled — <id>`); modal inputs are labelled | clean |
| `ConnectionTestRow` | status text (`role="status"` while testing); error message; `variant="inline"` drops the card chrome | Enter on *Test* fires `onTest` | clean |
| `ProviderSetupTiles` | `role="group"` of preset tiles (`aria-label`ed); tiles are native buttons with `ProviderLogo` (decorative); capability chips are text labels in the tile's accessible name (neutral — they describe, never rank); disabled tiles render inert with their reason; `configured`/`suggestedKey` states carry text (`Set up` badge, sr-only suggested note), never color alone | Tab walks the tiles in order; Enter selects and reports `onSelect(key)`; disabled tiles never fire | clean |
| `ProviderSetupForm` | labelled fields (library `Input`); checklist is an `aria-label`ed `<ol>` with named copy buttons; Advanced is a native `<details>` disclosure; write-only key field (`password` + `autoComplete="new-password"`); classified error block `role="alert"` with the `{vendor}` hint | Enter submits from any field (submit disables while `testing` or key-less on non-local presets); copy buttons and the get-key control are named controls | clean |
| `SetupReview` | model cards are `aria-pressed` toggle buttons in an `aria-label`ed group; gap-fill rows are `SwitchRow` switches (`role="switch"` + `aria-checked`, `now:` sub-line) | Tab reaches cards then switches; Enter/Space toggle a card (→ `curatedIds`) and a switch (→ its bind flag); every edit emits the full five-bind options body | clean (incl. decision-only composition) |
| `SwitchRow` | native `<button>` with `role="switch"` + `aria-checked`; knob `aria-hidden`; `currentValue` sub-line | Enter and Space toggle (`onCheckedChange`); disabled stays inert | clean |
| `WebSearchProvidersPanel` | cards are the ProviderCard pattern: `⋯` actions menu is `aria-label`ed (`Actions for <name>`), badges carry text (type, priority, disabled, no-key); probe renders the inline connection-test row (label + status + error); the add flow is tiles (`role="group"`, buttons named by type + chips) → a labelled form; form inputs carry accessible names from the catalog | Tab reaches add → cards → menu trigger in order; menu move items disable at list boundaries; save gates on the catalog's required fields (base URL for searxng, key for keyed types on create); toggle/test/move/edit/delete each emit their event | clean (cards + probes, tiles step, form step, edit form) |
| `SurfaceRenderer` | facet chips are `aria-pressed` buttons (All = the reset chip); selects carry the node label; tables use `scope="col"` headers; evidence disclosures are `details/summary` with the host summary line; truncation notices are `role="status"`; progressbars carry the node label with 0–100 value axes; action buttons are labelled by `action.*` labels (never icons alone) | Tab reaches facets, selects, actions, row actions in DOM order; chips/selects emit the controlled facet events; `details/summary` expands by Enter/Space natively | clean (every fixture case) |
| Integration atoms (`OriginChip` / `StatusBadge` / `TierBadge` / `IntegrationCapabilityChips`) | non-interactive text chips with `data-origin-class` / `data-status` / `data-tier` / `data-risk-class` styling hooks; risk markers are text, never colour alone | none — not interactive | clean |
| `IntegrationCard` | enable toggle is an `aria-label`ed checkbox (`<enabledAriaLabel>`); action buttons are labelled; provenance is a `dl`; digest drift renders `role="alert"`; the opt-in kind badge is a text chip (`data-kind`); the detail slot is app content | Tab reaches the toggle (Space toggles, fires `onEnable`) then the action buttons in DOM order; `renderActions` replaces the row wholesale when the host takes over | clean (default, bundled, update states, detail slot, custom actions) |
| `IntegrationCatalogGrid` | search input carries `aria-label`; category groups are labelled `section`s; incompatible entries show their verbatim reason as text and render no install button; error is `role="alert"`, loading carries `aria-busy` + `aria-label` | Tab reaches the search first, then per-group entry install/action buttons; typing emits the controlled query per keystroke | clean (default, loading, error, empty, incompatible) |
| `IntegrationInstancesList` | rows grouped under extension headers (`section` + `aria-label`); the enable checkbox is `aria-label`ed (`<label>: <name>`); the icon-only tombstone button is labelled (`Tombstone: <name>`); conditions/gitops/parked markers are text chips; drift is `role="alert"`; loading carries `aria-busy` | Tab reaches each row's checkbox (Space fires `onToggleEnabled`) then its typed action buttons and any `renderInstanceActions` content in DOM order | clean (grouped, tombstoned, loading, error, empty) |
| `IntegrationSourcesList` | check/remove carry `aria-label`s including the source origin; source errors are `role="alert"`; candidate install buttons are labelled (`Install with consent…`) and fire only the handoff event — never an inline install; instance rows inherit the instances-list semantics | Tab reaches check → remove → candidate install → instance controls per source in DOM order | clean (sources + candidates + installs, loading, error, empty) |
| `AddIntegrationSourceDialog` | Radix dialog (focus trap, Escape → `onOpenChange(false)`, labelled close button); every input/select carries an accessible name incl. the sealed-credential password field; progress is `role="status"`, errors `role="alert"`; submit stays disabled until the descriptor is usable | Tab walks url → local path → strategy select → ref value → subpath → (secret) → submit/cancel; Enter submits when enabled; Escape closes | clean (open, with credential, fetching, failed) |
| `ConsentDialog` | Radix dialog; the payload renders as a `dl` (tier/class, version, author, license, repository, full digest) + capability chips with risk text + the disclosure as plain text — never linkified or collapsed; the change summary and the host `context` copy render as text above the law text; confirm fires `onConsent` only from the explicit button | Dialog opens with focus in the action row (confirm/decline); Tab alternates confirm → decline → close; Space/Enter fires the focused act; Escape declines via `onOpenChange(false)` | clean (install, re-consent with changes, update, T0 declarative, busy) |
| `IntegrationConfigForm` | labelled inputs (`htmlFor`/`id`) per field; required fields carry a marked label; per-field host errors tie via `aria-describedby` + `role="alert"`; validation states are `role="status"` (validating, success) and `role="alert"` (error); conditions render as text badges; secret fields are real password inputs with hint text only | Tab walks fields in schema order (text → number → boolean → chips → select → secret) reaching Validate/Save/Cancel; Space toggles booleans; every value change emits the controlled event | clean (default, secret hints, conditions, validating, failed, success) |
| `ActionResultDialog` | Radix dialog hosting the SurfaceRenderer's a11y contract; loading is `role="status"` with `aria-label`; errors are `role="alert"` with the detail as text + labelled Retry; per-product chrome slots around the payload | Focus lands in the dialog; Tab reaches surface content then footer buttons (Retry on error, Close); Escape closes | clean (ready, loading, failed) |
| `DocsDialog` | Radix dialog; the tree is a `nav` with `aria-label`, entries are buttons with `aria-current` for the selection; the content pane is a labelled region; loading/error/empty are explicit states (`role="status"` / `role="alert"` / text) | Tab reaches tree buttons in order (Enter/Space selects → controlled `onSelect`), then the content and footer; Escape closes | clean (default, loading, failed, no docs) |
| `SetupFirstRunCard` | section labelled by its heading; probe line is `role="status"`; actions are native buttons | Tab reaches *Set up a provider* then *Dismiss* (when offered); Enter fires both | clean |
| `SurfaceRenderer` | facet chips are `aria-pressed` buttons (All = the reset chip); selects carry the node label; tables use `scope="col"` headers; evidence disclosures are `details/summary` with the host summary line; truncation notices are `role="status"`; progressbars carry the node label with 0–100 value axes; action buttons are labelled by `action.*` labels (never icons alone) | Tab reaches facets, selects, actions, row actions in DOM order; chips/selects emit the controlled facet events; `details/summary` expands by Enter/Space natively | clean (every fixture case) |
| `ProviderCard` | name + subtitle as text; identity badges are labelled spans (tooltips + `title`); connection result renders via the inline `ConnectionTestRow` (`connectionLabel` accessible name); management actions are a labelled overflow-menu trigger | Tab reaches the menu trigger; Enter opens the `⋯` menu; the connection row is display-only | clean |
| `SetupSteps` | `aria-label`ed ordered list; active step carries `aria-current="step"`; numeric/done markers are `aria-hidden` while step labels carry state in text (done = check + full-fg, current = emphasis) — never color alone | display-only (no interaction targets) | clean |
| `SetupAssignments` | section labelled by its heading text; rows inherit the `SwitchRow` contract (`role="switch"` + `aria-checked`, `now:` sub-line) | rows inherit `SwitchRow`'s keyboard controls (Enter/Space toggle; disabled rows inert) | clean |
| `ProviderLogo` | decorative (`aria-hidden`) mark keyed by preset; monogram fallback | — (not interactive) | clean |
| `AdminUserTable` | native `<table>` with sr-only caption + `scope="col"` headers; per-row action buttons in a labelled `role="group"`; inline reset panel is a form labelled by its title; transient note `role="status"`, errors `role="alert"` | Tab reaches row actions in DOM order; Enter/Space fires promote/demote, activate/deactivate and force logout; Enter on *Reset password* opens the panel and focuses the password input; Enter submits when the draft passes the minimum length; Escape closes the panel and returns focus to its *Reset password* trigger | clean (default, loading, reset panel) |
| `InstanceModeControl` | current mode as text + badge; the transition panel is a `<form>` titled by its heading; blocked reasons are plain text beside the disabled submit; audit note always visible | Tab reaches password (and confirmation) inputs, the acknowledgement checkbox and submit in DOM order; Enter submits when the draft passes the gates; blocked states keep submit disabled | clean (open, authenticated, blocked, error) |

## Status & feedback

| Module | ARIA pattern | Notes | axe |
| --- | --- | --- | --- |
| `Spinner` | `aria-hidden` without a label; `role="status"` + `aria-live="polite"` with one | announces loading by label | — |
| `HoverCard` | trigger focusable; opens from keyboard focus alone; Escape closes; Radix `aria-describedby` wiring | content on open | clean |
| `Skeleton` / `SkeletonText` | `aria-hidden` decorative blocks; the loading region carries `aria-busy` (app-owned pattern, see docs page) | none — content replaces them | clean (reduced-motion disables the sweep via CSS) |
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
| `TranslationProvidersPanel` | cards are the ProviderCard pattern: `⋯` actions menu is `aria-label`ed (`Actions for <name>`), badges carry text (engine, priority, disabled, no-key); the test result renders with the translated sample; the add flow is tiles (`role="group"`, buttons named by engine + chips) → a labelled form; form inputs carry accessible names from the catalog | Tab reaches add → cards → menu trigger in order; menu move items disable at list boundaries; save gates on the catalog's required fields (base URL for self-hosted engines, key for keyed engines on create); toggle/test/move/edit/delete each emit their event | clean (cards + probes, tiles step, form step, edit form) |
