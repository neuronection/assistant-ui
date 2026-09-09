---
'@neuronection/assistant-ui': patch
---

fix(a11y): ChatSessionList and ChatToolsCatalog no longer render their empty/no-matches `<p>` states as children of `role="list"` (aria-required-children, critical — a list expects listitem children). The `role="list"` container now renders only when there are items to show; empty and no-results states render standalone with unchanged copy and styling. Found by desktop-assistant's new exclusion-free axe scans of the chat desktop window; regression axe tests for both components and a SessionListEmpty Ladle story added.
