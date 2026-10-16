import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Badge } from '../badge/Badge'
import { DetailValue } from '../detail-value/DetailValue'

/**
 * The family declarative-surface renderer (plan 32 Phase 4 / ADR-0040
 * clause 16): renders the charter's closed component vocabulary —
 * `stat`, `table`, `cards`, `filter-bar`, `select`, `badge`, `progress`,
 * `actions`, `evidence` — from a schema + view object with RESOLVED
 * labels, never raw markup from an extension. Promoted from desktop's
 * PackReportRenderer; career and desktop are the two hosts (fixture
 * parity: `dev/contracts/surface-renderer.fixtures.json` —
 * implementations may differ, outputs may not).
 */

export const SURFACE_NODE_TYPES = [
  'stat',
  'table',
  'cards',
  'filter-bar',
  'select',
  'badge',
  'progress',
  'actions',
  'evidence',
] as const

export type SurfaceNodeType = (typeof SURFACE_NODE_TYPES)[number]

export const SURFACE_RUN_ACTION_IDS = [
  'run:cancel',
  'run:retry',
  'run:resume',
  'run:arm',
  'run:export',
  'run:diff',
] as const

export const SURFACE_ITEM_ACTION_IDS = [
  'item:exclude',
  'item:override',
  'item:restore',
  'item:reveal',
  'item:open',
] as const

export type SurfaceActionId =
  | (typeof SURFACE_RUN_ACTION_IDS)[number]
  | (typeof SURFACE_ITEM_ACTION_IDS)[number]

export function surfaceActionId(id: string): id is SurfaceActionId {
  return (
    (SURFACE_RUN_ACTION_IDS as readonly string[]).includes(id) ||
    (SURFACE_ITEM_ACTION_IDS as readonly string[]).includes(id)
  )
}

export interface SurfaceNode {
  id: string
  type: SurfaceNodeType
  /** Data key for stat/badge/progress/select (dot-walked into `values`). */
  bind?: string
  /** table column keys. */
  columns?: string[]
  /** cards grouping mode. */
  of?: 'items' | 'groups'
  /** filter-bar facet ids (options live on the host-provided `filters`). */
  filters?: string[]
  /** select option values. */
  options?: string[]
  /** Typed action ids (closed vocabulary; unknown ids never render). */
  actions?: SurfaceActionId[]
}

export interface SurfaceRow {
  /** Stable row id — the `surface-row-<id>` walk key. */
  id: string
  /** Table cells / bindings, keyed by column name. */
  values: Record<string, unknown>
  /** Card heading (resolved host-side). */
  title?: string
  /** Short status chip text. */
  badge?: string
  /** Which column the badge chip replaces in tables. */
  badgeField?: string
  /** cards.of='groups' grouping key (headings via the `groups` map). */
  group?: string
  /** Muted per-card detail segments (parsed: never raw JSON). */
  meta?: string[]
  /** Structured evidence payload (renders the mandatory drilldown). */
  evidence?: unknown
  /** One-line evidence summary, resolved host-side (rule.* label keys). */
  evidenceSummary?: string
  /** Typed row actions (only closed ids render). */
  actions?: SurfaceActionId[]
}

export interface SurfaceFilterOption {
  value: string
  /** Resolved option label (raw value when absent). */
  label?: string
}

export interface SurfaceFilter {
  /** The filter-bar facet id the node names. */
  id: string
  options: SurfaceFilterOption[]
}

export interface SurfaceAction {
  id: SurfaceActionId
  /** The row the action targets, when row-level. */
  rowId?: string
}

export interface SurfaceView {
  nodes: SurfaceNode[]
  rows?: SurfaceRow[]
  /** Bind targets for stat/badge/progress — dot paths into this object. */
  values?: Record<string, unknown>
  /** cards.of='groups' group key → resolved heading (status.* labels). */
  groups?: Record<string, string>
}

/** Resolved manifest i18n — the label contract:
 * - `report.<node-id>` node label
 * - `report.<table-node-id>.<column>` table column header
 * - `filters.<facet-id>` filter-bar facet label
 * - `action.<action-id>` action button label
 * - `status.<value>` badge/group text fallbacks.
 * Unresolved keys fall back to the id/value itself. */
export type SurfaceLabels = Record<string, string>

