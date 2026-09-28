---
'@neuronection/assistant-ui': minor
---

**UserMenu**: removed the legacy flat identity props (`name`, `email`, `avatarUrl`) — pass the structured `user` prop instead (every family app already does). New `themeLayout` prop (`'auto' | 'submenu' | 'inline'`, default `'auto'`) makes the appearance-section layout explicit instead of inferred from `themeLabels` cardinality. Single-option toggle rows now report `system → light` when toggled off (was `dark`).
