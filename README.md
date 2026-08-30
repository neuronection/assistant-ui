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
package root. Authoritative props for your installed version: the `.d.ts`
files in the package's `dist/`. Visual reference:
[gallery](https://neuronection.github.io/assistant-ui/).

| Module | Exports |
|---|---|
| `button` / `badge` / `card` | `Button`, `buttonVariants` · `Badge`, `badgeVariants` · `Card`, `CardHeader/Title/Description/Content/Footer` |
| `modal` / `panel-modal` | `Modal` + parts (compound Radix dialog) · `PanelModal` (header/body/footer shell, full-screen on mobile) |
| `confirmation-modal` / `form-modal` | `ConfirmationModal` · `FormModal` (form-in-modal shell: `headerActions`, reject button, busy states) |
| `popover` / `popover-button` | compound Radix `Popover` + parts · `PopoverButton` (self-contained trigger + panel, hover-open, lazy children, `closeSignal`) |
| `menu` / `context-menu` | `Menu`, `MenuTrigger/Content/Item/Separator/Label`, `ActionMenu` (items-driven) · `ContextMenu` (coordinate-anchored, `{x, y, items, onClose}`) |
| `combobox` | `Combobox`, `ComboboxMulti` — async mode (`onSearchChange` + `loading`), grouping, capability badges, full keyboard nav |
| `tooltip` | `Tooltip` + parts, `InfoTooltip` |
| `wizard` | `Wizard` (steps config + `renderStep`, per-step validation gates, modal/drawer variants), `Stepper` (dots/labels) |
| `input` / `textarea` / `search-input` / `expandable-search` | `Input` (label/hint/error wiring) · `Textarea` · `SearchInput` · `ExpandableSearch` |
| `chip-input` / `chip-list` | `ChipInput` (Enter/comma commit, paste-splits, Backspace-removes) · `ChipList` (variant pills, clickable, removable) |
| `time-picker` / `time-list` | `TimePicker` (clock face, 24h value, 12h UI, editable fields) · `TimeList` (time chips with per-chip pickers) |
| `date-picker` | `DatePicker` (popover calendar: days/months/years views, min/max, `allowClear`, arrow-key day grid, `unstyled` variant) |
| `range-bar` / `scale-slider` | `RangeBar` (low–high band + value dot) · `ScaleSlider` (+ `scaleColorForValue`) |
| `table` | `Table` (headers/rows, opt-in empty state) |
| `check-indicator` / `selection-bar` / `view-toggle` | `CheckIndicator` (tri-state) · `SelectionBar` (bulk-select bar) · `ViewToggle` (grid/list) |
| `error-banner` / `undo-notice` / `empty-state` / `spinner` | presentational feedback: alert banner with `action` slot · undo toast · `EmptyState` · `Spinner` |
| `info-button` / `field-label` / `copy-button` / `breadcrumbs` | `InfoButton` · `FieldLabel` · `CopyButton` (clipboard + copied state) · `Breadcrumbs` (SPA links via `linkComponent`) |
| `ai-button` / `ai-actions-dropdown` / `ai-magic-fill` | AI affordances: ask-with-suggestions (controlled open, icon-only mode) · action menu + custom prompt · describe-in-words fill modal — API calls stay app-side |
| `settings-shell` / `provider-form` / `connection-test-row` | `SettingsShell` (controlled two-pane nav) · `ProviderForm` (write-only API-key field) · `ConnectionTestRow` (idle/testing/ok/fail + latency) |
| `model-picker` / `task-assignment-picker` | `ModelPicker` (grouped provider→model combobox, capability chips) · `TaskAssignmentPicker` (task → model mapping rows) |
| `upload-dropzone` / `file-card` / `file-queue` | file attachment surface: dropzone (block/row) · card (status, include toggle) · queue (summary + reorder) |
| `marquee` | `useMarquee`, `MarqueeSurface`, `MarqueeBand` (rubber-band selection) |
| `portal` / `theme-scope` / `tokens` | `Portal` · `ThemeScope` · token name lists + types |

API rules: controlled-first, `className` merges (never replaces), `asChild`
where it makes sense, refs forwarded everywhere, English label props with
defaults (translate at call sites), icons as props. No fetching, no stores,
no router — data in, events out.

## Documentation

- [Adopting in an app](./docs/adoption.md) — the install/switchover recipe each family app follows (incl. the TW3 cascade notes)
- [Theming](./docs/theming.md) — tokens, app themes, dark mode, styling hooks
- [Adding a component](./docs/adding-a-component.md) — rules, checklist, required companions
- [Local development](./docs/local-development.md) — live-test library changes in the family apps without publishing
- [Publishing](./docs/publishing.md) — the Changesets release flow and CI setup

## Development

```bash
pnpm install
pnpm dev          # Ladle playground on :61000 (CSS watches alongside)
pnpm test --watch
pnpm verify       # lint + typecheck + test + build
```

Releases happen via [Changesets](./CONTRIBUTING.md) — CI publishes, never a
laptop.

## License

Apache-2.0 — same as the family apps this library was extracted from.
