---
'@neuronection/assistant-ui': minor
---

Phase-4 assistant patterns: new `AiButton` (sparkles trigger + popover with
suggestion chips, typed prompt, loading/error state and an `onResponse` render
slot — the app owns the API call) and `AiActionsDropdown` (action list +
optional custom prompt, `onAction`/`onPrompt` callbacks). `AiBadge` folds into
the existing `Badge variant="ai"` instead of a new component; health's live
task-monitor AIBadge stays app-side (store-coupled, ADR-006).
