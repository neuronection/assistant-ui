---
'@neuronection/assistant-ui': minor
---

SidebarNav: new `compact` prop — a denser layout for short viewports (tighter item padding, smaller icons/typography, slimmer list/pinned/footer regions, `data-as-compact` on the root). Presentational and controlled per ADR-006: the app owns the trigger (e.g. a `max-height` media query hook) and decides whether to hide its footer block in the same state. Composes with `collapsed`; keyboard traversal and the a11y contract are unchanged.
