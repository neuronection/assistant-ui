---
"@neuronection/assistant-ui": patch
---

**Deps (security):** katex ^0.16.47 → ^0.19.0 and a pnpm override pinning the whole markdown-math chain (rehype-katex, mermaid, micromark-extension-math — all still declare ^0.16) to the patched line, closing GHSA-238p-pmpm-9mq7 (low; prototype pollution can bypass KaTeX trust restrictions, fixed >0.18.1). 0.18.11 is a deprecated accidental breaking release — 0.19.0 is the maintained fixed line. `pnpm verify` green; inline/display math rendering covered by `tests/chat-markdown.test.tsx`. Note for consumers: npm/pnpm ignore overrides declared inside dependencies, so apps carrying the transitive chain need their own root override until rehype-katex/mermaid declare patched ranges (health-assistant did this in the same pass).
