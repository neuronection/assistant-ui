---
'@neuronection/assistant-ui': minor
---

Add the `skeleton` module: `Skeleton` (one block) and `SkeletonText` (a stack
of text lines) loading placeholders with a `--as-*` token shimmer that sweeps
via CSS `background-position` (no transforms, radius/circle safe) and disables
to static muted blocks under `prefers-reduced-motion`. Both primitives are
`aria-hidden` decorations; the docs pin the container pattern — the app-owned
loading region carries `aria-busy` while placeholders show.
