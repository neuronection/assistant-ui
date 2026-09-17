---
'@neuronection/assistant-ui': minor
---

chat-hitl: structured collection diff rows, preview slot, reverted status

`FieldDiff`/`FieldSummary` render structured collection values (lists of
plain objects — plan 99's skills/achievements/links rows) as chip rows
with the entry's label + role/level suffix; scalar strings and string
arrays render exactly as before. `HitlProposalCard` gains an optional
`onPreview?: () => void` slot (ADR-006 tier 3 — the library owns the
button + a11y, the app owns what a preview is) shown on pending and
approved/reverted cards, and the terminal `reverted` status variant for
undone approved cards (plan 99). New stories: `Reverted`, `PreviewSlot`.
