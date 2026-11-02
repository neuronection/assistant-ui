---
'@neuronection/assistant-ui': minor
---

**ContextMenu supports grouped items.** `ContextMenuProps.items` widens from
`ContextMenuItem[]` to `ContextMenuEntry[]` — an entry is either an action or
`{ key, separator: true }`, which renders a non-focusable divider between item
groups (filter actions above navigation is the motivating shape).

**Migration (all apps):** none — plain `ContextMenuItem[]` arrays type-check
unchanged; existing menus render identically. To group, interleave
`{ key: 'sep', separator: true }` entries. New exports: `ContextMenuEntry`,
`ContextMenuSeparator`. Docs: `context-menu.md` props table + grouped example;
story `menu--context-menu-separator-story`.
