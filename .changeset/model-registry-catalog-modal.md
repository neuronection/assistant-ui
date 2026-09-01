---
'@neuronection/assistant-ui': minor
---

`ModelRegistry` moves model add/edit into a **catalog modal** (replacing the inline draft panel and always-visible catalog zone): the picker is a searchable, scrollable `ModelPicker` over the provider's live catalog with a manual-id escape hatch; the draft form gains a **reasoning-effort dropdown with a Custom… option** (free-text), plus **clearable temperature and max-tokens fields** (empty = unset, `null` in drafts/patches — apps persist them per model). Registered rows keep edit/delete; Add-all moves to the modal footer. New labels: `addTitle`, `editTitle`, `selectModelLabel`, `manualIdToggleLabel`, `customOptionLabel`, `temperatureLabel`, `maxTokensLabel`, `emptyProviderLabel`, `externalIdRequiredLabel`; removed: `browseLabel`, `configureLabel`, `addedLabel`, `capFilterLabel`, `unclassifiedLabel`, `manualAddLabel`, `externalIdLabel`, `reasoningEffortPlaceholder`.
