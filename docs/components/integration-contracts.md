# Integration contracts

The integration kit's generated vocabulary + app-side mapping target (plan
33 / ADR-0040 D11): the charter vocabularies (origin classes, categories,
status, lifecycle, tiers, capability ids, risk classes, error codes, ref
strategies, surfaces, the verbatim consent disclosures) are GENERATED from
the vendored `contracts/extension-charter.json` — ids and shapes can never
drift from the contract — plus the kit's view-model types each product maps
its registry/instance data INTO.

## import

```ts
import {
  parseIntegrationConfigSchema,
  INTEGRATION_VIEW_MODELS_VERSION,
  EXTENSION_ORIGIN_CLASSES,
  EXTENSION_CONSENT_DISCLOSURES,
} from '@neuronection/assistant-ui/integration-contracts'
import type {
  IntegrationExtensionView,
  IntegrationInstanceView,
  IntegrationSourceRowView,
  IntegrationConsentPayloadView,
} from '@neuronection/assistant-ui/integration-contracts'
```

## view-models (the mapping target)

- `IntegrationExtensionView` — one extension (identity): `id, name, version?,
  summary?, originClass, tier, kind?, categories?, capabilities?, provenance?,
  digest?, update?, metadata?`.
- `IntegrationCatalogEntryView` — extends the extension view with
  `hostCompat? { compatible, reason }` (self-disable reasons render
  verbatim) and `installedInstanceCount?`.
- `IntegrationInstanceView` — one configured occurrence (D19): `id,
  extensionId?, name, enabled, status?, lastSuccessAt?, consecutiveFailures?,
  conditions? ('needs-config' | 'needs-secret'), originClass?, tier?,
  lifecycle?, parked?, managedBy? ('manual' | 'gitops'), digest?, update?,
  metadata?`.
- `IntegrationExtensionGroupView` — `{ extension, instances[] }` (extension →
  N instances; the grouping the list components render).
- `IntegrationSourceRowView` — one git/local source: `id, kind ('git' |
  'local'), origin, status?, error?, lastCheckedAt?, lastSuccessAt?,
  consecutiveFailures?, refStrategy?, refValue?, gitops?, candidates:
  IntegrationDiscoveredView[], groups: IntegrationExtensionGroupView[]`.
- `IntegrationDiscoveredView` — one discovered manifest: `extensionId, name?,
  digest, ref?, compatible, reason?, tier?, originClass?, consent?`.
- `IntegrationConsentPayloadView` — what a consent surface MUST show
  (clause 21): `variant ('install' | 're-consent' | 'update'), extensionId,
  version?, tier, importClass, capabilities, provenance (verbatim), digest,
  disclosure (verbatim law text — data, never library copy), disclosureKey?,
  changeSummary? (added/removed capabilities, version/digest/apiVersion
  moves), metadata?`.
- `IntegrationConfigSchema` / `IntegrationConfigSchemaField` — the charter's
  JSON-Schema subset (string/number/boolean/array + enum/default/min/max/
  length/pattern/items + `x-secret`).
- `IntegrationConfigFieldView` — the parsed field descriptor the config form
  renders; `parseIntegrationConfigSchema(schema)` does the deterministic
  mapping (required list + x-secret folded in).
- `IntegrationConfigValues`, `IntegrationConfigSaveInput` (`{ values,
  secrets }` — secret values cross props once, on the way out),
  `IntegrationConfigValidationView` (`{ state: 'validating' | 'error' |
  'success', message?, fieldErrors? }` — the host's async validation result).
- `IntegrationSourceDraft` — the add-source form output: `url, localPath,
  refStrategy, refValue, subpath, secretSlot?, secretValue?`. Apps validate
  the descriptor against the family `extension-sources.schema.json`.

## generation + drift walls

`scripts/sync-extension-vocab.mjs` (canonical:
`dev/scripts/sync-extension-vocab.mjs`, byte-identical copies) regenerates
`src/contracts/extension-charter.vocab.ts` from the vendored charter. The
library suite regenerates and compares byte-for-byte; dev's
`verify-wiring.sh` ext probe keeps the vendored JSON artifacts
byte-identical to the canonicals. Related: all integration components.
