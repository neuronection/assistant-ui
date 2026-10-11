---
'@neuronection/assistant-ui': minor
---

**Transcript modernization (plan 100 S5):** `ChatTranscript` + `ChatMessage` gain the modern layout option and navigation polish.

- **Flat design:** `design="flat"` on `ChatTranscript` (feeds the default renderer) or `ChatMessage` — assistant content renders as prose on the panel surface while the user keeps its bubble; `data-design` styling hook for apps. Default stays `bubbles` — opt-in, zero migration.
- **Consecutive-message grouping:** `groupConsecutive` tightens spacing between same-role runs and tags rows `data-group-pos` (`single | start | mid | end`, system rows always `single`); `renderItem` now receives the position as a third argument (render group-start avatars only).
- **Avatar slot:** optional `ChatMessage avatar` node — leading for assistants, trailing for users (`data-as="chat-message-avatar"`).
- **Unread jump pill:** assistant replies that land while the user is scrolled away are counted; the pill label reads "Scroll to latest — N new messages" (new `labels.newMessages`), shows a `9+` badge chip beyond nine, and resets on return-to-bottom or pill click. The pill slides up in instead of teleporting.
- **Depth + chrome:** top fade mask while scrolled into the thread (`data-fade-top`) and thin themed scrollbars (`--as-scrollbar-thumb`/`--as-scrollbar-track` tokens, progressive enhancement).
- **Fix:** the jump pill no longer positions with a translate utility (TW3 double-apply hazard) — margin-centering, identical geometry.

Consumers: everything is opt-in (`design`, `groupConsecutive`, `avatar`); the unread pill and scroll polish are automatic on the next dependency bump.
