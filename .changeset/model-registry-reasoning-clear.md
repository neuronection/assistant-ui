---
'@neuronection/assistant-ui': patch
---

`ModelRegistry` draft payloads always carry `reasoningEffort` (empty string when cleared) so apps can distinguish "unset" from "cleared" — previously clearing the field sent `undefined` and the stored value could never be removed.
