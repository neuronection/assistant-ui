---
'@neuronection/assistant-ui': minor
---

**In-chat search (plan 101 P2):** find anything in the conversation without leaving the transcript.

- **`ChatTranscript search`** prop (`{ query, onQueryChange }`): renders the new **`ChatSearchField`** above the log — a labelled query input with an `n/N` match readout and prev/next controls. Enter jumps to the next match, Shift+Enter to the previous, Escape clears. The active match scrolls into view with a one-shot flash (`data-search-flash`, reduced-motion safe).
- **`MarkdownSurface query`** prop: case-insensitive matches wrap in `<mark data-as="chat-search-match">` (warning-tinted) via a hand-rolled hast walker — no new dependency, zero cost when no query is set.
- Custom `renderItem` receives the active query as its fourth argument; transcript rows now carry `data-message-id` for anchor queries.
- `ChatSearchField` is exported from the `chat-transcript` module (and the root) for standalone composition; new transcript labels: `search`, `searchPlaceholder`, `previousMatch`, `nextMatch`, `clearSearch`, `matches`.

Jump-scrolling requires a non-virtualized transcript (documented); virtualized transcripts highlight visible rows only.
