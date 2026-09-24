---
'@neuronection/assistant-ui': patch
---

`DetailValue` panes grow with content instead of cropping: the pairs rows, value chips and the preformatted fallback moved from `max-h-40` to `max-h-96`, so a tool response or trace payload is readable in full without scrolling past a cut-off stub.
