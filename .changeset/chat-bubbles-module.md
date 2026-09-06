---
'@neuronection/assistant-ui': minor
---

chat bubbles (plan 11 L3): `ChatMessage` — the family chat bubble with
role alignment, hover+focus action row (copy/edit/regenerate + app
extras), OpenWebUI-style `‹ n/N ›` variant switcher, inline
edit-and-resend (`ChatMessageEditor`: Cmd/Ctrl+Enter saves, Escape
cancels), reasoning and below-content slots, badge/chip/attachment rows,
and accessible error + interrupted states; `ChatReasoning` — the
collapsible thinking block that streams live reasoning deltas;
`ChatToolCard` — inline tool-call observation with status, duration and
expandable args/result panes.
