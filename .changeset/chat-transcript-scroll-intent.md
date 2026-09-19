---
'@neuronection/assistant-ui': patch
---

Fix chat-transcript stick-to-bottom fighting the reader on fast streams: upward scroll intent (wheel-up, touch drag up, scroll-up keys) now cancels the follow synchronously and any upward scroll event breaks it, so a partial scroll-up inside `scrollThresholdPx` no longer gets re-pinned to the bottom before the user finished reading; scrolling back to the bottom (or the jump pill) re-arms the follow
