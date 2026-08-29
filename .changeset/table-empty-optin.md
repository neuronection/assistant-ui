---
'@neuronection/assistant-ui': patch
---

`Table`'s `emptyText` is opt-in now: an empty table renders no filler row
unless `emptyText` is provided (health-assistant shows nothing for empty
tables; pass `emptyText` to keep the previous default-row behavior).
