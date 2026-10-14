---
'@neuronection/assistant-ui': minor
---

New guided-setup wizard pieces: `SetupSteps` — the two-plus-step wizard
progress header (numbered badges, done check, current-step highlight,
`aria-current="step"`) — and `SetupAssignments` — the titled "Default
assignments" section (one bordered row per task, each a `SwitchRow` carrying
its live `now: … · fills: …` context). Both extracted from the four apps'
setup wizards (career/study/health/desktop), which currently hand-roll them
app-side; they adopt these on the next version bump.
