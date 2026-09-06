---
'@neuronection/assistant-ui': minor
---

chat-core — the headless core of the shared chat layer (plan dev/plans/11,
ADR-0009): `useChatStream`, a transport-injected live-turn state machine
(send → pending → streaming → done/error/interrupted) with coalesced
text/reasoning deltas, tool-call observations, HITL interrupts (resumable)
and a retryable watchdog; `liveTurnReducer`, the pure fixture-testable turn
machine; `ChatMessageView`, the normalized message contract every chat
renderer speaks; `ChatStreamEvent`, the family §5 vocabulary (+ `tool_call`
observation event); and the branch-tree utilities behind OpenWebUI-style
versioning (`buildBranchTree`, `linearTree`, `walkActivePath`,
`activePathSet`, `variantInfo`). No fetching, stores or i18n — apps inject
the transport (WS/SSE adapters ~50 lines), own sessions and persistence.
