---
'@neuronection/assistant-ui': minor
---

New `@neuronection/assistant-ui/markdown-diff-view` subpath: `MarkdownDiffView`
renders a side-by-side **formatted** markdown diff — blocks are compared at the
markdown-block level (fenced code and `$$` display-math spans stay intact) and
render through the `chat-markdown` surface, so headings, KaTeX math, tables and
diagrams appear rendered instead of as source; unchanged blocks render once
full-width, changed blocks pair side-by-side with add/del tints, plus change
navigation and unchanged-block folds. `computeUnitDiff` (unit-array diff over
the existing engine) and `splitMarkdownBlocks` are exported alongside.
