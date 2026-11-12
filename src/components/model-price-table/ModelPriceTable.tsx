import * as React from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import { Button } from '../button'
import { cn } from '../../lib/utils'
import type { ModelPriceOrigin } from '../model-price-meta'

export type PriceMatch = 'exact' | 'prefix'

export interface ModelPriceRow {
  id: string
  /** Preset key (family contract `provider`), when bound. */
  providerKey?: string | null
  /** Concrete product provider row (family contract `providerRef`). */
  providerRef?: string | null
  model: string
  match: PriceMatch
  inputMicrosPerMillion: number | null
  outputMicrosPerMillion: number | null
  origin: ModelPriceOrigin
  reviewedAt?: string | null
  /** Internal provenance; never rendered as user copy. */
  priceVersion?: string | null
}

export interface ModelPriceTableLabels {
  provider: string
  model: string
  match: string
  exact: string
  prefix: string
  input: string
  output: string
  origin: string
  reviewed: string
  reset: string
  add: string
  empty: string
  unpriced: string
  builtin: string
  custom: string
  local: string
  legacy: string
}

const DEFAULT_LABELS: ModelPriceTableLabels = {
  provider: 'Provider',
  model: 'Model',
  match: 'Match',
  exact: 'Exact',
  prefix: 'Prefix',
  input: 'Input $/1M',
  output: 'Output $/1M',
  origin: 'Origin',
  reviewed: 'Checked',
  reset: 'Reset',
  add: 'Add price',
  empty: 'No prices yet.',
  unpriced: 'Unpriced',
  builtin: 'Built-in',
  custom: 'Custom',
  local: 'Local',
  legacy: 'Legacy',
}

const ORIGIN: Record<Exclude<ModelPriceOrigin, 'unknown'>, keyof ModelPriceTableLabels> = {
  user: 'custom',
  builtin: 'builtin',
  local: 'local',
  legacy: 'legacy',
}

/** `$0.075/M` → `75_000` micros per million. Blank → null (Unpriced). */
export function usdPerMillionToMicros(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed * 1_000_000)
}

/** `75_000` micros per million → `"0.075"` for the editor. */
export function microsToUsdPerMillion(value: number | null): string {
  return value === null ? '' : String(value / 1_000_000)
}

export interface ModelPriceTableProps {
  rows: ModelPriceRow[]
  /** Omit for a read-only table. */
  onChange?: (id: string, patch: Partial<ModelPriceRow>) => void
  onAdd?: () => void
  onRemove?: (id: string) => void
  onReset?: (id: string) => void
  disabled?: boolean
  highlightModel?: string | null
  labels?: Partial<ModelPriceTableLabels>
  className?: string
}

/**
 * Controlled price table: rows in, edits out. It owns only the
 * USD↔micros conversion; products own fetching, resolution and persistence.
 */
export function ModelPriceTable({
  rows,
  onChange,
  onAdd,
  onRemove,
  onReset,
  disabled = false,
  highlightModel,
  labels: overrides,
  className,
}: ModelPriceTableProps): React.JSX.Element {
  const labels = { ...DEFAULT_LABELS, ...overrides }
  const editable = Boolean(onChange) && !disabled
  const inputClass =
    'w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-transparent px-2 py-1 text-sm text-[var(--as-fg)] disabled:opacity-60'

  return (
    <div className={cn('space-y-2', className)}>
      <div className="overflow-x-auto rounded-[var(--as-radius-md)] border border-[var(--as-border)]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--as-border)] text-[var(--as-muted-fg)]">
            <tr>
              <th className="px-2 py-1.5 font-medium">{labels.provider}</th>
              <th className="px-2 py-1.5 font-medium">{labels.model}</th>
              <th className="px-2 py-1.5 font-medium">{labels.match}</th>
              <th className="px-2 py-1.5 font-medium">{labels.input}</th>
              <th className="px-2 py-1.5 font-medium">{labels.output}</th>
              <th className="px-2 py-1.5 font-medium">{labels.origin}</th>
              <th className="px-2 py-1.5 font-medium">{labels.reviewed}</th>
              <th className="px-2 py-1.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-4 text-center text-[var(--as-muted-fg)]">
                  {labels.empty}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id}
                  data-highlight={highlightModel === row.model || undefined}
                  className={cn(
                    'border-b border-[var(--as-border)] last:border-0',
                    highlightModel === row.model && 'bg-[var(--as-secondary)]',
                  )}
                >
                  <td className="px-2 py-1.5">
                    {editable ? (
                      <input
                        className={inputClass}
                        aria-label={`${labels.provider} ${index + 1}`}
                        value={row.providerKey ?? ''}
                        placeholder="preset key"
                        onChange={(event) =>
                          onChange?.(row.id, {
                            providerKey: event.target.value.trim() || null,
                          })
                        }
                      />
                    ) : (
                      <span className="text-[var(--as-muted-fg)]">
                        {row.providerKey ?? row.providerRef ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {editable ? (
                      <input
                        className={inputClass}
                        aria-label={`${labels.model} ${index + 1}`}
                        value={row.model}
                        onChange={(event) => onChange?.(row.id, { model: event.target.value })}
                      />
                    ) : (
                      <span className="font-mono">{row.model}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {editable ? (
                      <select
                        className={inputClass}
                        aria-label={`${labels.match} ${index + 1}`}
                        value={row.match}
                        onChange={(event) =>
                          onChange?.(row.id, {
                            match: event.target.value === 'prefix' ? 'prefix' : 'exact',
                          })
                        }
                      >
                        <option value="exact">{labels.exact}</option>
                        <option value="prefix">{labels.prefix}</option>
                      </select>
                    ) : (
                      row.match === 'prefix' ? labels.prefix : labels.exact
                    )}
                  </td>
                  {(['inputMicrosPerMillion', 'outputMicrosPerMillion'] as const).map(
                    (field) => (
                      <td key={field} className="px-2 py-1.5">
                        {editable ? (
                          <input
                            className={inputClass}
                            type="number"
                            min={0}
                            step="0.000001"
                            aria-label={`${field === 'inputMicrosPerMillion' ? labels.input : labels.output} ${index + 1}`}
                            value={microsToUsdPerMillion(row[field])}
                            placeholder={labels.unpriced}
                            onChange={(event) =>
                              onChange?.(row.id, {
                                [field]: usdPerMillionToMicros(event.target.value),
                              })
                            }
                          />
                        ) : row[field] === null ? (
                          <span className="text-[var(--as-muted-fg)]">{labels.unpriced}</span>
                        ) : (
                          <span className="tabular-nums">
                            ${(row[field]! / 1_000_000).toFixed(4)}/M
                          </span>
                        )}
                      </td>
                    ),
                  )}
                  <td className="px-2 py-1.5">
                    <span className="font-medium">
                      {row.origin === 'unknown'
                        ? labels.unpriced
                        : labels[ORIGIN[row.origin]]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-[var(--as-muted-fg)]">
                    {row.reviewedAt ? row.reviewedAt.slice(0, 10) : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {onReset || onRemove ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={disabled}
                        aria-label={`${labels.reset} ${row.model || index + 1}`}
                        onClick={() => (onReset ? onReset(row.id) : onRemove?.(row.id))}
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onAdd ? (
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onAdd}>
          <Plus className="mr-1 size-3.5" />
          {labels.add}
        </Button>
      ) : null}
    </div>
  )
}
