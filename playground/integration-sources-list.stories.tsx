import { action } from '@ladle/react'

import { IntegrationSourcesList } from '../src/components/integration-sources-list/IntegrationSourcesList'
import { source } from './integration-fixtures'

export const Default = () => (
  <div className="max-w-3xl">
    <IntegrationSourcesList
      sources={[
        source(),
        source({
          id: 'src-2',
          kind: 'local',
          origin: '/home/dev/src/career-connector-template',
          status: 'failing',
          error: 'sync failed: unreachable (retryable)',
          refStrategy: 'branch',
          refValue: 'main',
          gitops: true,
          candidates: [],
        }),
      ]}
      onCheck={(id) => action('onCheck')(id)}
      onRemoveSource={(id) => action('onRemoveSource')(id)}
      onInstallCandidate={(sourceId, candidate) =>
        action('onInstallCandidate')(`${sourceId}:${candidate.extensionId}`)
      }
      onToggleEnabled={(sourceId, instance, enabled) =>
        action('onToggleEnabled')(`${sourceId}:${instance.id} → ${enabled}`)
      }
      onPark={(sourceId, instance) => action('onPark')(`${sourceId}:${instance.id}`)}
      onTombstone={(sourceId, instance) => action('onTombstone')(`${sourceId}:${instance.id}`)}
      labels={{
        statusLabels: { ok: 'healthy', failing: 'unreachable' },
        kindLabels: { git: 'git source', local: 'local path' },
      }}
    />
  </div>
)

export const Loading = () => <IntegrationSourcesList sources={[]} loading />

export const Error = () => (
  <IntegrationSourcesList sources={[]} error="extension sources unreachable" />
)

export const Empty = () => <IntegrationSourcesList sources={[]} />
