# IntegrationCard

The registry card (plan 33 / ADR-0040 D25 — one registry view, origin-first):
identity (icon/name/version), provenance verbatim (author/license/repository),
origin chip, tier badge, risk-marked capability chips, update states
(available + re-consent, digest drift with `role="alert"`), and typed action
callbacks out. Extensions carry N instances — pass `instanceCount` for the
summary; the instances render through
[IntegrationInstancesList](./integration-instances-list.md). App-owned domain
content (health's tabs, career's probe wiring) renders into the `children`
detail slot or takes over the whole action row via `renderActions`.

## import

```ts
import { IntegrationCard } from '@neuronection/assistant-ui/integration-card'
```

## props

- `extension: IntegrationExtensionView` — the identity data (see
  [integration-contracts](./integration-contracts.md)).
- `enabled?: boolean | null` — the aggregate enable state (app-owned
  semantics); the toggle renders only when set and `onEnable` is provided.
- `instanceCount?: number | null` — configured-occurrences summary.
- `busy?: boolean` — disables affordances while app-side work runs.
- `labels?: IntegrationCardLabels` — every visible string (English defaults).
- `onEnable?(extension, enabled)` / `onConfigure?(extension)` /
  `onPark?(extension)` / `onRestore?(extension)` / `onRemove?(extension)` /
  `onApplyUpdate?(extension)` — each button renders only when its callback is
  provided (Apply update only when `update.state === 'available'`).
- `renderActions?(extension)` — replaces the default action row.
- `icon?: LucideIcon` — optional identity icon (props, conservative default:
  none).
- `children` — the detail slot (app content).
- `className` — merges.

## controlled contract

Fully controlled: the view-model is the truth; every mutation is an emitted
user act (enable/park/remove are explicit — never auto-fired; updates never
auto-apply, clause 21).

## label/i18n contract

`labels` with English defaults: `authorLabel`, `licenseLabel`,
`repositoryLabel`, `capabilitiesLabel`, `instancesLabel`,
`updateAvailableLabel`, `reconsentRequiredLabel`, `digestDriftLabel`,
`applyUpdateLabel`, `enableLabel`, `disableLabel`, `configureLabel`,
`parkLabel`, `restoreLabel`, `removeLabel`, `enabledAriaLabel`.

## accessibility

The enable toggle is an `aria-label`ed checkbox; actions are labelled
buttons; digest drift renders with `role="alert"`; provenance is a `dl`. See
[accessibility](../accessibility.md).

Related: [IntegrationCatalogGrid](./integration-catalog-grid.md),
[IntegrationInstancesList](./integration-instances-list.md),
[integration-atoms](./integration-atoms.md).
