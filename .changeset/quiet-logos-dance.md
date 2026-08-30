---
'@neuronection/assistant-ui': minor
---

Add logo module with inline brand marks for the Assistant family: `NeuronectionMark`, `NeuronectionWordmark`, `CareerMark`, `StudyMark`, `HealthMark`. All are theme-aware (`theme="light" | "dark"`, mirroring the hub artwork pairs), decorative and non-focusable by default, labeled via an optional `title` prop, sized via `size`, and use per-instance gradient ids so several marks can share a page. The wordmark also accepts `mono` for a `currentColor` fill. Brand artwork keeps its fixed fills as a deliberate exception to the semantic-token rule.
