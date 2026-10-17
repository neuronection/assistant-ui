---
'@neuronection/assistant-ui': minor
---

Integrations UI kit (plan 33 / ADR-0040): the family add / import /
configure flows as ten presentational modules, generated from the vendored
extension-charter contract (`@neuronection/assistant-ui/integration-contracts`
— vocabulary + view-models regenerated from `contracts/extension-charter.json`
by `sync-extension-vocab.mjs`, byte-identity walled in the test suite and by
dev's verify-wiring probe).

- Registry surfaces: `IntegrationCard` (identity, verbatim provenance, D25
  origin chip, tier badge, risk-marked capability chips, update +
  digest-drift states, typed actions out, detail/actions slots),
  `IntegrationCatalogGrid` (charter-category groups, controlled search,
  host-compat reasons verbatim, loading/error/empty),
  `IntegrationInstancesList` (instances grouped under their extension —
  one extension, N configured occurrences — with needs-config/needs-secret
  conditions and runtime fields), `IntegrationSourcesList` (sources with
  status, pinned-ref short forms, GitOps indicators, candidates that hand
  off to the host's consent flow).
- Flow dialogs: `AddIntegrationSourceDialog` (one flow for git + local
  sources, sealed credential slot, fetch/validate progress),
  `ConsentDialog` (install + capability-growth re-consent + update — the
  charter payload rendered VERBATIM, the D22 law disclosure as data, the
  change summary above the law text), `IntegrationConfigForm`
  (JSON-schema-subset fields, `x-secret` password fields with hint-only
  sealed slots, async host validation via `onValidate` + the `validation`
  result prop).
- Extension-content dialogs: `ActionResultDialog` (hosts SurfaceRenderer
  for declarative result payloads — loading/error/retry, typed actions
  out, per-product chrome slot), `DocsDialog` (bundle docs tree with an
  app-owned content slot).
- Atoms: `OriginChip`, `StatusBadge`, `TierBadge`,
  `IntegrationCapabilityChips` (risk-class-marked).
- `ExtensionSourcesPanel` (plan 32 Phase 3) is absorbed by this kit and is
  REMOVED before its first release — it was never published; career's
  Phase-3 local surface swaps onto the kit in the same wave. The pending
  extension-sources changeset is folded into this one.

Rides the owner's next Version-Packages wave together with the pending
surface-renderer changeset — do not publish from a laptop.
