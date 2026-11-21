---
"@neuronection/assistant-ui": patch
---

`sidebar-nav`: the collapsed rail's flyout entries highlight on hover again.

- Flyout children styled their background on `focus` only (no `hover`), so a
  pointer could never move the highlight: Radix's mount autofocus planted it
  on the first child and it stayed there while the mouse travelled. They now
  paint on `hover` and `focus-visible`, matching the inline sub-item style.
- A **hover**-opened flyout no longer takes focus at all (nor returns it to
  the trigger on close): hovering the rail must not move the caret. Click and
  keyboard opens keep the menu-standard focus handling — first child on open,
  trigger on close.
