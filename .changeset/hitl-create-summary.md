---
'@neuronection/assistant-ui': minor
---

feat(chat-hitl): create-mode summaries on `HitlProposalCard` — a new
optional `action` prop (`create | update | delete`) swaps the before→after
diff for a clean item summary (`FieldSummary`) on create proposals:
empty fields are skipped, fields render as label/value rows and long
text as a plain prose block (no red/green TextDiffView — there is no
before-state to diff against). Update/delete cards keep the classic
diff; the prop defaults to undefined for full backwards compatibility.
First consumer: career-assistant chat HITL cards.
