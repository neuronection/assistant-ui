---
'@neuronection/assistant-ui': minor
---

feat(segmented-tabs): new `SegmentedTabs` component — a pill-style
segmented control with a raised sliding thumb for compact tab switching
(inspector panels, view/filter switches). Full ARIA tabs semantics:
roving `tabIndex`, automatic activation on Arrow/Home/End (wrap-around,
skips disabled items), `aria-selected`, decorative thumb. Tokens-only
styling with `data-as="segmented-tabs"`; thumb motion respects
`prefers-reduced-motion`. First consumer: career-assistant CV builder
inspector.
