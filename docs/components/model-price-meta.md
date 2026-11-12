# ModelPriceMeta

Presentational effective-price line for an assignment or model row. It
renders the rates the caller resolved; it never fetches, resolves, or
persists prices. A null rate is always **Unpriced**, never `$0`.

## import

```ts
import {
  ModelPriceMeta,
  type ModelPriceOrigin,
} from '@neuronection/assistant-ui/model-price-meta'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `inputMicrosPerMillion` | `number \| null` | — | null → Unpriced |
| `outputMicrosPerMillion` | `number \| null` | — | null → Unpriced |
| `origin` | `'user' \| 'builtin' \| 'local' \| 'legacy' \| 'unknown'` | — | `user` renders as Custom; `unknown` renders as Unpriced |
| `reviewedAt` | `string \| null` | — | ISO date shown as `checked <date>` |
| `now` | `Date` | now | test/time seam for staleness |
| `staleAfterDays` | `number` | `90` | reviewed rows older than this show `stale` |
| `onOpenPrices` | `() => void` | — | renders the Prices link |
| `labels` | `Partial<ModelPriceMetaLabels>` | English | translate at the call site |
| `className` | `string` | — | merges onto the wrapper |

## example

```tsx
<ModelPriceMeta
  inputMicrosPerMillion={resolution.inputMicrosPerMillion}
  outputMicrosPerMillion={resolution.outputMicrosPerMillion}
  origin={resolution.source}
  reviewedAt={resolution.reviewedAt}
  onOpenPrices={() => openPrices(model.id)}
/>
```

## accessibility

The line is text; `onOpenPrices` renders a native button named by
`labels.change` (default `Prices`). Staleness is text, never colour alone.
See [accessibility.md](../accessibility.md#settings-blocks).

## related

[`ModelPriceTable`](./model-price-table.md), [`ModelPicker`](./model-picker.md).
