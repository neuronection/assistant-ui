import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { ActionResultDialog } from '../src/components/integration-action-result-dialog/ActionResultDialog'
import { DocsDialog } from '../src/components/integration-docs-dialog/DocsDialog'
import type { SurfaceView } from '../src/components/surface-renderer/SurfaceRenderer'

afterEach(cleanup)

const SURFACE: SurfaceView = {
  nodes: [
    { id: 'n1', type: 'stat', bind: 'count' },
    { id: 'n2', type: 'badge', bind: 'status' },
  ],
  values: { count: 3, status: 'done' },
  rows: [{ id: 'r1', values: { count: 3, status: 'done' } }],
}

describe('ActionResultDialog', () => {
  it('hosts the family SurfaceRenderer for the declarative payload (compose, not reinvent)', async () => {
    render(
      <ActionResultDialog
        open
        onOpenChange={() => {}}
        status="ready"
        result={{ title: 'Lookup', surface: SURFACE }}
      />,
    )
    expect(await screen.findByTestId('surface')).toBeTruthy()
    expect(screen.getByTestId('integration-action-result').textContent).toContain('done')
  })

  it('ships loading and error states with the error detail and a retry affordance', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const view = render(
      <ActionResultDialog open onOpenChange={() => {}} status="loading" onRetry={onRetry} />,
    )
    expect(screen.getByTestId('integration-action-result-loading')).toBeTruthy()
    view.unmount()
    render(
      <ActionResultDialog
        open
        onOpenChange={() => {}}
        status="error"
        errorDetail="rate-limited: retry in 30s"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByRole('alert').textContent).toBe('The action failed.')
    expect(screen.getByText('rate-limited: retry in 30s')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('emits typed surface actions through onSurfaceAction', async () => {
    const user = userEvent.setup()
    const onSurfaceAction = vi.fn()
    render(
      <ActionResultDialog
        open
        onOpenChange={() => {}}
        status="ready"
        result={{
          title: 'Lookup',
          surface: {
            nodes: [{ id: 'n1', type: 'actions', actions: ['item:open'] }],
            values: {},
          },
        }}
        onSurfaceAction={onSurfaceAction}
      />,
    )
    await user.click(await screen.findByTestId('surface-action-item:open'))
    expect(onSurfaceAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'item:open' }))
  })

  it('keyboard: escape closes through onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ActionResultDialog
        open
        onOpenChange={onOpenChange}
        status="ready"
        result={{ surface: SURFACE }}
      />,
    )
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe violations (open dialog, ready state)', async () => {
    render(
      <ActionResultDialog
        open
        onOpenChange={() => {}}
        status="ready"
        result={{ title: 'Lookup', surface: SURFACE }}
      />,
    )
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

const DOCS = [
  {
    id: 'guide',
    title: 'Guide',
    children: [{ id: 'guide/setup', title: 'Setup' }],
  },
  { id: 'reference', title: 'Reference' },
]

describe('DocsDialog', () => {
  it('renders the tree, tracks controlled selection and renders content through the slot', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const view = render(
      <DocsDialog
        open
        onOpenChange={() => {}}
        docs={DOCS}
        selectedId="guide"
        onSelect={onSelect}
        renderContent={(node) => <p data-testid="docs-slot">content of {node.id}</p>}
      />,
    )
    expect(screen.getByText('Guide')).toBeTruthy()
    expect(screen.getByTestId('docs-slot').textContent).toBe('content of guide')
    await user.click(screen.getByRole('button', { name: 'Reference' }))
    expect(onSelect).toHaveBeenCalledWith('reference')
    view.rerender(
      <DocsDialog
        open
        onOpenChange={() => {}}
        docs={DOCS}
        selectedId="reference"
        onSelect={onSelect}
        renderContent={(node) => <p data-testid="docs-slot">content of {node.id}</p>}
      />,
    )
    expect(screen.getByTestId('docs-slot').textContent).toBe('content of reference')
  })

  it('ships loading, error and empty states', () => {
    const loading = render(
      <DocsDialog
        open
        onOpenChange={() => {}}
        docs={DOCS}
        selectedId="guide"
        onSelect={() => {}}
        renderContent={() => null}
        status="loading"
      />,
    )
    expect(screen.getByTestId('integration-docs-loading')).toBeTruthy()
    loading.unmount()
    const error = render(
      <DocsDialog
        open
        onOpenChange={() => {}}
        docs={DOCS}
        selectedId="guide"
        onSelect={() => {}}
        renderContent={() => null}
        status="error"
        errorDetail="docs bundle missing"
      />,
    )
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('docs bundle missing')).toBeTruthy()
    error.unmount()
    render(
      <DocsDialog
        open
        onOpenChange={() => {}}
        docs={[]}
        selectedId={null}
        onSelect={() => {}}
        renderContent={() => null}
      />,
    )
    expect(screen.getByTestId('integration-docs-empty').textContent).toBe(
      'This bundle ships no docs.',
    )
  })

  it('keyboard: tree buttons are reachable; escape closes', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <DocsDialog
        open
        onOpenChange={onOpenChange}
        docs={DOCS}
        selectedId="guide"
        onSelect={() => {}}
        renderContent={() => null}
      />,
    )
    await user.tab()
    const focused = document.activeElement?.textContent
    expect(focused === 'Guide' || focused === 'Setup' || focused === 'Reference').toBe(true)
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe violations (open dialog)', async () => {
    render(
      <DocsDialog
        open
        onOpenChange={() => {}}
        docs={DOCS}
        selectedId="guide"
        onSelect={() => {}}
        renderContent={(node) => <p>{node.title}</p>}
      />,
    )
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
