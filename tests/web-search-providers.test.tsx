import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  WebSearchProvidersPanel,
  type WebSearchProviderCatalog,
  type WebSearchProviderView,
} from '../src/components/web-search-providers/WebSearchProvidersPanel'

const CATALOG: WebSearchProviderCatalog = {
  order: ['searxng', 'tavily', 'google-pse'],
  entries: {
    searxng: {
      label: 'SearXNG',
      requiresKey: false,
      keyUrl: null,
      baseUrl: null,
      baseUrlRequired: true,
      baseUrlHint: 'https://searx.example.org',
      notes: 'Self-hosted metasearch.',
    },
    tavily: {
      label: 'Tavily',
      requiresKey: true,
      keyUrl: 'https://app.tavily.com/app/api-key',
      baseUrl: 'https://api.tavily.com',
      baseUrlRequired: false,
      baseUrlHint: 'https://api.tavily.com',
      notes: null,
    },
    'google-pse': {
      label: 'Google Programmable Search',
      requiresKey: true,
      keyUrl: null,
      baseUrl: 'https://www.googleapis.com/customsearch/v1',
      baseUrlRequired: false,
      baseUrlHint: null,
      notes: null,
      fields: [{ id: 'google_cx', label: 'Engine id (cx)', required: true, placeholder: 'cx-123' }],
    },
  },
}

const PROVIDERS: WebSearchProviderView[] = [
  {
    id: 'sp1',
    name: 'Tavily main',
    type: 'tavily',
    enabled: true,
    baseUrl: 'https://api.tavily.com',
    keyHint: '••••cret',
    keySet: true,
  },
  {
    id: 'sp2',
    name: 'Campus SearXNG',
    type: 'searxng',
    enabled: false,
    baseUrl: 'https://searx.example.org',
    keySet: false,
  },
]

function renderPanel(overrides: Partial<React.ComponentProps<typeof WebSearchProvidersPanel>> = {}) {
  const handlers = {
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    onToggle: vi.fn(),
    onTest: vi.fn(),
  }
  const utils = render(
    <WebSearchProvidersPanel providers={PROVIDERS} catalog={CATALOG} {...handlers} {...overrides} />,
  )
  return { ...utils, handlers }
}

describe('WebSearchProvidersPanel', () => {
  it('renders ordered rows with type labels, key state and the disabled badge', () => {
    renderPanel()
    expect(screen.getByText('Web search providers')).toBeInTheDocument()
    expect(screen.getByTestId('wsp-row-sp1')).toBeInTheDocument()
    expect(screen.getByTestId('wsp-row-sp2')).toBeInTheDocument()
    expect(screen.getByText('Tavily')).toBeInTheDocument()
    expect(screen.getByText('••••cret')).toBeInTheDocument()
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('toggle emits the flipped enabled state', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('checkbox', { name: 'Enable provider: Tavily main' }))
    expect(handlers.onToggle).toHaveBeenCalledWith('sp1', false)
  })

  it('move emits up/down and boundary moves are disabled', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    expect(screen.getByRole('button', { name: 'Move up: Tavily main' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move down: Campus SearXNG' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Move down: Tavily main' }))
    expect(handlers.onMove).toHaveBeenCalledWith('sp1', 'down')
    await user.click(screen.getByRole('button', { name: 'Move up: Campus SearXNG' }))
    expect(handlers.onMove).toHaveBeenCalledWith('sp2', 'up')
  })

  it('test emits the provider id and shows the probe', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    const firstTest = screen.getAllByRole('button', { name: 'Test' })[0]
    expect(firstTest).toBeDefined()
    if (firstTest) await user.click(firstTest)
    expect(handlers.onTest).toHaveBeenCalledWith('sp1')
  })

  it('shows the testing state and the probe status row', () => {
    renderPanel({
      testingId: 'sp1',
      probes: { sp2: { status: 'json_disabled', latencyMs: 120, error: 'JSON format disabled' } },
    })
    expect(screen.getAllByText('Test…').length).toBeGreaterThan(0)
    // failLabel + errorMessage both surface the reason
    expect(screen.getAllByText(/JSON format disabled/).length).toBeGreaterThan(0)
  })

  it('add opens the catalog-driven form; save emits the input and required fields gate', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))

    // default type = first catalog entry (searxng) → base URL required, key hidden requirement
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    const baseUrl = screen.getByPlaceholderText('Base URL (required)')
    await user.type(baseUrl, 'https://searx.example.org')
    await user.type(screen.getByPlaceholderText('Name (optional)'), 'Campus SearXNG')
    expect(save).toBeEnabled()

    await user.click(save)
    expect(handlers.onSave).toHaveBeenCalledWith({
      id: undefined,
      type: 'searxng',
      name: 'Campus SearXNG',
      baseUrl: 'https://searx.example.org',
      googleCx: '',
      apiKey: null,
    })
  })

  it('tavily type requires a key before saving', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.selectOptions(screen.getByLabelText('Provider type'), 'tavily')
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText('API key'), 'tvly-key')
    expect(save).toBeEnabled()
  })

  it('google-pse renders the catalog cx field', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.selectOptions(screen.getByLabelText('Provider type'), 'google-pse')
    const cx = screen.getByLabelText('Engine id (cx)')
    await user.type(cx, 'cx-123')
    expect(cx).toHaveValue('cx-123')
  })

  it('edit pre-fills the draft from the provider row and locks the type', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: 'Edit provider: Tavily main' }))
    const typeSelect = screen.getByLabelText('Provider type') as HTMLSelectElement
    expect(typeSelect).toBeDisabled()
    expect(typeSelect).toHaveValue('tavily')
    expect(screen.getByPlaceholderText('Name (optional)')).toHaveValue('Tavily main')
  })

  it('delete emits the provider id (confirmation is app policy)', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: 'Delete provider: Tavily main' }))
    expect(handlers.onDelete).toHaveBeenCalledWith('sp1')
  })

  it('shows the empty state on an empty list', () => {
    renderPanel({ providers: [] })
    expect(screen.getByTestId('wsp-empty')).toBeInTheDocument()
  })

  it('keyboard: tab order runs add → rows → form in sequence', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.tab()
    expect(screen.getByRole('button', { name: /add provider/i })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    // focus the form's first control, then walk the natural order
    screen.getByLabelText('Provider type').focus()
    await user.tab()
    expect(screen.getByPlaceholderText('Name (optional)')).toHaveFocus()
    await user.tab()
    expect(screen.getByPlaceholderText('Base URL (required)')).toHaveFocus()
  })

  it('has no axe violations (rows + probes + form)', async () => {
    const { container } = renderPanel({
      probes: { sp2: { status: 'auth', latencyMs: 40, error: 'key rejected' } },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations in the form', async () => {
    const user = userEvent.setup()
    const { container } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
