---
'@neuronection/assistant-ui': patch
---

fix(chat-tools-catalog): sentence-length scope values can no longer break the header row — the scope chip is capped at 40% of the row width with an ellipsis and exposes the full text via a native `title` tooltip, and the name/title slot wraps (`break-words`) instead of painting over the chip and chevron. Docs page, accessibility row, LongScopeAndName story, and a regression test added.
