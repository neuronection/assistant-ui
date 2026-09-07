---
'@neuronection/assistant-ui': patch
---

`ChatDrawer` now forwards its `ref` to the drawer content element
(`[data-as="chat-drawer"]`). The render function previously accepted no
`ref` parameter, which triggered React's "forwardRef render functions
accept exactly two parameters" development warning in every app using
the drawer.
