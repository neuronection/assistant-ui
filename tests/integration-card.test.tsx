import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { IntegrationCard } from '../src/components/integration-card/IntegrationCard'
import { extension } from './integration-fixtures'

function setup(overrides = {}, props = {}) {
  const handlers = {
    onEnable: vi.fn(),
    onConfigure: vi.fn(),
    onPark: vi.fn(),
    onRestore: vi.fn(),
    onRemove: vi.fn(),
    onApplyUpdate: vi.fn(),
  }
  return {
    handlers,
    ...render(<IntegrationCard extension={extension(overrides)} {...handlers} {...props} />),
  }
}

describe('IntegrationCard', () => {
  it('renders identity with origin chip, tier, verbatim provenance and capability chips', () => {
    setup()
    expect(screen.getByTestId('integration-card')).toBeTruthy()
    expect(screen.getByText('Example posting fetcher')).toBeTruthy()
    expect(screen.getByText('imported')).toBeTruthy()
    expect(screen.getByText('T3')).toBeTruthy()
    const provenance = screen.getByTestId('integration-card-provenance')
    expect(provenance.textContent).toContain('Neuronection')
    expect(provenance.textContent).toContain('MIT')
    expect(provenance.textContent).toContain(
      'https://example.com/your-fork/career-connector-template',
    )
    expect(screen.getByText('sync')).toBeTruthy()
    expect(screen.getByTestId('integration-card').textContent).toContain('destructive')
  })

  it('shows the instance count and update states', () => {
    setup(
      {
        update: { state: 'available', version: '1.1.0', requiresReconsent: true },
      },
      { instanceCount: 2 },
    )
    expect(screen.getByTestId('integration-card-instances').textContent).toContain('2')
    expect(screen.getByTestId('integration-card-update').textContent).toContain('1.1.0')
    expect(screen.getByTestId('integration-card-update').textContent).toContain(
      're-consent required',
    )
  })

  it('renders digest drift loudly with role=alert', () => {
    setup({ update: { state: 'digest-drift', detail: 'pinned ref content changed' } })
    const drift = screen.getByTestId('integration-card-drift')
    expect(drift.getAttribute('role')).toBe('alert')
    expect(drift.textContent).toContain('digest drift')
  })

  it('emits enable, configure, park, restore, remove and apply-update as typed events', async () => {
    const user = userEvent.setup()
    const { handlers } = setup(
      { update: { state: 'available', requiresReconsent: false } },
      { enabled: false },
    )
    await user.click(screen.getByRole('checkbox', { name: 'Enable Example posting fetcher' }))
    expect(handlers.onEnable).toHaveBeenCalledWith(expect.objectContaining({ id: 'example-posting-fetcher' }), true)
    await user.click(screen.getByRole('button', { name: 'Configure' }))
    expect(handlers.onConfigure).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Apply update' }))
    expect(handlers.onApplyUpdate).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Park' }))
    expect(handlers.onPark).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(handlers.onRemove).toHaveBeenCalled()
  })

  it('keyboard-only: every action is reachable and the toggle fires from the keyboard', async () => {
    const user = userEvent.setup()
    const { handlers } = setup(
      { update: { state: 'available', requiresReconsent: false } },
      { enabled: false },
    )
    const focusables: string[] = []
    for (let i = 0; i < 7; i += 1) {
      await user.tab()
      const el = document.activeElement
      if (!el || el === document.body) break
      focusables.push(el.getAttribute('type') === 'checkbox' ? 'checkbox' : el.textContent ?? '')
    }
    expect(focusables[0]).toBe('checkbox')
    expect(focusables).toContain('Configure')
    expect(focusables).toContain('Apply update')
    expect(focusables).toContain('Park')
    await user.tab()
    await user.keyboard(' ')
    expect(handlers.onEnable).toHaveBeenCalled()
  })

  it('renders app-owned detail content in the children slot', () => {
    setup({}, { children: <p data-testid="domain-detail">health tab content</p> })
    expect(screen.getByTestId('domain-detail').textContent).toBe('health tab content')
  })

  it('renders the action row through renderActions when the host takes over', async () => {
    const user = userEvent.setup()
    const onCustom = vi.fn()
    setup(
      {},
      {
        enabled: null,
        renderActions: () => (
          <button type="button" onClick={onCustom}>
            Probe now
          </button>
        ),
      },
    )
    expect(screen.queryByRole('button', { name: 'Configure' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Probe now' }))
    expect(onCustom).toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })
})