export interface SurfaceRendererProps {
  surface: SurfaceView
  labels?: SurfaceLabels
  /** filter-bar facet definitions (the schema node only ids them). */
  filters?: SurfaceFilter[]
  /** Controlled facet selections (`{ facetId: value | 'all' }`). */
  activeFilters?: Record<string, string>
  onFilterChange?: (facetId: string, value: string | null) => void
  /** Controlled typed-action funnel — the host binds semantics. */
  onAction?: (action: SurfaceAction) => void
  /** Host-resolved truncation notice (renders `role=status` when set). */
  truncatedLabel?: string
  allLabel?: string
  evidenceLabel?: string
  loadMoreLabel?: string
  className?: string
}

export const SURFACE_PAGE_SIZE = 50

export const SURFACE_NODE_ORDER: SurfaceNodeType[] = [
  'stat',
  'badge',
  'progress',
  'filter-bar',
  'select',
  'actions',
  'table',
  'cards',
]

const actionClass =
  'inline-flex h-7 items-center rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1 text-xs text-[var(--as-fg)]'

const chipActive =
  'rounded-full border border-[var(--as-primary)] bg-[var(--as-primary)]/10 px-3 py-1 text-xs text-[var(--as-fg)]'
const chipIdle = 'rounded-full border border-[var(--as-border)] px-3 py-1 text-xs text-[var(--as-fg)]'

