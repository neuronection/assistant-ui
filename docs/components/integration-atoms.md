# Integration atoms

The integration kit's shared vocabulary atoms (plan 33 / ADR-0040): the
origin-class chip (D25 display law — an extension never renders as official
unless `bundled`), the family status badge (`ok | degraded | failing | stale`),
the tier badge (T0–T3) and risk-class-marked capability chips (D20 — every
risk class is charter vocabulary, never hand-typed). Everything renders from
the generated charter vocabularies in
[`@neuronection/assistant-ui/integration-contracts`](./integration-contracts.md).

## import

```ts
import {
  IntegrationCapabilityChips,
  OriginChip,
  StatusBadge,
  TierBadge,
  isExtensionOriginClass,
  isExtensionStatusState,
  isExtensionTier,
} from '@neuronection/assistant-ui/integration-atoms'
```

## props

- `OriginChipProps` — `originClass` (`ExtensionOriginClass`), `label?`,
  plus any `<span>` props (`className` merges, `data-testid` passes through).
  The chip carries `data-origin-class` so apps can restyle per class.
- `StatusBadgeProps` — `status` (`ExtensionStatusState`), `label?`, span
  props; carries `data-status`.
- `TierBadgeProps` — `tier` (`ExtensionTier`), `label?`, span props; carries
  `data-tier`.
- `IntegrationCapabilityChipsProps` — `capabilities:
  IntegrationCapabilityView[]` (`{ id, riskClass? }`), `labels?`
  (`Partial<Record<ExtensionRiskClass, string>>` for the risk marker),
  `capabilityTitle?` (chip tooltip prefix). Risk-marked chips carry
  `data-risk-class`.
- `isExtensionOriginClass` / `isExtensionStatusState` / `isExtensionTier` —
  narrow raw strings (registry/DB values) to the charter vocabularies.

## controlled contract

Non-interactive. All content is data-in; nothing emits.

## label/i18n contract

`label` / `labels` props with the raw vocabulary value as English default;
apps translate at call sites.

## accessibility

Non-interactive chips with text content; `title` tooltips only — see
[accessibility](../accessibility.md). Related:
[IntegrationCard](./integration-card.md),
[IntegrationInstancesList](./integration-instances-list.md),
[ConsentDialog](./consent-dialog.md).
