import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  WebSearchProvidersPanel,
  WebSearchProviderWizard,
  type WebSearchProviderCatalog,
  type WebSearchProviderView,
} from '../src/components/web-search-providers'

const CATALOG: WebSearchProviderCatalog = {
  order: ['searxng', 'tavily', 'exa', 'google-pse'],
  entries: {
    searxng: {
      label: 'SearXNG',
      requiresKey: false,
      keyUrl: null,
      baseUrl: null,
      baseUrlRequired: true,
      baseUrlHint: 'https://searx.example.org',
      notes: 'Self-hosted metasearch.',
      hosting: 'self-hosted',
    },
    tavily: {
      label: 'Tavily',
      requiresKey: true,
      keyUrl: 'https://app.tavily.com/app/api-key',
      baseUrl: 'https://api.tavily.com',
      baseUrlRequired: false,
      baseUrlHint: 'https://api.tavily.com',
      notes: null,
      hosting: 'cloud',
    },
    exa: {
      label: 'Exa',
      requiresKey: true,
      keyUrl: 'https://dashboard.exa.ai/api-keys',
      baseUrl: 'https://api.exa.ai',
      baseUrlRequired: false,
      baseUrlHint: 'https://api.exa.ai',
      notes: null,
      hosting: 'cloud',
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

function renderPanel(
  overrides: Partial<React.ComponentProps<typeof WebSearchProvidersPanel>> = {},
) {
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

async function openActions(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: `Actions for ${name}` }))
}

describe('WebSearchProvidersPanel (card list)', () => {
  it('renders provider cards with type, priority, disabled and key badges', () => {
    renderPanel()
    expect(screen.getByText('Web search providers')).toBeInTheDocument()
    expect(screen.getByTestId('wsp-row-sp1')).toBeInTheDocument()
    expect(screen.getByTestId('wsp-row-sp2')).toBeInTheDocument()
    expect(screen.getByText('Tavily main')).toBeInTheDocument()
    expect(screen.getAllByText('Tavily').length).toBeGreaterThan(0)
    expect(screen.getByText('priority 1')).toBeInTheDocument()
    expect(screen.getByText('priority 2')).toBeInTheDocument()
    expect(screen.getByText('disabled')).toBeInTheDocument()
    expect(screen.getByText('••••cret')).toBeInTheDocument()
    expect(screen.getByText('https://searx.example.org')).toBeInTheDocument()
    expect(screen.getAllByText('Not tested').length).toBeGreaterThan(0)
  })

  it('marks key-requiring providers without a stored key', () => {
    renderPanel({
      providers: [
        { id: 'sp3', name: 'Bare brave', type: 'tavily', enabled: true, keySet: false },
      ],
    })
    expect(screen.getByTestId('wsp-key-sp3')).toHaveTextContent('no key')
  })

  it('shows the testing state and the probe status line', () => {
    renderPanel({
      testingId: 'sp1',
      probes: { sp2: { status: 'json_disabled', latencyMs: 120, error: 'JSON format disabled' } },
    })
    expect(screen.getAllByText(/Test…/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/JSON format disabled/).length).toBeGreaterThan(0)
    expect(screen.getByText('failed')).toBeInTheDocument()
  })

  it('toggle emits the flipped enabled state from the actions menu', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Disable' }))
    expect(handlers.onToggle).toHaveBeenCalledWith('sp1', false)
    await openActions(user, 'Campus SearXNG')
    await user.click(screen.getByRole('menuitem', { name: 'Enable' }))
    expect(handlers.onToggle).toHaveBeenCalledWith('sp2', true)
  })

  it('move emits up/down; boundary moves are disabled menu items', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Tavily main')
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toHaveAttribute('aria-disabled', 'true')
    await user.click(screen.getByRole('menuitem', { name: 'Move down' }))
    expect(handlers.onMove).toHaveBeenCalledWith('sp1', 'down')
    await openActions(user, 'Campus SearXNG')
    await user.click(screen.getByRole('menuitem', { name: 'Move up' }))
    expect(handlers.onMove).toHaveBeenCalledWith('sp2', 'up')
  })

  it('test emits the provider id from the actions menu', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Test' }))
    expect(handlers.onTest).toHaveBeenCalledWith('sp1')
  })

  it('delete emits the provider id (confirmation is app policy)', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Delete provider' }))
    expect(handlers.onDelete).toHaveBeenCalledWith('sp1')
  })

  it('shows the empty state on an empty list', () => {
    renderPanel({ providers: [] })
    expect(screen.getByTestId('wsp-empty')).toBeInTheDocument()
  })

  it('has no axe violations (cards + probes)', async () => {
    const { container } = renderPanel({
      probes: { sp2: { status: 'auth', latencyMs: 40, error: 'key rejected' } },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('WebSearchProvidersPanel (add wizard)', () => {
  it('tiles step lists catalog types in order with key chips; select opens the form', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    const tiles = screen.getByRole('group', { name: 'Choose a search provider' })
    expect(within(tiles).getByRole('button', { name: /searxng/i })).toBeInTheDocument()
    expect(within(tiles).getByRole('button', { name: /tavily/i })).toBeInTheDocument()
    expect(within(tiles).getByRole('button', { name: /google programmable search/i })).toBeInTheDocument()
    expect(within(tiles).getAllByText('API key').length).toBeGreaterThan(0)
    expect(within(tiles).getByText('No API key')).toBeInTheDocument()
    expect(within(tiles).getAllByText('Cloud').length).toBeGreaterThan(0)
    expect(within(tiles).getByText('Self-hosted')).toBeInTheDocument()
    await user.click(within(tiles).getByRole('button', { name: /searxng/i }))
    expect(screen.getByRole('list', { name: 'Setup progress' })).toBeInTheDocument()
    expect(screen.getByText('Choose provider')).toBeInTheDocument()
    expect(screen.getByText('Configure')).toBeInTheDocument()
    expect(screen.getByText('SearXNG')).toBeInTheDocument()
  })

  it('tiles render brand marks where the catalog type has one and monograms otherwise', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    const tiles = screen.getByRole('group', { name: 'Choose a search provider' })
    const searxngTile = within(tiles).getByRole('button', { name: /searxng/i })
    expect(searxngTile.querySelector('svg')).not.toBeNull()
    const tavilyTile = within(tiles).getByRole('button', { name: /tavily/i })
    expect(tavilyTile.querySelector('svg')).not.toBeNull()
    const exaTile = within(tiles).getByRole('button', { name: /exa/i })
    expect(exaTile.querySelector('svg')).toBeNull()
  })

  it('cards render the brand mark for types with one', () => {
    renderPanel()
    const row = screen.getByTestId('wsp-row-sp2')
    expect(row.querySelector('svg')).not.toBeNull()
  })

  it('searxng: base URL gates save; save emits the create input', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /searxng/i }))
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    await user.type(screen.getByPlaceholderText('https://searx.example.org'), 'https://searx.example.org')
    expect(save).toBeEnabled()
    await user.click(save)
    expect(handlers.onSave).toHaveBeenCalledWith({
      type: 'searxng',
      name: '',
      baseUrl: 'https://searx.example.org',
      googleCx: '',
      apiKey: null,
      fields: {},
    })
  })

  it('cloud providers keep the main page to the key; name and endpoint override live under Advanced', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    const details = screen.getByText('Advanced').closest('details')
    expect(details).not.toBeNull()
    const keyInput = screen.getByLabelText('API key')
    const nameInput = screen.getByLabelText('Name')
    const baseUrlInput = screen.getByLabelText(/base url/i)
    expect(details?.contains(keyInput)).toBe(false)
    expect(details?.contains(nameInput)).toBe(true)
    expect(details?.contains(baseUrlInput)).toBe(true)
    expect(nameInput).toHaveValue('')
  })

  it('defaultName seeds the advanced name field per type', async () => {
    const user = userEvent.setup()
    render(
      <WebSearchProviderWizard
        catalog={CATALOG}
        defaultName={(type) => (type === 'tavily' ? 'Tavily 2' : null)}
        onSave={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    const details = screen.getByText('Advanced').closest('details')
    if (details) details.open = true
    expect(screen.getByLabelText('Name')).toHaveValue('Tavily 2')
  })

  it('tavily: a key is required before saving and rides the payload', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText('API key'), 'tvly-key')
    expect(save).toBeEnabled()
    await user.click(save)
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tavily', apiKey: 'tvly-key' }),
    )
  })

  it('google-pse renders the catalog cx field and gates on it', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /google programmable search/i }))
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText('API key'), 'g-key')
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText('Engine id (cx)'), 'cx-123')
    expect(save).toBeEnabled()
    await user.click(save)
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ googleCx: 'cx-123', fields: { google_cx: 'cx-123' } }),
    )
  })

  it('extra fields ride the form and the payload (app-declared tuning)', async () => {
    const user = userEvent.setup()
    const handlers = { onSave: vi.fn() }
    render(
      <WebSearchProviderWizard
        catalog={CATALOG}
        extraFields={[{ id: 'timeout_ms', label: 'Timeout (ms)', required: false, type: 'number', advanced: true }]}
        onSave={handlers.onSave}
      />,
    )
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    await user.type(screen.getByLabelText('API key'), 'tvly-key')
    screen.getByText('Advanced').click()
    await user.type(screen.getByLabelText('Timeout (ms)'), '4000')
    await user.click(screen.getByRole('button', { name: /save provider/i }))
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ fields: { timeout_ms: '4000' } }),
    )
  })

  it('back returns to the tiles, then out of the wizard', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('group', { name: 'Choose a search provider' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByTestId('wsp-row-sp1')).toBeInTheDocument()
  })

  it('seeds the form with the catalog base URL for optional-endpoint types', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    expect(screen.getByLabelText('Base URL (optional)')).toHaveValue('https://api.tavily.com')
  })

  it('has no axe violations on the tiles step', async () => {
    const user = userEvent.setup()
    const { container } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations on the form step', async () => {
    const user = userEvent.setup()
    const { container } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /tavily/i }))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('keyboard: tiles are buttons in the tab order', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.tab()
    const focused = screen.getByRole('group', { name: 'Choose a search provider' }).querySelector(':focus')
    expect(focused).toBeInstanceOf(HTMLElement)
  })
})

describe('WebSearchProvidersPanel (edit)', () => {
  it('edit pre-fills from the card; a blank key keeps the stored one', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    expect(screen.getByText('Edit provider')).toBeInTheDocument()
    const details = screen.getByText('Advanced').closest('details')
    if (details) details.open = true
    expect(screen.getByDisplayValue('Tavily main')).toBeInTheDocument()
    expect(screen.getByText('API key saved')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /save provider/i }))
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sp1', type: 'tavily', apiKey: null }),
    )
  })

  it('a new key value replaces the stored one', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    await user.type(screen.getByPlaceholderText('••••cret'), 'tvly-new')
    await user.click(screen.getByRole('button', { name: /save provider/i }))
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'tvly-new' }),
    )
  })

  it('cancel returns to the card list', async () => {
    const user = userEvent.setup()
    renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByTestId('wsp-row-sp1')).toBeInTheDocument()
  })

  it('has no axe violations in the edit form', async () => {
    const user = userEvent.setup()
    const { container } = renderPanel()
    await openActions(user, 'Tavily main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