function bindValue(values: Record<string, unknown> | undefined, bind: string | undefined): unknown {
  if (!bind || !values) return undefined
  let node: unknown = values
  for (const part of bind.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return node
}

export function surfaceProgressPercent(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Math.max(0, Math.min(100, Math.round(value)))
  if (typeof value === 'object') {
    const shape = value as Record<string, unknown>
    const done = typeof shape.done === 'number' ? shape.done : null
    const total = typeof shape.total === 'number' ? shape.total : null
    if (done !== null && total !== null) {
      const pct = total > 0 ? (done / total) * 100 : 0
      return Math.max(0, Math.min(100, Math.round(pct)))
    }
  }
  return null
}

function valueText(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

export const SurfaceRenderer = React.forwardRef<HTMLDivElement, SurfaceRendererProps>(
  function SurfaceRenderer(
    {
      surface,
      labels,
      filters,
      activeFilters,
      onFilterChange,
      onAction,
      truncatedLabel,
      allLabel = 'All',
      evidenceLabel = 'Evidence',
      loadMoreLabel = 'Load more',
      className,
    },
    ref,
  ) {
    const nodes = Array.isArray(surface.nodes) ? surface.nodes : []
    const known = nodes.filter((node) =>
      (SURFACE_NODE_TYPES as readonly string[]).includes(node.type),
    )
    const label = (key: string, fallback: string): string => labels?.[key] || fallback
    const facets = React.useMemo(() => {
      const map = new Map<string, SurfaceFilter>()
      for (const filter of filters ?? []) map.set(filter.id, filter)
      return map
    }, [filters])

    const rows = Array.isArray(surface.rows) ? surface.rows : []
    const [page, setPage] = React.useState(SURFACE_PAGE_SIZE)
    React.useEffect(() => {
      setPage(SURFACE_PAGE_SIZE)
    }, [surface.rows])
    const visibleRows = rows.slice(0, page)

    const knownActions = (ids: readonly string[]): SurfaceActionId[] =>
      ids.filter((id): id is SurfaceActionId => surfaceActionId(id))

    const fire = (id: SurfaceActionId, rowId?: string) => onAction?.({ id, rowId })

    const actionButton = (id: SurfaceActionId, rowId?: string) => {
      const testId = rowId ? `surface-action-${id}-${rowId}` : `surface-action-${id}`
      return (
        <Button
          key={testId}
          size="sm"
          variant="outline"
          className={actionClass}
          data-testid={testId}
          onClick={() => fire(id, rowId)}
        >
          {label(`action.${id}`, id)}
        </Button>
      )
    }

    const rowEvidence = (rowId: string, evidence: unknown, summary?: string) => {
      if (evidence === undefined || evidence === null) return null
      return (
        <details
          data-testid={`surface-evidence-${rowId}`}
          data-as="surface-evidence"
          className="mt-0.5"
        >
          <summary className="cursor-pointer text-[11px] text-[var(--as-muted-fg)]">
            {summary ? `${evidenceLabel} — ${summary}` : evidenceLabel}
          </summary>
          <div className="mt-1 max-h-48 overflow-auto">
            <DetailValue text={JSON.stringify(evidence, null, 2)} />
          </div>
        </details>
      )
    }

    const renderValue = (row: SurfaceRow, column: string): React.ReactNode => {
      if (row.badgeField === column && row.badge !== undefined) {
        return (
          <Badge className="text-[10px]" data-testid={`surface-badge-${row.id}-${column}`}>
            {row.badge}
          </Badge>
        )
      }
      return valueText(row.values?.[column])
    }

    const renderCards = (node: { id: string; of?: 'items' | 'groups' }) => {
      if (node.of !== 'groups') {
        return (
          <section key="all" aria-label={label(`report.${node.id}`, node.id)} className="space-y-1.5">
            <ul className="space-y-1.5">{cardsItems(visibleRows)}</ul>
          </section>
        )
      }
      const seen: string[] = []
      for (const row of visibleRows) {
        const key = row.group ?? ''
        if (!seen.includes(key)) seen.push(key)
      }
      return seen.map((key) => {
        const heading = groupLabel(key)
        const items = visibleRows.filter((row) => (row.group ?? '') === key)
        if (key === '' && items.length === 0) return null
        if (items.length === 0) return null
        return (
          <section
            key={key || 'all'}
            aria-label={heading || label(`report.${node.id}`, node.id)}
            className="space-y-1.5"
          >
            {heading !== '' && (
              <h4 className="flex items-center gap-2 text-xs font-medium">
                {heading}
                <span className="text-[var(--as-muted-fg)]">{items.length}</span>
              </h4>
            )}
            <ul className="space-y-1.5">{cardsItems(items)}</ul>
          </section>
        )
      })
    }

    const groupLabel = (key: string): string =>
      surface.groups?.[key] ?? label(`status.${key}`, key)

    const cardsItems = (items: SurfaceRow[]) =>
      items.map((row) => (
        <li
          key={row.id}
          data-testid={`surface-row-${row.id}`}
          data-as="surface-card"
          className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2.5 py-1.5 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium" title={row.title ?? undefined}>
              {row.title ?? row.id}
            </span>
            {row.badge !== undefined && (
              <Badge className="text-[10px]" data-testid={`surface-card-badge-${row.id}`}>
                {row.badge}
              </Badge>
            )}
            {row.meta?.map((segment, index) => (
              <span key={`${row.id}-meta-${index}`} className="text-[var(--as-muted-fg)]">
                {segment}
              </span>
            ))}
            {knownActions(row.actions ?? []).length > 0 && (
              <span className="ml-auto flex items-center gap-1">
                {knownActions(row.actions ?? []).map((id) => actionButton(id, row.id))}
              </span>
            )}
          </div>
          {rowEvidence(row.id, row.evidence, row.evidenceSummary)}
        </li>
      ))

    const byType = (type: SurfaceNodeType) => known.filter((node) => node.type === type)

    return (
      <div
        ref={ref}
        data-as="surface-renderer"
        data-testid="surface"
        className={cn('space-y-4 text-sm text-[var(--as-fg)]', className)}
      >
        {SURFACE_NODE_ORDER.flatMap((type) =>
          byType(type).map((node) => {
            const nodeLabel = label(`report.${node.id}`, node.id)
            switch (node.type) {
              case 'stat': {
                const value = valueText(bindValue(surface.values, node.bind))
                return (
                  <div
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-stat"
                    className="rounded-[var(--as-radius)] border border-[var(--as-border)] px-3 py-2"
                  >
                    <div className="text-lg font-medium">{value || '—'}</div>
                    <div className="text-[11px] text-[var(--as-muted-fg)]">{nodeLabel}</div>
                  </div>
                )
              }
              case 'badge': {
                return (
                  <div
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-badge"
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span className="text-xs text-[var(--as-muted-fg)]">{nodeLabel}</span>
                    <Badge className="text-[10px]">
                      {valueText(bindValue(surface.values, node.bind)) || '—'}
                    </Badge>
                  </div>
                )
              }
              case 'progress': {
                const pct = surfaceProgressPercent(bindValue(surface.values, node.bind))
                return (
                  <div
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-progress"
                    className="space-y-1"
                  >
                    <span className="text-xs text-[var(--as-muted-fg)]">{nodeLabel}</span>
                    <div
                      role="progressbar"
                      aria-label={nodeLabel}
                      aria-valuenow={pct ?? 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--as-muted)]"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--as-primary)]"
                        style={{ width: `${pct ?? 0}%` }}
                      />
                    </div>
                  </div>
                )
              }
              case 'filter-bar': {
                const facetDefs = (node.filters ?? [])
                  .map((facetId) => facets.get(facetId))
                  .filter((facet): facet is SurfaceFilter => facet !== undefined)
                return (
                  <div
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-filter-bar"
                    className="flex flex-wrap items-center gap-2"
                  >
                    {facetDefs.map((facet) => {
                      const active = activeFilters?.[facet.id] ?? 'all'
                      return (
                        <React.Fragment key={facet.id}>
                          <button
                            type="button"
                            data-testid={`surface-filter-${facet.id}-all`}
                            aria-pressed={active === 'all' || active === ''}
                            onClick={() => onFilterChange?.(facet.id, null)}
                            className={active === 'all' || active === '' ? chipActive : chipIdle}
                          >
                            {allLabel}
                          </button>
                          {facet.options.map((option) => {
                            const isActive = active === option.value
                            return (
                              <button
                                key={option.value}
                                type="button"
                                data-testid={`surface-filter-${facet.id}-${option.value}`}
                                aria-pressed={isActive}
                                onClick={() => onFilterChange?.(facet.id, option.value)}
                                className={isActive ? chipActive : chipIdle}
                              >
                                {option.label ?? label(`status.${option.value}`, option.value)}
                              </button>
                            )
                          })}
                        </React.Fragment>
                      )
                    })}
                  </div>
                )
              }
              case 'select': {
                const options = Array.isArray(node.options) ? node.options : []
                const selectId = node.bind ?? node.id
                const active = activeFilters?.[selectId] ?? ''
                const facet = facets.get(selectId)
                return (
                  <label
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-select"
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-[var(--as-muted-fg)]">{nodeLabel}</span>
                    <select
                      data-testid={`surface-select-${selectId}`}
                      className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1 text-xs text-[var(--as-fg)]"
                      value={active}
                      onChange={(event) =>
                        onFilterChange?.(
                          selectId,
                          event.target.value === '' ? null : event.target.value,
                        )
                      }
                    >
                      <option value="">{allLabel}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {facet?.options.find((o) => o.value === option)?.label ??
                            label(`status.${option}`, option)}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              }
              case 'actions': {
                const actions = knownActions(node.actions ?? [])
                if (actions.length === 0) return null
                return (
                  <div
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-actions"
                    className="flex flex-wrap items-center gap-2"
                  >
                    {actions.map((id) => actionButton(id))}
                  </div>
                )
              }
              case 'table': {
                const columns = Array.isArray(node.columns) ? node.columns : []
                if (columns.length === 0) return null
                return (
                  <table
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-table"
                    className="w-full text-xs"
                  >
                    <thead>
                      <tr className="border-b border-[var(--as-border)] text-left text-[var(--as-muted-fg)]">
                        {columns.map((column) => (
                          <th key={column} scope="col" className="py-1.5 pr-3 font-medium">
                            {label(`report.${node.id}.${column}`, column)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => (
                        <tr
                          key={row.id}
                          data-testid={`surface-row-${row.id}`}
                          className="border-b border-[var(--as-border)]/50 align-top"
                        >
                          {columns.map((column, colIndex) => (
                            <td
                              key={column}
                              data-testid={`surface-cell-${row.id}-${column}`}
                              className="py-1.5 pr-3"
                            >
                              <div className="max-w-md min-w-0">
                                <span
                                  className="block truncate"
                                  title={valueText(row.values?.[column])}
                                >
                                  {renderValue(row, column)}
                                </span>
                                {colIndex === 0 && rowEvidence(row.id, row.evidence, row.evidenceSummary)}
                              </div>
                            </td>
                          ))}
                          {knownActions(row.actions ?? []).length > 0 && (
                            <td className="py-1.5 align-top">
                              <span className="flex items-center gap-1">
                                {knownActions(row.actions ?? []).map((id) => actionButton(id, row.id))}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
              case 'cards':
                return (
                  <div
                    key={node.id}
                    data-testid={`surface-${node.id}`}
                    data-as="surface-cards"
                    className="space-y-3"
                  >
                    {renderCards(node)}
                  </div>
                )
              default:
                return null
            }
          }),
        )}

        {truncatedLabel && (
          <p role="status" data-testid="surface-truncated" className="text-xs text-[var(--as-muted-fg)]">
            {truncatedLabel}
          </p>
        )}

        {rows.length > visibleRows.length && (
          <Button
            size="sm"
            variant="outline"
            className={actionClass}
            data-testid="surface-load-more"
            onClick={() => setPage((current) => current + SURFACE_PAGE_SIZE)}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            {loadMoreLabel}
          </Button>
        )}
      </div>
    )
  },
)
