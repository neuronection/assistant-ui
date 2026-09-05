---
'@neuronection/assistant-ui': minor
---

New `text-diff-view` module: gitlens-style side-by-side diff view (line-level LCS diff with word-level intra-line highlighting, per-side line numbers, prev/next change navigation with active-block tint, expandable/re-collapsible unchanged-line folds, virtualized rows) plus exported `computeLineDiff` / `wordSegments` engine. Adds `@tanstack/react-virtual` as a dependency. Labels are props/callbacks with English defaults.
