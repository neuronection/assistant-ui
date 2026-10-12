---
'@neuronection/assistant-ui': minor
---

**Media & list polish (plan 101 P4):**

- **Image lightbox:** `MarkdownSurface lightbox` — markdown images become labelled zoom buttons opening the library `Modal` (Escape closes, Radix focus handling). Aimed at health's medical images and study screenshots; inert images remain the default.
- **Inline session rename:** `ChatSessionList onRenameCommit(id, title)` — the rename action edits the title in place (autofocused input, Enter/blur commits, Escape cancels, keystrokes never select the row). Dialog-based `onRename` flows are unchanged.
- **Session rows stagger in** (30 ms steps, `as-slide-up`, reduced-motion safe) via the new `data-as="chat-session-rows"` hook.
- **New `ChatSuggestionCard`** (`@neuronection/assistant-ui/chat-suggestion-card`) — the standard suggestion chip for `ChatWelcome suggestions` and composer strips: icon + title + hint, real labelled button, hover lift via border/shadow (no transform utilities — TW3-safe).

New labels: `MarkdownSurface` `zoomImage`/`closeImage`, `ChatSessionList` `renameInput`.
