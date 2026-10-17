# IntegrationSourcesList

The import layer's source list (plan 33 G5 / ADR-0040 D13+D22): sources with
family status, check/remove affordances, pinned-ref short forms
(`tag-pattern@v*`), GitOps desired-state indicators, discovered candidates
(digest short form, verbatim compatibility reasons, install handing off to
the host's consent flow) and the installed instances grouped under their
extensions. Loading, error and empty states ride props.

## import

```ts
import { IntegrationSourcesList } from '@neuronection/assistant-ui/integration-sources-list'
```

## props

- `sources: IntegrationSourceRowView[]` — sources with their candidates and
  instance groups (data in).
- `labels?: IntegrationSourcesListLabels` — extends the instances-list
  labels with `checkLabel`, `removeSourceLabel`, `checkAriaLabel`,
  `removeSourceAriaLabel`, `gitopsSourceLabel`, `candidateLabel`,
  `installLabel`, `incompatibleLabel`, `kindLabels`.
- `busy?`, `loading?`, `error?: string | null`, `checkingId?: string | null`.
- `onCheck?(sourceId)` / `onRemoveSource?(sourceId)` — source lifecycle out
  (labels announce the origin).
- `onInstallCandidate?(sourceId, candidate)` — emitted for compatible
  candidates only; the host opens
  [ConsentDialog](./consent-dialog.md) — never an inline install.
- `onToggleEnabled?(sourceId, instance, enabled)` /
  `onConfigure?` / `onPark?` / `onRestore?` / `onTombstone?` /
  `onApplyUpdate?` — instance actions scoped to their source.
- `renderInstanceActions?(sourceId, instance)` — domain actions.
- `className` — merges.

## controlled contract

Fully controlled; check/remove/park/tombstone are explicit user acts.
Removal semantics (park → tombstone-able, never silently re-enabled) are the
host's (D22); the list only emits.

## label/i18n contract

`labels` with English defaults; `kindLabels` maps `git`/`local`;
`statusLabels` (inherited from the instances list) labels the source-row
status badge too — the raw state stays the fallback.

## accessibility

Check/remove buttons carry `aria-label`s including the origin; source errors
render `role="alert"`; candidate install buttons are labelled. See
[accessibility](../accessibility.md).

Related: [AddIntegrationSourceDialog](./add-integration-source-dialog.md),
[ConsentDialog](./consent-dialog.md),
[IntegrationInstancesList](./integration-instances-list.md).
