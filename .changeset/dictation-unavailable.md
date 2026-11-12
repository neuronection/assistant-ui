---
"@neuronection/assistant-ui": minor
---

Add `DictationUnavailable`, the presentational sibling state for
speech-to-text capability gates: an app-resolved reason plus an optional
settings action (a label without a handler renders nothing). `DictationButton`
and its props are unchanged; apps choose between the mic and the unavailable
surface.
