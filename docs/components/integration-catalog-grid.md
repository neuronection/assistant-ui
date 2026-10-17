# IntegrationCatalogGrid

The Available surface of the one registry view (plan 33 / ADR-0040 D25):
entries grouped by the charter's closed category vocabulary, controlled
search, install affordances with host-compatibility results (self-disable
reasons render verbatim), `listed` entries from added sources. Loading,
error and empty states ride props (the state triad).

## import

```ts
import { IntegrationCatalogGrid } from '@neuronection/assistant-ui/integration-catalog-grid'
```

## props

- `entries: IntegrationCatalogEntryView[]` — the available surface (data in).
- `query: string` + `onQueryChange(query)` — controlled search; the grid
  filters deterministically on name + summary + id (case-insensitive).
- `labels?: IntegrationCatalogGridLabels` — `searchLabel`,
  `searchPlaceholder`, `emptyLabel`, `noMatchesLabel`, `loadingLabel`,
  `installLabel`, `installedLabel`, `incompatibleLabel`, `listedLabel`,
  `uncategorizedLabel`, `categoryLabels` (per charter category).
- `busy?`, `loading?`, `error?: string | null` — the state triad; error
  renders `role="alert"`.
- `installingId?: string | null` — the entry currently installing.
- `onInstall?(entry)` — renders the install button for compatible entries
  only (entries with `hostCompat.compatible === false` show their verbatim
  reason instead).
- `renderEntryActions?(entry)` — extra app-owned actions per entry.
- `className` — merges.

## controlled contract

Search is controlled (`query` + `onQueryChange`); installs are emitted user
acts — consent flows through
[ConsentDialog](./consent-dialog.md) on the app side.

## label/i18n contract

`labels` with English defaults; `categoryLabels` maps charter categories to
app copy (unknown categories fall back to the raw id; entries without
categories group under `uncategorizedLabel`).

## accessibility

The search input carries `aria-label`; groups are labelled `section`s;
incompatible reasons are text (never truncated away). See
[accessibility](../accessibility.md).

Related: [IntegrationCard](./integration-card.md),
[AddIntegrationSourceDialog](./add-integration-source-dialog.md).
