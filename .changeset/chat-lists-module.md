---
'@neuronection/assistant-ui': minor
---

chat lists (plan 11 L5): `ChatTranscript` — the conversation list with
`role="log"` semantics, polite screen-reader announcements on assistant
turn completion (never per token), stick-to-bottom auto-scroll with a
jump-to-latest pill, and optional dynamic-measurement virtualization for
thousand-message threads; `ChatBranchTree` — the OpenWebUI-style branch
rail (commit-graph rows, active-path dots, fork badges, full WAI-ARIA
tree keyboard navigation) over the family branch-tree contract;
`ChatSessionList` — fuzzy-searchable, date-grouped session list with
opt-in rename/delete/export row actions.
