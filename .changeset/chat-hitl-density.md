---
'@neuronection/assistant-ui': minor
---

`chat-hitl` gains a presentational `density: 'compact' | 'full'` prop on `HitlProposalCard`, `FieldDiff` and `FieldSummary` (default `full`, so existing consumers are unchanged). Compact density caps the visible rows behind a "Show all N fields" expander (`CappedRows`, never a silent truncation) and shrinks long-text diff/summary bodies; full density renders everything. Lets space-constrained chat surfaces (bubble/docked) stay scannable while wide surfaces and preview modals show the complete proposal.
