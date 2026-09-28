---
'@neuronection/assistant-ui': minor
---

**ProfileSwitcher redesign**: the trigger becomes an avatar chip (round
avatar + name + chevron, `UserMenu`-style) instead of an outline button;
the panel moves to the Menu aesthetic (`w-80`, `backdrop-blur-xl`,
`--as-shadow-pop`) with a titled header + profile count. Rows are roomier
(size-8 ringed avatars, `font-medium` names) with pill badges — the
accent-tinted `Current` pill replaces the bare check text, `Default` gets a
muted pill — and the row actions compact to `size-7` ghost icon buttons
(delete hovers to danger). The create row gains an inline `+` prefix icon,
`↓/↑`/`Home`/`End` now walk the rows, and loading gets `as-anim-fade` +
`role="status"`. No API changes: every label, icon and callback prop is
unchanged.
