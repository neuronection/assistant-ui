---
'@neuronection/assistant-ui': minor
---

`auth-gate` gains `AuthGate`, the shared session gate (identity-auth §4,
plan 16 Phase 5 closeout): the gate owns the `checking → authenticated |
anonymous` boot machine and its rendering, the app owns the endpoints —
`boot` (cookie → refresh → desktop exchange) resolves the session,
`login`/`checking` come in as app-composed nodes, `resetKey` replays the
machine for mid-session 401s, post-login transitions and forced drops,
`onStatusChange` reports transitions out. A rejecting boot reads as
anonymous (never wedged on checking). First consumers are study's
`SessionGate` (local `AuthGate` state machine deleted) and career's
`SessionGate` (local `ProtectedRoute` gate deleted; `dropToLogin()` keeps
its zero-round-trip semantics by answering the replayed boot from the
store verdict).
