---
'@neuronection/assistant-ui': minor
---

feat(chat-hitl): human-in-the-loop proposal card module —
`HitlProposalCard` renders a persisted mutation the user resolves:
field-level before/after diffs (`FieldDiff`, long text through
`TextDiffView`), Approve/Reject actions with an armed two-step confirm
for destructive ops, and pending/approved/rejected/conflict/expired
states. Presentational + controlled (status is a prop, resolve is an
event) so proposing surfaces keep transport app-side. First consumer:
career-assistant plan 77 (chatbot profile editing).
