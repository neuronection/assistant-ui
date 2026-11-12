# ModelPriceTable

Controlled model-price table: rows in, edits out. It owns only the
USD↔micros conversion; products own fetching, resolution and persistence.
Built-in, custom, local and unpriced rows share one vocabulary.

## import

```ts
import {
  ModelPriceTable,
  microsToUsdPerMillion,
  usdPerMillionToMicros,
  type ModelPriceRow,
} from '@neuronection/assistant-ui/model-price-table'
```

## rows

```ts
interface ModelPriceRow {
  id: string
  providerKey?: string | null
  providerRef?: string | null
  model: string
  match: 'exact' | 'prefix'
  inputMicrosPerMillion: number | null
  outputMicrosPerMillion: number | null
  origin: 'user' | 'builtin' | 'local' | 'legacy' | 'unknown'
  reviewedAt?: string | null
  priceVersion?: string | null
}
```

`priceVersion` is provenance only and is never rendered. Null rates render
**Unpriced**; they are never coerced to `$0`.

## props

| prop | type | notes |
|---|---|---|
| `rows` | `ModelPriceRow[]` | required |
| `onChange` | `(id, patch) => void` | omit for read-only |
| `onAdd` | `() => void` | shows Add price |
| `onRemove` / `onReset` | `(id) => void` | right-hand action; `onReset` wins |
| `disabled` | `boolean` | disables edits and actions |
| `highlightModel` | `string \| null` | row highlight (deep-link focus) |
| `labels` | `Partial<ModelPriceTableLabels>` | English defaults |
| `className` | `string` | wrapper |

## conversion

```ts
usdPerMillionToMicros('0.075') // 75_000
microsToUsdPerMillion(75_000)  // '0.075'
usdPerMillionToMicros('')      // null
```

## example

```tsx
<ModelPriceTable
  rows={rows}
  onChange={(id, patch) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }
  onReset={(id) => removeOverride(id)}
  onAdd={() => addOverride()}
/>
```

## accessibility

Native table with column headers; editable fields have indexed accessible
names (`Input $/1M 1`); reset buttons are named (`Reset <model>`). axe-clean.
See [accessibility.md](../accessibility.md#settings-blocks).

## related

[`ModelPriceMeta`](./model-price-meta.md), [`ModelPicker`](./model-picker.md).
