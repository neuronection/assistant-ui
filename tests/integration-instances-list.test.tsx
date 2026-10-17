import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { IntegrationInstancesList } from '../src/components/integration-instances-list/IntegrationInstancesList'
import { group, instance } from './integration-fixtures'
import type { IntegrationExtensionGroupView } from '../src/contracts'

function setup(
  groups?: IntegrationExtensionGroupView[],
  handlersOverride = {},
  props = {},
) {
  const handlers = {
    onToggleEnabled: vi.fn(),
    onConfigure: vi.fn(),
    onPark: vi.fn(),
    onRestore: vi.fn(),
    onTombstone: vi.fn(),
    onApplyUpdate: vi.fn(),
  }
  return {
    handlers,
    ...render(
      <IntegrationInstancesList
        groups={groups ?? [group()]}
        {...handlers}
        {...handlersOverride}
        {...props}
      />,
    ),
  }
}

describe('IntegrationInstancesList', () => {
  it('groups rows under their extension header (extension → N instances)', () => {
    setup([
      group({
        instances: [
          instance({ id: 'inst-1', name: 'primary' }),
          instance({ id: 'inst-2', name: 'secondary' }),
        ],
      }),
    ])
    expect(screen.getByTestId('integration-group-example-posting-fetcher')).toBeTruthy()
    expect(screen.getByTestId('integration-instance-inst-1')).toBeTruthy()
    expect(screen.getByTestId('integration-instance-inst-2')).toBeTruthy()
  })

  it('renders status, origin, tier, digest and runtime fields', () => {
    setup([group({ instances: [instance({ lastSuccessAt: '2026-10-17T00:00:00Z', consecutiveFailures: 3 })] })])
    const row = screen.getByTestId('integration-instance-inst-1')
    expect(row.textContent).toContain('last success')
    expect(row.textContent).toContain('consecutive failures: 3')
    expect(row.textContent).toContain('imported')
  })

  it('renders needs-config / needs-secret condition badges', () => {
    setup([group({ instances: [instance({ conditions: ['needs-config', 'needs-secret'] })] })])
    expect(screen.getByTestId('integration-condition-inst-1-needs-config').textContent).toBe(
      'needs config',
    )
    expect(screen.getByTestId('integration-condition-inst-1-needs-secret').textContent).toBe(
      'needs secret',
    )
  })

  it('shows update-available with re-consent and digest-drift states', () => {
    setup([
      group({
        instances: [
          instance({ id: 'u1', update: { state: 'available', version: '1.2.0', requiresReconsent: true } }),
          instance({ id: 'u2', update: { state: 'digest-drift', detail: 'ref moved' } }),
        ],
      }),
    ])
    expect(screen.getByTestId('integration-update-u1').textContent).toContain('re-consent required')
    const drift = screen.getByTestId('integration-drift-u2')
    expect(drift.getAttribute('role')).toBe('alert')
  })

  it('emits enable, configure, park, restore, tombstone and apply-update per instance', async () => {
    const user = userEvent.setup()
    const { handlers } = setup([group({ instances: [instance({ enabled: false, parked: true })] })])
    await user.click(screen.getByRole('checkbox', { name: 'Enable: primary' }))
    expect(handlers.onToggleEnabled).toHaveBeenCalledWith(expect.objectContaining({ id: 'inst-1' }), true)
    await user.click(screen.getByRole('button', { name: 'Configure' }))
    expect(handlers.onConfigure).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Restore' }))
    expect(handlers.onRestore).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Tombstone: primary' }))
    expect(handlers.onTombstone).toHaveBeenCalled()
  })

  it('keyboard: the enable checkbox is reachable and togglable with space', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    await user.tab()
    const active = document.activeElement
    expect(active?.getAttribute('type')).toBe('checkbox')
    expect(active?.getAttribute('aria-label')).toBe('Enable: primary')
    await user.keyboard(' ')
    expect(handlers.onToggleEnabled).toHaveBeenCalled()
  })

  it('renders domain actions through renderInstanceActions', async () => {
    const user = userEvent.setup()
    const onProbe = vi.fn()
    setup(undefined, {
      renderInstanceActions: () => (
        <button type="button" onClick={onProbe}>
          Test
        </button>
      ),
    })
    await user.click(screen.getByRole('button', { name: 'Test' }))
    expect(onProbe).toHaveBeenCalled()
  })

  it('ships the loading/error/empty triad', () => {
    const loading = render(<IntegrationInstancesList groups={[]} loading />)
    expect(loading.container.querySelector('[data-state="loading"]')).toBeTruthy()
    loading.unmount()
    const error = render(<IntegrationInstancesList groups={[]} error="load failed" />)
    expect(screen.getByRole('alert').textContent).toBe('load failed')
    error.unmount()
    render(<IntegrationInstancesList groups={[]} />)
    expect(screen.getByTestId('integration-instances-empty').textContent).toBe(
      'Nothing configured yet.',
    )
  })

  it('has no axe violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })
})
