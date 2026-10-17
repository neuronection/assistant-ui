import {
  IntegrationCapabilityChips,
  OriginChip,
  StatusBadge,
  TierBadge,
} from '../src/components/integration-atoms/IntegrationAtoms'
import type { ExtensionStatusState } from '../src/contracts'

export const OriginChips = () => (
  <div className="flex gap-2">
    <OriginChip originClass="bundled" />
    <OriginChip originClass="imported" />
    <OriginChip originClass="listed" />
  </div>
)

export const StatusBadges = () => (
  <div className="flex gap-2">
    {(['ok', 'degraded', 'failing', 'stale'] as ExtensionStatusState[]).map((status) => (
      <StatusBadge key={status} status={status} />
    ))}
  </div>
)

export const TierBadges = () => (
  <div className="flex gap-2">
    <TierBadge tier="T0" />
    <TierBadge tier="T1" />
    <TierBadge tier="T2" />
    <TierBadge tier="T3" />
  </div>
)

export const CapabilityChips = () => (
  <IntegrationCapabilityChips
    capabilities={[
      { id: 'sync' },
      { id: 'secrets' },
      { id: 'chat-tools', riskClass: 'read-only' },
      { id: 'chat-tools', riskClass: 'state-changing' },
      { id: 'fs-write-quarantine', riskClass: 'destructive' },
    ]}
  />
)

export const CapabilityChipsLabeled = () => (
  <IntegrationCapabilityChips
    capabilities={[
      { id: 'sync' },
      { id: 'fs-read' },
      { id: 'chat-tools', riskClass: 'state-changing' },
    ]}
    capabilityLabels={{ sync: 'Keep data in sync', 'fs-read': 'Read files' }}
    labels={{ 'state-changing': 'state-changing' }}
    capabilityTitle="Capabilities"
  />
)
