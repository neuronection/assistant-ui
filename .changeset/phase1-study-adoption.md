---
'@neuronection/assistant-ui': minor
---

Phase 1: 16 new modules for study-assistant full adoption

- PopoverButton: self-contained trigger+panel popover on Radix (hover-open, lazy children, closeSignal, controlled mode)
- InfoButton + FieldLabel: info affordances with popover help
- Menu: Radix DropdownMenu primitives (Menu, MenuItem, MenuContent…) + items-driven ActionMenu
- ContextMenu: coordinate-anchored menu with full Radix keyboard/typeahead semantics
- Combobox + ComboboxMulti: WAI-ARIA listbox pattern, grouping, async mode (onSearchChange + loading), multi-select, clearable
- FormModal: form-in-modal shell (submit/cancel/busy/disabled) on Modal primitives
- Wizard + Stepper: wizard state machine with per-step validation gates, modal and drawer variants; dots/labels steppers
- Ported from study-assistant ui/: CheckIndicator, SearchInput, ExpandableSearch, SelectionBar, ViewToggle, ErrorBanner, UndoNotice, Marquee (useMarquee/MarqueeBand/MarqueeSurface)

All components: forwardRef where DOM-emitting, semantic --as-* tokens only, data-as hooks, English-default label props, keyboard-nav + axe tests.
