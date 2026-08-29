---
'@neuronection/assistant-ui': minor
---

Phase-3 groundwork for health-assistant adoption: `FormModal` gains
`headerActions`, `onReject`/`rejectLabel`, `hideFooter` and `bodyClassName`
(health's HITL flows need them); new `CopyButton` (clipboard with legacy
fallback, copied state, `onCopied`/`onCopyError` callbacks — apps own
toasts/i18n) and `Breadcrumbs` (router-free: `linkComponent` prop for SPA
links); `themes/health.css` now matches health's real blue-600 accent with a
`.dark` token block for its class-based dark mode.
