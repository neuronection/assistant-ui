# assistant-ui

Shared React component library for the **Assistant family** — three sibling
apps that AI-help people with career, study, and health. One package, three
apps: family look by default, app flavor via CSS-variable design tokens.
Works in React 18 & 19 and alongside Tailwind 3 or 4 — the library ships
**precompiled CSS**, so your app's Tailwind never compiles library classes.

**[neuronection.com](https://neuronection.com)** — the family hub.

| App | What it is |
|---|---|
| [**career-assistant**](https://github.com/neuronection/career-assistant) | Job discovery, AI matching and university pathways for students |
| [**study-assistant**](https://github.com/neuronection/study-assistant) | Study workspace: notes, materials, chat with math & code rendering |
| [**health-assistant**](https://health-assistant.io) | Universal health data platform — self-hosted, privacy-first, [open source](https://github.com/health-assistant-io/health-assistant) |

The family shares its UI DNA here: **40+ modules, 260+ tests** (keyboard-nav
+ axe per component), built on Radix, token-themed so every app looks like a
sibling without sharing a stack. Patterns the apps actually use — provider &
model settings blocks, AI affordances (ask/fill/act), date & clock pickers,
async comboboxes, file attachment surfaces — live in the package, not
copy-pasted in three repos.

## Install

```bash
pnpm add @neuronection/assistant-ui
```

Then do exactly two things in your app entry:

```tsx
import '@neuronection/assistant-ui/styles.css'
import './theme.css' // your app's token overrides, loaded after
```

```tsx
import { Button, ConfirmationModal, Input } from '@neuronection/assistant-ui'
```

## Theming

All visuals flow through `--as-*` CSS variables. The defaults are the family
look (extracted from study-assistant); each app overrides identity tokens in
a small `theme.css`:

```css
:root {
  --as-primary: oklch(0.62 0.15 152);
  --as-radius: 0.75rem;
}
```

Dark mode is the same story: remap the tokens under `.dark` (health-assistant
ships a class-based dark theme this way) — no component rewrites. Overlay
stacking is token-driven too (`--as-z-modal`, `--as-z-popover`) so library
dialogs clear your app chrome. Full guide: [docs/theming.md](./docs/theming.md).

## Components

Every module has its own entry point (`import { Menu } from
'@neuronection/assistant-ui/menu'`) and everything is re-exported from the
package root. Each module links a reference page under
[docs/components/](./docs/components/) below; the `.d.ts` files in the
package's `dist/` stay the authoritative API for your installed version.
Visual reference: [gallery](https://neuronection.github.io/assistant-ui/).

| Module | Exports | Gallery |
|---|---|---|
| [`button`](./docs/components/button.md) / [`badge`](./docs/components/badge.md) / [`card`](./docs/components/card.md) | `Button`, `buttonVariants` · `Badge`, `badgeVariants` · `Card`, `CardHeader/Title/Description/Content/Footer` | [stories](https://neuronection.github.io/assistant-ui/?story=button--variants) |
| [`modal`](./docs/components/modal.md) (`Modal` + parts, `PanelModal`) | `Modal` + parts (compound Radix dialog) · `PanelModal` (header/body/footer shell, full-screen on mobile) | [stories](https://neuronection.github.io/assistant-ui/?story=modal--sizes) |
| [`confirmation-modal`](./docs/components/confirmation-modal.md) / [`form-modal`](./docs/components/form-modal.md) | `ConfirmationModal` · `FormModal` (form-in-modal shell: `headerActions`, reject button, busy states) | [stories](https://neuronection.github.io/assistant-ui/?story=modal--confirmation) |
| [`popover`](./docs/components/popover.md) / [`popover-button`](./docs/components/popover-button.md) | compound Radix `Popover` + parts · `PopoverButton` (self-contained trigger + panel, hover-open, lazy children, `closeSignal`) | [stories](https://neuronection.github.io/assistant-ui/?story=popover-button--default) |
| [`menu`](./docs/components/menu.md) / [`context-menu`](./docs/components/context-menu.md) | `Menu`, `MenuTrigger/Content/Item/Separator/Label`, `ActionMenu` (items-driven) · `ContextMenu` (coordinate-anchored, `{x, y, items, onClose}`) | [stories](https://neuronection.github.io/assistant-ui/?story=menu--compound-menu) |
| [`combobox`](./docs/components/combobox.md) | `Combobox`, `ComboboxMulti` — async mode (`onSearchChange` + `loading`), grouping, capability badges, full keyboard nav | [stories](https://neuronection.github.io/assistant-ui/?story=combobox--single-select) |
| [`tooltip`](./docs/components/tooltip.md) | `Tooltip` + parts, `InfoTooltip` | [stories](https://neuronection.github.io/assistant-ui/?story=overlay--tooltips) |
| [`wizard`](./docs/components/wizard.md) | `Wizard` (steps config + `renderStep`, per-step validation gates, modal/drawer variants), `Stepper` (dots/labels) | [stories](https://neuronection.github.io/assistant-ui/?story=wizard--modal-wizard) |
| [`input`](./docs/components/input.md) / [`textarea`](./docs/components/textarea.md) / [`search-input`](./docs/components/search-input.md) / [`expandable-search`](./docs/components/expandable-search.md) | `Input` (label/hint/error wiring) · `Textarea` · `SearchInput` · `ExpandableSearch` | [stories](https://neuronection.github.io/assistant-ui/?story=misc--inputs) |
| [`rich-text-editor`](./docs/components/rich-text-editor.md) | `RichTextEditor` — controlled tiptap markdown editor: configurable toolbar groups + `toolbarExtra` slot, label/icon props, caret-preserving external sync | [stories](https://neuronection.github.io/assistant-ui/?story=rich-text-editor--default) |
| [`dictation`](./docs/components/dictation.md) / [`ai-text-transform`](./docs/components/ai-text-transform.md) | `useDictation` + `DictationButton`/`DictationStrip` (transport-injected STT) · `useAiTextTransform` (streaming transform state machine) | [stories](https://neuronection.github.io/assistant-ui/?story=dictation--dictation) |
| [`text-diff-view`](./docs/components/text-diff-view.md) | `TextDiffView` — side-by-side diff with word-level highlights, line numbers, change navigation, folds, virtualization (+ exported `computeLineDiff`/`wordSegments`) | [stories](https://neuronection.github.io/assistant-ui/?story=text-diff-view--default) |
| [`chip-input`](./docs/components/chip-input.md) / [`chip-list`](./docs/components/chip-list.md) | `ChipInput` (Enter/comma commit, paste-splits, Backspace-removes) · `ChipList` (variant pills, clickable, removable) | [stories](https://neuronection.github.io/assistant-ui/?story=phase2--chip-editing) |
| [`time-picker`](./docs/components/time-picker.md) / [`time-list`](./docs/components/time-list.md) | `TimePicker` (clock face, 24h value, 12h UI, editable fields) · `TimeList` (time chips with per-chip pickers) | [stories](https://neuronection.github.io/assistant-ui/?story=time-pickers--time-picker-story) |
| [`date-picker`](./docs/components/date-picker.md) | `DatePicker` (popover calendar: days/months/years views, min/max, `allowClear`, arrow-key day grid, `unstyled` variant) | [stories](https://neuronection.github.io/assistant-ui/?story=phase2--date-pickers) |
| [`range-bar`](./docs/components/range-bar.md) / [`scale-slider`](./docs/components/scale-slider.md) | `RangeBar` (low–high band + value dot) · `ScaleSlider` (+ `scaleColorForValue`) | [stories](https://neuronection.github.io/assistant-ui/?story=phase2--range-bars) |
| [`table`](./docs/components/table.md) | `Table` (headers/rows, opt-in empty state) | [stories](https://neuronection.github.io/assistant-ui/?story=phase2--data-table) |
| [`check-indicator`](./docs/components/check-indicator.md) / [`selection-bar`](./docs/components/selection-bar.md) / [`view-toggle`](./docs/components/view-toggle.md) | `CheckIndicator` (tri-state) · `SelectionBar` (bulk-select bar) · `ViewToggle` (grid/list) | [stories](https://neuronection.github.io/assistant-ui/?story=controls--selection) |
| [`error-banner`](./docs/components/error-banner.md) / [`undo-notice`](./docs/components/undo-notice.md) / [`empty-state`](./docs/components/empty-state.md) / [`spinner`](./docs/components/spinner.md) | presentational feedback: alert banner with `action` slot · undo toast · `EmptyState` · `Spinner` | [stories](https://neuronection.github.io/assistant-ui/?story=feedback--errors) |
| [`info-button`](./docs/components/info-button.md) / [`field-label`](./docs/components/field-label.md) / [`copy-button`](./docs/components/copy-button.md) / [`breadcrumbs`](./docs/components/breadcrumbs.md) | `InfoButton` · `FieldLabel` · `CopyButton` (clipboard + copied state) · `Breadcrumbs` (SPA links via `linkComponent`) | [stories](https://neuronection.github.io/assistant-ui/?story=phase2--copy-buttons) |
| [`ai-button`](./docs/components/ai-button.md) / [`ai-actions-dropdown`](./docs/components/ai-actions-dropdown.md) / [`ai-magic-fill`](./docs/components/ai-magic-fill.md) | AI affordances: ask-with-suggestions (controlled open, icon-only mode) · action menu + custom prompt · describe-in-words fill modal — API calls stay app-side | [stories](https://neuronection.github.io/assistant-ui/?story=ai-patterns--ai-buttons) |
| [`flow-status`](./docs/components/flow-status.md) | `FlowStatusCard` (multi-step AI-flow progress from the family event vocabulary: per-node status, current-step emphasis, progress summary, error + retryable, controlled retry/cancel/resume, `detail` slot for HITL cards) | [stories](https://neuronection.github.io/assistant-ui/?story=flow-status--running) |
| [`settings-shell`](./docs/components/settings-shell.md) / [`provider-form`](./docs/components/provider-form.md) / [`connection-test-row`](./docs/components/connection-test-row.md) | `SettingsShell` (controlled two-pane nav) · `ProviderForm` (write-only API-key field) · `ConnectionTestRow` (idle/testing/ok/fail + latency, `inline` variant + meta slot) | [stories](https://neuronection.github.io/assistant-ui/?story=settings-trio--provider-form-story) |
| [`sidebar-nav`](./docs/components/sidebar-nav.md) | `SidebarNav` (family-standard vertical nav: groups + sections, badges, controlled active id, pinned secondary items, optional collapsed icon rail with hover flyouts, header/footer slots) | [stories](https://neuronection.github.io/assistant-ui/?story=sidebar-nav--groups-story) |
| [`user-menu`](./docs/components/user-menu.md) | `UserMenu` (avatar/identity trigger + action menu incl. checkable items; composed over `Menu`) | [stories](https://neuronection.github.io/assistant-ui/?story=user-menu--checkable-items-story) |
| [`model-picker`](./docs/components/model-picker.md) / [`task-assignment-picker`](./docs/components/task-assignment-picker.md) / [`capability-chips`](./docs/components/capability-chips.md) | `ModelPicker` (grouped provider→model combobox, capability chips) · `TaskAssignmentPicker` (task → model mapping rows, capability-filtered, sections + fallback assignment, meta slot) · `CapabilityChips` (cap toggle group / badges, min-selected) | [stories](https://neuronection.github.io/assistant-ui/?story=model-assignment--task-assignment-v2-story) |
| [`model-registry`](./docs/components/model-registry.md) | `ModelRegistry` (provider cards → registered model rows; add/edit in one catalog modal fed by app-fetched remote models; manual id entry; add-all of pending ids) | [stories](https://neuronection.github.io/assistant-ui/?story=model-registry--model-registry-story) |
| [`upload-dropzone`](./docs/components/upload-dropzone.md) / [`file-card`](./docs/components/file-card.md) / [`file-queue`](./docs/components/file-queue.md) | file attachment surface: dropzone (block/row) · card (status, include toggle) · queue (summary + reorder) | [stories](https://neuronection.github.io/assistant-ui/?story=file-surface--dropzones) |
| [`marquee`](./docs/components/marquee.md) | `useMarquee`, `MarqueeSurface`, `MarqueeBand` (rubber-band selection) | [stories](https://neuronection.github.io/assistant-ui/?story=marquee--default) |
| [`portal`](./docs/components/portal.md) / [`theme-scope`](./docs/components/theme-scope.md) / tokens | `Portal` · `ThemeScope` · [token name lists + types](./docs/guides/utilities.md#tokens-entry-point) | [stories](https://neuronection.github.io/assistant-ui/?story=tokens--semantic-tokens) |
| [`logo`](./docs/components/logo.md) / [`about`](./docs/components/about.md) | `NeuronectionMark`, `NeuronectionWordmark`, `Career/Study/HealthMark` · `AboutPanel` + about-page building blocks (`AboutCard`, `AboutLinkList`, `FamilyBadge`, `SponsorCard`, …) | [stories](https://neuronection.github.io/assistant-ui/?story=about--health-about-page) |

API rules: controlled-first, `className` merges (never replaces), `asChild`
where it makes sense, refs forwarded everywhere, English label props with
defaults (translate at call sites), icons as props. No fetching, no stores,
no router — data in, events out.

## Documentation

Guides (`docs/guides/`):

- [Import & theming](./docs/guides/import-and-theming.md) — import paths
  (subpath vs barrel vs app shims), CSS load order, `--as-*` tokens,
  `data-as-*` styling hooks, Vite setup checklist
- [Utilities](./docs/guides/utilities.md) — `searchScore`/`fuzzyScore`
  ranking model, `cn`, the tokens entry point
- [AI settings surfaces](./docs/guides/ai-settings.md) — the providers →
  models → tasks recipe (`ProviderForm`, `ConnectionTestRow`,
  `ModelRegistry`, `TaskAssignmentPicker`) with real app call-sites

Per-component reference (`docs/components/<module>.md`): purpose, import
line, props table, controlled contract, i18n contract, snippets,
accessibility notes — every module in the table above links its page.

- [Adopting in an app](./docs/adoption.md) — the install/switchover recipe each family app follows (incl. the TW3 cascade notes)
- [Theming](./docs/theming.md) — tokens, app themes, dark mode, styling hooks
- [Accessibility](./docs/accessibility.md) — the keyboard + ARIA contract per module (test-asserted)
- [Adding a component](./docs/adding-a-component.md) — rules, checklist, required companions
- [Local development](./docs/local-development.md) — live-test library changes in the family apps without publishing
- [Publishing](./docs/publishing.md) — the Changesets release flow and CI setup

## Development

```bash
pnpm install
pnpm dev          # Ladle playground on :61000 (CSS watches alongside)
pnpm test --watch
pnpm verify       # lint + typecheck + test + build
pnpm test:visual  # Playwright screenshots of every story vs committed baselines
```

Releases happen via [Changesets](./CONTRIBUTING.md) — CI publishes, never a
laptop.

## License

Apache-2.0 — same as the family apps this library was extracted from.
