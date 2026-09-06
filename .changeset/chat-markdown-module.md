---
'@neuronection/assistant-ui': minor
---

chat-markdown — the family's read-only streaming markdown surface (plan 11
L2): `MarkdownSurface` renders GFM tables, KaTeX math (error-tolerant
while streaming), lazily-imported mermaid diagrams (strict security,
code-block fallback), and copyable code blocks with language tags. Raw
HTML never renders (model output is untrusted); URLs pass a safe default
transform with an override for app schemes (mentions, citations). KaTeX
CSS joins `styles.css` with fonts shipped in `dist/fonts`; base chat
typography is scoped to `[data-as="chat-markdown"]` so it survives app
preflight. First markdown/math/diagram dependencies in the package —
isolated behind the `chat-markdown` subpath; apps that don't import it
bundle nothing extra.
