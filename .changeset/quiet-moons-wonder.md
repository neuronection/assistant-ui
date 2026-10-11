---
'@neuronection/assistant-ui': minor
---

**Streaming choreography (plan 100 S2):** the live turn now reads as one continuous animation instead of abrupt swaps.

- **New `ChatPending`** (`@neuronection/assistant-ui/chat-pending`) — the first-token latency placeholder: a narrated phase row (`ChatTurnStatus`: dots + elapsed timer) over an assistant-aligned shimmer bubble tinted with the `--as-ai` accent. Render it as the transcript's `live` tail between send and the first delta (`label`, `startedAt`, `lines`, `children` props).
- **`MarkdownSurface`:** `streaming` now renders a pulsing `--as-ai` caret at the tail of the last block (static but visible under reduced motion) — the "still generating" signal after the pending handoff.
- **`ChatReasoning`:** `--as-ai` edge while streaming; expand/collapse animates through the `.as-collapse` height reveal; new `autoCollapse` prop (default `true`, uncontrolled mode only) folds the block when `streaming` turns true → false — a controlled `open` is never auto-collapsed, and a block that never streamed never folds.
- **`ChatToolCard`:** `--as-ai` edge while running; the running → done transition crossfades into a stroke-drawn check; args/result panes reveal through the animated collapse (collapsed panes are `visibility: hidden` — out of the a11y tree and tab order, so screen-reader behavior matches the old conditional render).
- **`ChatTurnStatus`:** phase-label changes crossfade (`--as-duration-fast`).

All effects are compositor-only, mount-keyed (stream re-renders never restart them), and disabled under `prefers-reduced-motion: reduce` with state staying legible. Consumers: compose `ChatPending` into the `live` tail per `docs/guides/chat-surfaces.md`; everything else is automatic on the next dependency bump.
