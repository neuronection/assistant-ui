import { action } from '@ladle/react'

import { IntegrationCard } from '../src/components/integration-card/IntegrationCard'
import { entry } from './integration-fixtures'

export const Default = () => (
  <div className="grid max-w-2xl gap-3">
    <IntegrationCard
      extension={entry()}
      enabled={false}
      instanceCount={2}
      onEnable={(e, enabled) => action('onEnable')(`${e.id} → ${enabled}`)}
      onConfigure={(e) => action('onConfigure')(e.id)}
      onPark={(e) => action('onPark')(e.id)}
    />
    <IntegrationCard
      extension={entry({ originClass: 'bundled', provenance: null, id: 'csv-builtins', name: 'CSV built-ins' })}
      enabled
      labels={{ kindLabel: 'mini-app' }}
      onEnable={(e, enabled) => action('onEnable')(`${e.id} → ${enabled}`)}
      onRemove={(e) => action('onRemove')(e.id)}
    />
  </div>
)

export const UpdateStates = () => (
  <div className="grid max-w-2xl gap-3">
    <IntegrationCard
      extension={entry({ update: { state: 'available', version: '1.1.0', requiresReconsent: true } })}
      onApplyUpdate={(e) => action('onApplyUpdate')(e.id)}
    />
    <IntegrationCard
      extension={entry({ id: 'drifted', update: { state: 'digest-drift', detail: 'pinned ref content changed' } })}
    />
  </div>
)

export const DetailSlot = () => (
  <IntegrationCard extension={entry()} enabled instanceCount={1} onEnable={() => {}}>
    <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] p-3 text-sm text-[var(--as-muted-fg)]">
      App-owned domain detail (health tabs, career probe buttons) renders here.
    </div>
  </IntegrationCard>
)

export const CustomActions = () => (
  <IntegrationCard
    extension={entry()}
    enabled
    renderActions={() => (
      <button
        type="button"
        className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2 py-1 text-xs"
        onClick={() => action('probe')('fired')}
      >
        Probe now
      </button>
    )}
  />
)
