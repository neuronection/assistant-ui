import * as React from 'react'
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  PlugZap,
  Power,
  Trash2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { ProviderCard } from '../provider-card/ProviderCard'
import type { ActionMenuItem } from '../menu/Menu'
import type {
  WebSearchProviderCatalog,
  WebSearchProviderProbeView,
  WebSearchProviderView,
} from './types'

export interface WebSearchProvidersListLabels {
  emptyLabel?: string
  /** Priority badge per row (`position` is 1-based). */
  orderLabel?: (position: number) => string
  disabledBadge?: string
  noKeyLabel?: string
  keyStoredLabel?: string
  enableLabel?: string
  disableLabel?: string
  moveUpLabel?: string
  moveDownLabel?: string
  editLabel?: string
  deleteLabel?: string
  testLabel?: string
  idleLabel?: string
  okLabel?: string
  failLabel?: string
  /** Accessible label for a row's `⋯` actions menu. */
  actionsLabel?: (name: string) => string
}

export interface WebSearchProvidersListProps {
  /** Ordered list — order = fallback priority. */
  providers: WebSearchProviderView[]
  catalog: WebSearchProviderCatalog
  /** Connection probes keyed by provider id. */
  probes?: Record<string, WebSearchProviderProbeView>
  /** Id currently mid-test (shows the testing spinner). */
  testingId?: string | null
  busy?: boolean
  labels?: WebSearchProvidersListLabels
  className?: string
  onToggle: (id: string, enabled: boolean) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onTest: (id: string) => void
  onEdit: (provider: WebSearchProviderView) => void
  /** App owns confirmation. */
  onDelete: (id: string) => void
}

/** The configured web-search providers as ProviderCards — the AI-providers
 * list pattern: mark + name + type/priority badges, muted base-URL
 * subtitle, the probe result as the connection status line, and every
 * management action (enable/disable, reorder, test, edit, delete) in the
 * `⋯` overflow menu. Presentational and controlled (ADR-006). */
export const WebSearchProvidersList = React.forwardRef<
  HTMLUListElement,
  WebSearchProvidersListProps
>(function WebSearchProvidersList(
  {
    providers,
    catalog,
    probes = {},
    testingId = null,
    busy = false,
    labels,
    onToggle,
    onMove,
    onTest,
    onEdit,
    onDelete,
    className,
  },
  ref,
) {
  const t = {
    emptyLabel: labels?.emptyLabel ?? 'No web search providers yet.',
    orderLabel: labels?.orderLabel ?? ((position: number) => `priority ${position}`),
    disabledBadge: labels?.disabledBadge ?? 'disabled',
    noKeyLabel: labels?.noKeyLabel ?? 'no key',
    keyStoredLabel: labels?.keyStoredLabel ?? 'API key saved',
    enableLabel: labels?.enableLabel ?? 'Enable',
    disableLabel: labels?.disableLabel ?? 'Disable',
    moveUpLabel: labels?.moveUpLabel ?? 'Move up',
    moveDownLabel: labels?.moveDownLabel ?? 'Move down',
    editLabel: labels?.editLabel ?? 'Edit provider',
    deleteLabel: labels?.deleteLabel ?? 'Delete provider',
    testLabel: labels?.testLabel ?? 'Test',
    idleLabel: labels?.idleLabel ?? 'Not tested',
    okLabel: labels?.okLabel ?? 'ok',
    failLabel: labels?.failLabel ?? 'failed',
    actionsLabel: labels?.actionsLabel ?? ((name: string) => `Actions for ${name}`),
  }

  return (
    <ul
      ref={ref}
      data-as="web-search-providers-list"
      className={cn('space-y-2', className)}
      data-testid="wsp-rows"
    >
      {providers.length === 0 ? (
        <li className="text-sm text-[var(--as-muted-fg)]" data-testid="wsp-empty">
          {t.emptyLabel}
        </li>
      ) : null}
      {providers.map((provider, index) => {
        const entry = catalog.entries[provider.type]
        const typeLabel = entry?.label ?? provider.type
        const probe = probes[provider.id]
        const testing = testingId === provider.id
        const missingKey = Boolean(entry?.requiresKey) && !provider.keySet
        const actions: ActionMenuItem[] = [
          {
            key: 'toggle',
            label: provider.enabled ? t.disableLabel : t.enableLabel,
            icon: Power,
            disabled: busy,
            onSelect: () => onToggle(provider.id, !provider.enabled),
          },
          {
            key: 'moveUp',
            label: t.moveUpLabel,
            icon: ChevronUp,
            disabled: index === 0 || busy,
            onSelect: () => onMove(provider.id, 'up'),
          },
          {
            key: 'moveDown',
            label: t.moveDownLabel,
            icon: ChevronDown,
            disabled: index === providers.length - 1 || busy,
            onSelect: () => onMove(provider.id, 'down'),
          },
          {
            key: 'test',
            label: t.testLabel,
            icon: PlugZap,
            disabled: busy || testing,
            pending: testing,
            onSelect: () => onTest(provider.id),
          },
          {
            key: 'edit',
            label: t.editLabel,
            icon: Pencil,
            disabled: busy,
            onSelect: () => onEdit(provider),
          },
          {
            key: 'delete',
            label: t.deleteLabel,
            icon: Trash2,
            danger: true,
            disabled: busy,
            onSelect: () => onDelete(provider.id),
          },
        ]
        return (
          <li key={provider.id} data-testid={`wsp-row-${provider.id}`}>
            <ProviderCard
              name={provider.name}
              logoPreset={provider.type}
              nameTitle={provider.baseUrl ?? undefined}
              subtitle={provider.baseUrl ?? undefined}
              badges={[
                { key: 'type', label: typeLabel },
                { key: 'order', label: t.orderLabel(index + 1) },
                ...(!provider.enabled
                  ? [{ key: 'disabled', label: t.disabledBadge, danger: true }]
                  : []),
                ...(missingKey
                  ? [
                      {
                        key: 'nokey',
                        label: t.noKeyLabel,
                        danger: true,
                        testId: `wsp-key-${provider.id}`,
                      },
                    ]
                  : []),
              ]}
              status={testing ? 'testing' : probe ? (probe.status === 'ok' ? 'ok' : 'fail') : 'idle'}
              connectionLabel={typeLabel}
              idleLabel={t.idleLabel}
              okLabel={t.okLabel}
              failLabel={t.failLabel}
              errorMessage={probe && probe.status !== 'ok' ? (probe.error ?? null) : null}
              latencyMs={probe?.status === 'ok' ? (probe.latencyMs ?? null) : null}
              meta={
                provider.keySet ? (
                  <span className="text-xs text-[var(--as-muted-fg)]">
                    {provider.keyHint ?? t.keyStoredLabel}
                  </span>
                ) : undefined
              }
              actions={actions}
              actionsLabel={t.actionsLabel(provider.name)}
            />
          </li>
        )
      })}
    </ul>
  )
})
