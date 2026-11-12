import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import {
  IntegrationCapabilityChips,
  OriginChip,
  StatusBadge,
  TierBadge,
  isExtensionCapabilityId,
  isExtensionOriginClass,
  isExtensionStatusState,
  isExtensionTier,
} from '../src/components/integration-atoms/IntegrationAtoms'

describe('integration atoms', () => {
  it('OriginChip renders the D25 display law classes per origin class', () => {
    const view = render(
      <>
        <OriginChip originClass="bundled" />
        <OriginChip originClass="imported" data-testid="chip-imported" />
        <OriginChip originClass="listed" label="listed source" />
      </>,
    )
    expect(screen.getByText('bundled')).toBeTruthy()
    expect(screen.getByTestId('chip-imported').textContent).toBe('imported')
    expect(screen.getByText('listed source')).toBeTruthy()
    view.unmount()
  })

  it('StatusBadge renders the family status vocabulary with data-status', () => {
    render(
      <>
        <StatusBadge status="ok" />
        <StatusBadge status="failing" data-testid="badge-failing" />
        <StatusBadge status="stale" label="out of date" />
      </>,
    )
    expect(screen.getByText('ok')).toBeTruthy()
    expect(screen.getByTestId('badge-failing').getAttribute('data-status')).toBe('failing')
    expect(screen.getByText('out of date')).toBeTruthy()
  })

  it('TierBadge renders the tier ladder', () => {
    render(<TierBadge tier="T2" />)
    expect(screen.getByText('T2').getAttribute('data-tier')).toBe('T2')
  })

  it('IntegrationCapabilityChips renders risk-class-marked chips (D20)', () => {
    render(
      <IntegrationCapabilityChips
        capabilities={[
          { id: 'sync' },
          { id: 'chat-tools', riskClass: 'destructive' },
          { id: 'net', riskClass: 'read-only' },
        ]}
        labels={{ destructive: 'destructive' }}
      />,
    )
    const destructive = screen.getByText('destructive')
    expect(destructive).toBeTruthy()
    expect(screen.getByText('sync')).toBeTruthy()
    expect(screen.getByText('net')).toBeTruthy()
  })

  it('IntegrationCapabilityChips renders per-capability labels with the raw id as fallback', () => {
    render(
      <IntegrationCapabilityChips
        capabilities={[
          { id: 'fs-read' },
          { id: 'sync' },
          { id: 'chat-tools', riskClass: 'destructive' },
        ]}
        labels={{ destructive: 'destructive' }}
        capabilityLabels={{ 'fs-read': 'Read files' }}
        capabilityTitle="Capabilities"
      />,
    )
    expect(screen.getByText('Read files')).toBeTruthy()
    expect(screen.getByText('sync')).toBeTruthy()
    const labeled = screen.getByText('Read files').closest('[data-as-cap]')
    expect(labeled?.getAttribute('data-as-cap')).toBe('fs-read')
    expect(labeled?.getAttribute('title')).toBe('Capabilities: fs-read')
    expect(screen.getByText('chat-tools')).toBeTruthy()
  })

  it('guard helpers narrow raw strings to the charter vocabularies', () => {
    expect(isExtensionOriginClass('imported')).toBe(true)
    expect(isExtensionOriginClass('official')).toBe(false)
    expect(isExtensionStatusState('ok')).toBe(true)
    expect(isExtensionStatusState('paused')).toBe(false)
    expect(isExtensionTier('T3')).toBe(true)
    expect(isExtensionTier('T9')).toBe(false)
    expect(isExtensionCapabilityId('fs-read')).toBe(true)
    expect(isExtensionCapabilityId('ui:custom-code')).toBe(true)
    expect(isExtensionCapabilityId('teleport')).toBe(false)
  })

  it('atoms are non-interactive: no axe violations', async () => {
    const { container } = render(
      <div>
        <OriginChip originClass="imported" />
        <StatusBadge status="degraded" />
        <TierBadge tier="T0" />
        <IntegrationCapabilityChips capabilities={[{ id: 'sync', riskClass: 'state-changing' }]} />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
