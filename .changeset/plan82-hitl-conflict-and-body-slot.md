---
"@neuronection/assistant-ui": minor
---

chat-hitl: `HitlProposalCard` gains the study-promoted resolution extras —
a `children` body slot rendered between the field rows and the actions
(app-owned target/edit summaries, rendered diffs, previews), an app-supplied
`conflictNote`, and conflict-resolvable actions with a `reapply` label
(approve re-applies the refreshed diff instead of dead-ending the card).
