---
'@neuronection/assistant-ui': patch
---

SidebarNav: closing a rail flyout now cancels the pending hover-open timer, so
leaving and immediately returning cannot reopen a flyout that was just
dismissed.
