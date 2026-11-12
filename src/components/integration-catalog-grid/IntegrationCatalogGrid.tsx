import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { OriginChip, TierBadge } from '../integration-atoms/IntegrationAtoms'
import { Skeleton } from '../skeleton/Skeleton'
import {
  EXTENSION_CATEGORIES,
  type ExtensionCategory,
} from '../../contracts'
import type { IntegrationCatalogEntryView } from '../../contracts'

export interface IntegrationCatalogGridLabels {
  searchLabel?: string
  searchPlaceholder?: string
  emptyLabel?: string
  noMatchesLabel?: string
  loadingLabel?: string
  installLabel?: string
  installedLabel?: string
  incompatibleLabel?: string
  listedLabel?: string
  uncategorizedLabel?: string
  categoryLabels?: Partial<Record<ExtensionCategory, string>>
}

export interface IntegrationCatalogGridProps {
  entries: IntegrationCatalogEntryView[]
  /** Controlled search query; the grid filters name/summary/id deterministically. */
  query: string
  onQueryChange: (query: string) => void
  labels?: IntegrationCatalogGridLabels
  busy?: boolean
  loading?: boolean
  error?: string | null
  installingId?: string | null
  onInstall?: (entry: IntegrationCatalogEntryView) => void
  renderEntryActions?: (entry: IntegrationCatalogEntryView) => React.ReactNode
  className?: string
}

/**
 * Presentational catalog grid (ADR-0040 D25 — the Available surface of the
 * one registry view): entries grouped by the charter's closed category
 * vocabulary, controlled search, install affordances with host-compatibility
 * results (self-disable reasons render verbatim), `listed` entries from
 * added sources. Fetching, filtering back-ends and installs are app-side.
 */
export const IntegrationCatalogGrid = React.forwardRef<
  HTMLDivElement,
  IntegrationCatalogGridProps
>(function IntegrationCatalogGrid(
  {
    entries,
    query,
    onQueryChange,
    labels,
    busy = false,
    loading = false,
    error = null,
    installingId = null,
    onInstall,
    renderEntryActions,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      searchLabel: labels?.searchLabel ?? 'Search',
      searchPlaceholder: labels?.searchPlaceholder ?? 'Search integrations',
      emptyLabel: labels?.emptyLabel ?? 'No integrations available.',
      noMatchesLabel: labels?.noMatchesLabel ?? 'No matches.',
      loadingLabel: labels?.loadingLabel ?? 'Loading…',
      installLabel: labels?.installLabel ?? 'Install',
      installedLabel: labels?.installedLabel ?? 'configured',
      incompatibleLabel: labels?.incompatibleLabel ?? 'incompatible',
      listedLabel: labels?.listedLabel ?? 'listed',
      uncategorizedLabel: labels?.uncategorizedLabel ?? 'Other',
      categoryLabels: labels?.categoryLabels ?? {},
    }),
    [labels],
  )

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? entries.filter((entry) =>
        [entry.name, entry.summary ?? '', entry.id]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : entries

  const grouped = new Map<ExtensionCategory | null, IntegrationCatalogEntryView[]>()
  for (const category of EXTENSION_CATEGORIES) grouped.set(category, [])
  if (!grouped.has(null)) grouped.set(null, [])
  for (const entry of visible) {
    const declared = (entry.categories ?? []).filter((category) => grouped.has(category))
    const keys: Array<ExtensionCategory | null> =
      declared.length > 0 ? declared : [null]
    for (const key of keys) grouped.get(key)?.push(entry)
  }
  const groups = [...grouped.entries()].filter(([, rows]) => rows.length > 0)

  if (loading) {
    return (
      <div
        ref={ref}
        data-as="integration-catalog-grid"
        data-state="loading"
        aria-busy="true"
        aria-label={t.loadingLabel}
        className={cn('space-y-3', className)}
      >
        <Skeleton className="h-9 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-as="integration-catalog-grid"
      data-state={error ? 'error' : visible.length === 0 ? 'empty' : 'ready'}
      className={cn('space-y-3', className)}
    >
      <input
        type="search"
        value={query}
        aria-label={t.searchLabel}
        placeholder={t.searchPlaceholder}
        onChange={(event) => onQueryChange(event.target.value)}
        className="w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-1.5 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
        data-testid="integration-catalog-search"
      />

      {error ? (
        <p role="alert" className="text-sm text-[var(--as-danger)]" data-testid="integration-catalog-error">
          {error}
        </p>
      ) : null}

      {visible.length === 0 && !error ? (
        <p
          className="py-4 text-center text-sm text-[var(--as-muted-fg)]"
          data-testid="integration-catalog-empty"
        >
          {needle ? t.noMatchesLabel : t.emptyLabel}
        </p>
      ) : null}

      {groups.map(([category, rows]) => (
        <section
          key={category ?? 'uncategorized'}
          data-testid={`integration-catalog-category-${category ?? 'other'}`}
          aria-label={category ? t.categoryLabels[category] ?? category : t.uncategorizedLabel}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
            {category ? t.categoryLabels[category] ?? category : t.uncategorizedLabel}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map((entry) => {
              const compat = entry.hostCompat ?? null
              const installing = installingId === entry.id
              const count = entry.installedInstanceCount ?? 0
              return (
                <div
                  key={`${entry.id}-${entry.digest ?? ''}`}
                  data-testid={`integration-catalog-entry-${entry.id}`}
                  className="flex flex-col gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 truncate text-sm font-medium text-[var(--as-fg)]">
                      {entry.name}
                    </span>
                    <OriginChip originClass={entry.originClass} label={entry.originClass === 'listed' ? t.listedLabel : undefined} />
                    <TierBadge tier={entry.tier} />
                    {count > 0 ? (
                      <span className="text-xs text-[var(--as-muted-fg)]">
                        {count} {t.installedLabel}
                      </span>
                    ) : null}
                  </div>
                  {entry.summary ? (
                    <p className="text-xs text-[var(--as-muted-fg)]">{entry.summary}</p>
                  ) : null}
                  {compat && !compat.compatible ? (
                    <p
                      className="text-xs text-[var(--as-danger)]"
                      data-testid={`integration-catalog-reason-${entry.id}`}
                    >
                      {compat.reason ?? t.incompatibleLabel}
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center gap-1.5">
                    {onInstall && (!compat || compat.compatible) ? (
                      <Button
                        size="sm"
                        disabled={busy || installing}
                        onClick={() => onInstall(entry)}
                      >
                        {installing ? '…' : t.installLabel}
                      </Button>
                    ) : null}
                    {renderEntryActions ? renderEntryActions(entry) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
})
