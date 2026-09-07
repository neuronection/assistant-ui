---
'@neuronection/assistant-ui': patch
---

ChatPanel: the header row is now landmark-free — it renders as
`div[data-as="chat-panel-header"]` instead of a bare `<header>`, which
browsers map to a `banner` landmark. Panels embedded inside an app-level
`main`/region landmark (the desktop-assistant bubble launcher and any
app that wraps the host in its page landmark) no longer trigger axe's
`landmark-banner-is-top-level`; the row keeps its styling contract via
the new `data-as` hook. This makes the implementation match the
documented contract (the chat-panel page already promised a plain
landmark-free row).
