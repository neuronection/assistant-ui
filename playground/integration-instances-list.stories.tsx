import { action } from '@ladle/react'

import { IntegrationInstancesList } from '../src/components/integration-instances-list/IntegrationInstancesList'
import { group } from './integration-fixtures'

export const Default = () => (
  <div className="max-w-3xl">
    <IntegrationInstancesList
      groups={[
        group(),
        group({
          extension: {
            id: 'rss-feeds',
            name: 'RSS feeds',
            version: '0.3.0',
            originClass: 'bundled',
            tier: 'T1',
          },
          instances: [
            {
              id: 'rss-1',
              extensionId: 'rss-feeds',
              name: 'morning digest',
              enabled: true,
              status: 'ok',
              lastSuccessAt: '2026-10-17 02:10 UTC',
              conditions: [],
              tier: 'T1',
              originClass: 'bundled',
              managedBy: 'gitops',
              digest: null,
              update: null,
            },
          ],
        }),
      ]}
      onToggleEnabled={(i, enabled) => action('onToggleEnabled')(`${i.id} → ${enabled}`)}
      onConfigure={(i) => action('onConfigure')(i.id)}
      onPark={(i) => action('onPark')(i.id)}
      onTombstone={(i) => action('onTombstone')(i.id)}
      onApplyUpdate={(i) => action('onApplyUpdate')(i.id)}
      renderInstanceActions={(i) => (
        <button
          key={i.id}
          type="button"
          className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2 py-1 text-xs"
          onClick={() => action('probe')(i.id)}
        >
          Test
        </button>
      )}
    />
  </div>
)

export const Tombstoned = () => (
  <div className="max-w-3xl">
    <IntegrationInstancesList
      groups={[
        group({
          instances: [
            {
              id: 'inst-9',
              extensionId: 'example-posting-fetcher',
              name: 'archived',
              enabled: false,
              status: 'stale',
              lifecycle: 'removed',
              parked: true,
              managedBy: 'gitops',
              conditions: ['needs-config'],
              originClass: 'imported',
              tier: 'T3',
              digest: null,
              update: { state: 'digest-drift', ref: 'v1.0.0', detail: 'pinned ref content changed' },
            },
          ],
        }),
      ]}
    />
  </div>
)

export const Loading = () => <IntegrationInstancesList groups={[]} loading />

export const Error = () => (
  <IntegrationInstancesList groups={[]} error="instance registry unreachable" />
)

export const Empty = () => <IntegrationInstancesList groups={[]} />
