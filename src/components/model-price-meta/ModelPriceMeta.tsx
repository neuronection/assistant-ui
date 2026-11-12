import * as React from 'react'
import { cn } from '../../lib/utils'

export type ModelPriceOrigin = 'user' | 'builtin' | 'local' | 'legacy' | 'unknown'

export interface ModelPriceMetaLabels {
  unpriced: string
  builtin: string
  custom: string
  local: string
  legacy: string
  stale: string
  checked: string
  change: string
}

const DEFAULT_LABELS: ModelPriceMetaLabels = {
  unpriced: 'Unpriced',
  builtin: 'Built-in',
  custom: 'Custom',
  local: 'Local',
  legacy: 'Legacy',
  stale: 'stale',
  checked: 'checked',
  change: 'Prices',
}

const ORIGIN_LABEL: Record<Exclude<ModelPriceOrigin, 'unknown'>, keyof ModelPriceMetaLabels> = {
  user: 'custom',
  builtin: 'builtin',
  local: 'local',
  legacy: 'legacy',
}

export interface ModelPriceMetaProps {
  inputMicrosPerMillion: number | null
  outputMicrosPerMillion: number | null
  origin: ModelPriceOrigin
  /** ISO date the row was last reviewed (built-in rows carry it). */
  reviewedAt?: string | null
  /** Test/time seam; defaults to now. */
  now?: Date
  /** Days after `reviewedAt` that the rate is shown stale. */
  staleAfterDays?: number
  onOpenPrices?: () => void
  labels?: Partial<ModelPriceMetaLabels>
  className?: string
}

function formatRate(micros: number): string {
  return `$${(micros / 1_000_000).toFixed(4)}/M`
}

function isStale(reviewedAt: string | null | undefined, now: Date, days: number): boolean {
  if (!reviewedAt) return false
  const reviewed = new Date(reviewedAt)
  if (Number.isNaN(reviewed.getTime())) return false
  return now.getTime() - reviewed.getTime() > days * 24 * 60 * 60 * 1000
}

/**
 * Presentational effective-price line for an assignment or model row.
 * It never resolves prices or fetches: callers pass the resolved rates and
 * origin. A null rate is always `Unpriced`, never `$0`.
 */
export function ModelPriceMeta({
  inputMicrosPerMillion,
  outputMicrosPerMillion,
  origin,
  reviewedAt,
  now,
  staleAfterDays = 90,
  onOpenPrices,
  labels: overrides,
  className,
}: ModelPriceMetaProps): React.JSX.Element {
  const labels = { ...DEFAULT_LABELS, ...overrides }
  const unpriced =
    origin === 'unknown' ||
    inputMicrosPerMillion === null ||
    outputMicrosPerMillion === null
  const stale = isStale(reviewedAt, now ?? new Date(), staleAfterDays)
  const originLabel =
    origin === 'unknown' ? labels.unpriced : labels[ORIGIN_LABEL[origin]]

  return (
    <div
      data-testid="model-price-meta"
      data-origin={unpriced ? 'unknown' : origin}
      data-stale={stale || undefined}
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--as-muted-fg)]',
        className,
      )}
    >
      {unpriced ? (
        <span className="font-medium text-[var(--as-fg)]">{labels.unpriced}</span>
      ) : (
        <>
          <span className="font-medium text-[var(--as-fg)]">{originLabel}</span>
          <span className="tabular-nums">
            {formatRate(inputMicrosPerMillion)} in · {formatRate(outputMicrosPerMillion)} out
          </span>
          {reviewedAt ? (
            <span className={cn(stale && 'text-[var(--as-warning,var(--as-danger))]')}>
              {stale ? `${labels.stale} · ` : ''}
              {labels.checked} {reviewedAt.slice(0, 10)}
            </span>
          ) : null}
        </>
      )}
      {onOpenPrices ? (
        <button
          type="button"
          onClick={onOpenPrices}
          className="font-medium text-[var(--as-primary)] underline-offset-2 hover:underline"
        >
          {labels.change}
        </button>
      ) : null}
    </div>
  )
}
