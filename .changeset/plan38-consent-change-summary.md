---
"@neuronection/assistant-ui": minor
---

Consent change-summary depth (plan 38 W6): `IntegrationConsentChangeView` carries the machine `changed` manifest-group list and `ConsentDialog` renders it — "what changed" (version, i18n, report, data, provenance, capabilities, configSchema), not just "something changed". Additive; the desktop host feeds `manifestDiff.changed`.
