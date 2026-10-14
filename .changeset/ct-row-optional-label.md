---
'@neuronection/assistant-ui': minor
---

`ConnectionTestRow`: `label` becomes opt-in — nothing renders when unset
(previously it defaulted to the word "Connection", forcing cards to
carry a filler word just to hold the line; the status text speaks for
itself). Consumers that want the word still pass it explicitly.
