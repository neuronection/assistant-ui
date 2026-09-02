---
'@neuronection/assistant-ui': minor
---

New `SidebarNav` component: the family-standard vertical navigation panel
(groups + section dividers, icons, badges, controlled `activeId`, optional
collapsed icon rail with hover flyouts, header/footer slots). Fully
presentational + controlled per ADR-006 — routing, role filtering and i18n
stay app-side. Ships with keyboard-nav + axe assertions, Ladle stories and
a docs page; adoption across the family apps is tracked in the nav
primitives program (family ADR-0007).
