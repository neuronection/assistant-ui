import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { IntegrationSourcesList } from '../src/components/integration-sources-list/IntegrationSourcesList'
import { source } from './integration-fixtures'
import type { IntegrationSourceRowView } from '../src/contracts'

function setup(sources?: IntegrationSourceRowView[], handlersOverride = {}, props = {}) {
  const handlers = {
    onCheck: vi.fn(),
    onRemoveSource: vi.fn(),
    onInstallCandidate: vi.fn(),
    onToggleEnabled: vi.fn(),
    onTombstone: vi.fn(),
  }
  return {
    handlers,
    ...render(
      <IntegrationSourcesList
        sources={sources ?? [source()]}
        {...handlers}
        {...handlersOverride}
        {...props}
      />,
    ),
  }
}

describe('IntegrationSourcesList', () => {
  it('renders source rows with kind, status, pinned ref short form and gitops indicator', () => {
    setup([source({ gitops: true, groups: [] })])
    expect(screen.getByTestId('integration-source-src-1').textContent).toContain(
      'https://git.example.com/neuro/career-connectors',
    )
    expect(screen.getByText('tag-pattern@v*')).toBeTruthy()
    expect(screen.getByText('gitops')).toBeTruthy()
    expect(screen.getByTestId('integration-source-status-src-1').textContent).toBe('ok')
  })

  it('honors statusLabels on source rows (consistency with the instances list)', () => {
    setup([source({ gitops: true, groups: [] })], {
      labels: { statusLabels: { ok: 'healthy' } },
    })
    expect(screen.getByTestId('integration-source-status-src-1').textContent).toBe('healthy')
  })

  it('renders candidates with digest short form and the verbatim incompatibility reason', () => {
    setup([
      source({
        candidates: [
          {
            extensionId: 'bad-one',
            digest: 'a'.repeat(64),
            compatible: false,
            reason: "kind 'bridge' is not hosted for import",
            consent: null,
          },
        ],
      }),
    ])
    const row = screen.getByTestId('integration-candidate-bad-one')
    expect(row.textContent).toContain("kind 'bridge' is not hosted for import")
    expect(screen.queryByRole('button', { name: 'Install with consent…' })).toBeNull()
  })

  it('hands compatible candidates to the host consent flow — never installs inline', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    await user.click(screen.getByRole('button', { name: 'Install with consent…' }))
    expect(handlers.onInstallCandidate).toHaveBeenCalledWith(
      'src-1',
      expect.objectContaining({ extensionId: 'greenhouse-jobs' }),
    )
  })

  it('emits check and remove-source; remove labels announce the origin', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    await user.click(screen.getByRole('button', { name: 'Check source: https://git.example.com/neuro/career-connectors' }))
    expect(handlers.onCheck).toHaveBeenCalledWith('src-1')
    await user.click(
      screen.getByRole('button', { name: 'Remove source: https://git.example.com/neuro/career-connectors' }),
    )
    expect(handlers.onRemoveSource).toHaveBeenCalledWith('src-1')
  })

  it('scopes instance actions to their source', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    await user.click(screen.getByRole('checkbox', { name: 'Enable: primary' }))
    expect(handlers.onToggleEnabled).toHaveBeenCalledWith(
      'src-1',
      expect.objectContaining({ id: 'inst-1' }),
      false,
    )
    await user.click(screen.getByRole('button', { name: 'Tombstone: primary' }))
    expect(handlers.onTombstone).toHaveBeenCalledWith(
      'src-1',
      expect.objectContaining({ id: 'inst-1' }),
    )
  })

  it('surfaces the source-level error', () => {
    setup([source({ error: 'fetch failed: rate-limited' })])
    expect(screen.getByRole('alert').textContent).toBe('fetch failed: rate-limited')
  })

  it('ships the loading/error/empty triad', () => {
    const loading = render(<IntegrationSourcesList sources={[]} loading />)
    expect(loading.container.querySelector('[data-state="loading"]')).toBeTruthy()
    loading.unmount()
    render(<IntegrationSourcesList sources={[]} />)
    expect(screen.getByTestId('integration-sources-empty').textContent).toBe(
      'No extension sources yet.',
    )
  })

  it('keyboard: tab reaches check, remove, candidate install and instance controls', async () => {
    const user = userEvent.setup()
    setup()
    await user.tab()
    expect(document.activeElement?.tagName).toBe('BUTTON')
    await user.tab()
    await user.tab()
    expect(document.activeElement?.textContent).toBe('Install with consent…')
  })

  it('has no axe violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })
})
