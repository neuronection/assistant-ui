---
'@neuronection/assistant-ui': minor
---

web-search-providers: the ADR-0035 settings surface moves to the
AI-providers UI pattern. `WebSearchProvidersPanel` keeps its controlled
props contract but now renders a ProviderCard list (type/priority/disabled/
no-key badges, base-URL subtitle, probe status line) with the management
actions — enable/disable, reorder, test, edit, delete — in the `⋯` overflow
menu; Add swaps in a tiles → form wizard (SetupSteps progress, ProviderSetupTiles
fed from the catalog, then the catalog-driven settings form). New composable
exports for apps wanting their own chrome: `WebSearchProvidersList`,
`WebSearchProviderWizard`, `WebSearchProviderSettingsForm`,
`WebSearchProviderTiles`. Catalog fields gain `type: 'text' | 'number'`,
`advanced` (renders under the form's Advanced disclosure) and `hint`;
save inputs carry the extra `fields` bag; the panel's `labels` accepts the
wizard/form/list label sets. Visual baselines for the two existing stories
change with the redesign — re-baseline via the `visual-rebaseline` workflow.
