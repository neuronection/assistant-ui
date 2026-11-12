# IntegrationInstancesList

The Installed surface (plan 33 / ADR-0040 D19+D21): instance rows grouped
under their extension (extension ≠ instance — one extension, N configured
occurrences), status + conditions (`needs-config` / `needs-secret`) +
`last_success_at` / `consecutive_failures`, origin chips, gitops indicators,
parked/tombstoned markers, update states, and typed per-instance action
callbacks. Loading, error and empty states ride props.

## import

```ts
import { IntegrationInstancesList } from '@neuronection/assistant-ui/integration-instances-list'
```

## props

- `groups: IntegrationExtensionGroupView[]` — `{ extension, instances[] }`
  (the grouping is the shape — retrofitting it later would be breaking).
- `labels?: IntegrationInstancesListLabels` — every visible string incl.
  `conditionLabels` and `statusLabels` maps (English defaults).
- `busy?`, `loading?`, `error?: string | null` — the state triad.
- `onToggleEnabled?(instance, enabled)` — renders the row's enable checkbox
  (aria-label `"<enableAriaLabel>: <name>"`); without it the row renders the
  name as plain text.
- `onConfigure?(instance)` / `onPark?(instance)` / `onRestore?(instance)` /
  `onTombstone?(instance)` / `onApplyUpdate?(instance)` — typed actions out;
  each renders only when provided (Restore only for parked/disabled rows,
  Apply update only for `update.state === 'available'`).
- `renderInstanceActions?(instance)` — domain actions (career's probe/sync,
  health's action funnels) rendered after the typed ones.
- `renderExtensionActions?(extension)` — extension-level actions in the
  group header.
- `className` — merges.

## controlled contract

Fully controlled: instances are data in; every mutation is an explicit user
act (no auto-enable, no auto-apply — clause 21). Tombstoning never deletes:
the app parks + tombstones, the row renders the lifecycle state.

## label/i18n contract

`labels` with English defaults (`enableAriaLabel`, `parkedLabel`,
`tombstonedLabel`, `gitopsLabel`, `updateAvailableLabel`,
`reconsentRequiredLabel`, `digestDriftLabel`, `lastSuccessLabel`,
`failuresLabel`, `emptyLabel`, `loadingLabel`, …).

## accessibility

Row checkboxes are `aria-label`ed; the tombstone icon-only button is
labelled (`Tombstone: <name>`); drift renders `role="alert"`. See
[accessibility](../accessibility.md).

Related: [IntegrationSourcesList](./integration-sources-list.md),
[IntegrationCard](./integration-card.md),
[IntegrationConfigForm](./integration-config-form.md).
