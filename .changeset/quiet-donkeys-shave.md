---
'@neuronection/assistant-ui': minor
---

Add two additive provider-setup affordances: `ProviderSetupForm.hideName` omits the connection-name input while keeping the controlled value intact, and `ProviderSetupManualTile.icon` lets a companion grid tile (for example local-engine detection) render a distinct Lucide icon without forking the component. Existing callers render unchanged.
