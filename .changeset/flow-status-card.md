---
'@neuronection/assistant-ui': minor
---

New `flow-status` module: `FlowStatusCard`, a presentational + controlled
card for multi-step AI flows (per-node status, current-step emphasis,
progress summary, error + `retryable`, controlled `onRetry`/`onCancel`/
`onResume`, `detail` payload slot). Apps map the family event vocabulary
(`flow_started`/`node_*`/`flow_failed`/`interrupt`) to props; the component
never sees transports.
