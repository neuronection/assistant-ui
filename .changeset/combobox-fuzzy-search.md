---
'@neuronection/assistant-ui': patch
---

`Combobox` search is resilient and accurate: the default filter now ranks matches (exact > substring > token subsequence > bounded typo) instead of plain substring filtering — misspelled queries (`gemni`, `gemeni`, `vicion`) still find their models, separator-agnostic subsequences work (`qwen vl` → `qwen2.5-vl:7b`), and unrelated queries return nothing. New `src/lib/fuzzy` exports `fuzzyScore`/`searchScore` for app reuse.
