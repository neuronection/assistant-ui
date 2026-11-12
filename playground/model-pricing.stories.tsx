import { useState } from 'react'
import { ModelPriceMeta } from '../src/components/model-price-meta/ModelPriceMeta'
import {
  ModelPriceTable,
  type ModelPriceRow,
} from '../src/components/model-price-table/ModelPriceTable'

const initial: ModelPriceRow[] = [
  {
    id: 'builtin-openai-gpt-5',
    providerKey: 'openai',
    model: 'gpt-5',
    match: 'exact',
    inputMicrosPerMillion: 1_250_000,
    outputMicrosPerMillion: 10_000_000,
    origin: 'builtin',
    reviewedAt: '2026-11-01',
  },
  {
    id: 'custom-local',
    model: 'qwen2.5:7b',
    match: 'exact',
    inputMicrosPerMillion: 0,
    outputMicrosPerMillion: 0,
    origin: 'local',
  },
  {
    id: 'unpriced',
    providerKey: 'custom',
    model: 'private-model',
    match: 'prefix',
    inputMicrosPerMillion: null,
    outputMicrosPerMillion: null,
    origin: 'unknown',
  },
]

export const Meta = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
    <ModelPriceMeta
      inputMicrosPerMillion={1_250_000}
      outputMicrosPerMillion={10_000_000}
      origin="builtin"
      reviewedAt="2026-11-01"
      onOpenPrices={() => undefined}
    />
    <ModelPriceMeta
      inputMicrosPerMillion={0}
      outputMicrosPerMillion={0}
      origin="local"
    />
    <ModelPriceMeta
      inputMicrosPerMillion={null}
      outputMicrosPerMillion={null}
      origin="unknown"
      onOpenPrices={() => undefined}
    />
    <ModelPriceMeta
      inputMicrosPerMillion={75_000}
      outputMicrosPerMillion={300_000}
      origin="builtin"
      reviewedAt="2026-01-01"
      onOpenPrices={() => undefined}
    />
  </div>
)

export const Table = () => {
  const [rows, setRows] = useState(initial)
  return (
    <div style={{ maxWidth: 980 }}>
      <ModelPriceTable
        rows={rows}
        onChange={(id, patch) =>
          setRows((current) =>
            current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
          )
        }
        onReset={(id) =>
          setRows((current) => current.filter((row) => row.id !== id))
        }
        onAdd={() =>
          setRows((current) => [
            ...current,
            {
              id: `new-${current.length}`,
              providerKey: null,
              model: '',
              match: 'exact',
              inputMicrosPerMillion: null,
              outputMicrosPerMillion: null,
              origin: 'user',
            },
          ])
        }
      />
    </div>
  )
}
