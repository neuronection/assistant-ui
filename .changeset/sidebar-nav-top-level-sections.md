---
'@neuronection/assistant-ui': minor
---

`SidebarNav`: top-level `NavItem` entries now accept `section` — a divider
label rendered above the item (first occurrence only) so flat sidebars can
group their entries visually without nested expand/collapse. Sections are
ignored in the collapsed rail. (Career's sidebar adoption is the first
consumer; matches the existing child-level `section` dividers.)
