# @neuronection/assistant-ui

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
