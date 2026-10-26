import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  TranslationProvidersPanel,
  TranslationProviderWizard,
  type TranslationEngineCatalog,
  type TranslationProviderView,
} from '../src/components/translation-providers'

const CATALOG: TranslationEngineCatalog = {
  order: ['libretranslate', 'deepl'],
  entries: {
    libretranslate: {
      label: 'LibreTranslate',
      requiresKey: false,
      optionalKey: true,
      keyUrl: null,
      baseUrlRequired: true,
      baseUrl: null,
      baseUrlHint: 'https://libretranslate.local',
      notes: 'Self-hosted translation server.',
      hosting: 'self-hosted',
    },
    deepl: {
      label: 'DeepL',
      requiresKey: true,
      optionalKey: false,
      keyUrl: 'https://www.deepl.com/pro-api',
      baseUrlRequired: false,
      baseUrl: null,
      baseUrlHint: 'https://api-free.deepl.com',
      notes: 'Free keys ending in “:fx” route to the free API automatically.',
      hosting: 'cloud',
    },
  },
}

const PROVIDERS: TranslationProviderView[] = [
  {
    id: 'tp1',
    name: 'Campus LibreTranslate',
    type: 'libretranslate',
    enabled: true,
    apiBase: 'https://libretranslate.local',
    keySet: false,
  },
  {
    id: 'tp2',
    name: 'DeepL main',
    type: 'deepl',
    enabled: false,
    apiBase: null,
    keyHint: '••••ab',
    keySet: true,
  },
]

function renderPanel(
  overrides: Partial<React.ComponentProps<typeof TranslationProvidersPanel>> = {},
) {
  const handlers = {
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    onToggle: vi.fn(),
    onTest: vi.fn(),
  }
  const utils = render(
    <TranslationProvidersPanel providers={PROVIDERS} catalog={CATALOG} {...handlers} {...overrides} />,
  )
  return { ...utils, handlers }
}

async function openActions(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: `Actions for ${name}` }))
}

describe('TranslationProvidersPanel (card list)', () => {
  it('renders provider cards with engine, priority, disabled and key badges', () => {
    renderPanel()
    expect(screen.getByText('Translation providers')).toBeInTheDocument()
    expect(screen.getByTestId('tlp-row-tp1')).toBeInTheDocument()
    expect(screen.getByText('priority 1')).toBeInTheDocument()
    expect(screen.getByText('priority 2')).toBeInTheDocument()
    expect(screen.getByText('disabled')).toBeInTheDocument()
    expect(screen.getByText('••••ab')).toBeInTheDocument()
    expect(screen.getByText('https://libretranslate.local')).toBeInTheDocument()
  })

  it('toggle emits the flipped enabled state from the actions menu', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'DeepL main')
    await user.click(screen.getByRole('menuitem', { name: 'Enable' }))
    expect(handlers.onToggle).toHaveBeenCalledWith('tp2', true)
  })

  it('move emits up/down; boundary moves are disabled menu items', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'Campus LibreTranslate')
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toHaveAttribute('aria-disabled', 'true')
    await user.click(screen.getByRole('menuitem', { name: 'Move down' }))
    expect(handlers.onMove).toHaveBeenCalledWith('tp1', 'down')
  })

  it('test emits the provider id from the actions menu', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'DeepL main')
    await user.click(screen.getByRole('menuitem', { name: 'Test' }))
    expect(handlers.onTest).toHaveBeenCalledWith('tp2')
  })

  it('shows the probe line with the translated sample', () => {
    renderPanel({
      testingId: 'tp1',
      probes: { tp2: { status: 'ok', latencyMs: 120, detail: 'Hola' } },
    })
    expect(screen.getAllByText(/Hola/).length).toBeGreaterThan(0)
    expect(screen.getByTestId('tlp-row-tp2').textContent).toContain('ok · Hola')
  })

  it('delete emits the provider id (confirmation is app policy)', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'DeepL main')
    await user.click(screen.getByRole('menuitem', { name: 'Delete provider' }))
    expect(handlers.onDelete).toHaveBeenCalledWith('tp2')
  })

  it('shows the empty state on an empty list', () => {
    renderPanel({ providers: [] })
    expect(screen.getByTestId('tlp-empty')).toBeInTheDocument()
  })

  it('has no axe violations (cards + probes)', async () => {
    const { container } = renderPanel({
      probes: { tp2: { status: 'error', error: 'key rejected' } },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('TranslationProvidersPanel (add wizard)', () => {
  it('tiles list engines with key + hosting chips; select opens the form', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    const tiles = screen.getByRole('group', { name: 'Choose a translation engine' })
    expect(within(tiles).getByRole('button', { name: /libretranslate/i })).toBeInTheDocument()
    expect(within(tiles).getByRole('button', { name: /deepl/i })).toBeInTheDocument()
    expect(within(tiles).getByText('No API key')).toBeInTheDocument()
    expect(within(tiles).getAllByText('Cloud').length).toBeGreaterThan(0)
    expect(within(tiles).getByText('Self-hosted')).toBeInTheDocument()
    await user.click(within(tiles).getByRole('button', { name: /libretranslate/i }))
    expect(screen.getByRole('list', { name: 'Setup progress' })).toBeInTheDocument()
  })

  it('libretranslate: base URL gates save; key stays optional', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /libretranslate/i }))
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    await user.type(screen.getByPlaceholderText('https://libretranslate.local'), 'https://lt.local')
    expect(save).toBeEnabled()
    await user.click(save)
    expect(handlers.onSave).toHaveBeenCalledWith({
      type: 'libretranslate',
      name: '',
      apiBase: 'https://lt.local',
      apiKey: null,
      fields: {},
    })
  })

  it('deepl: the key gates save and the endpoint override lives under Advanced', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /deepl/i }))
    const details = screen.getByText('Advanced').closest('details')
    expect(details).not.toBeNull()
    const keyInput = screen.getByLabelText('API key')
    const nameInput = screen.getByLabelText('Name')
    const apiBaseInput = screen.getByLabelText(/base url/i)
    expect(details?.contains(keyInput)).toBe(false)
    expect(details?.contains(nameInput)).toBe(true)
    expect(details?.contains(apiBaseInput)).toBe(true)
    const save = screen.getByRole('button', { name: /save provider/i })
    expect(save).toBeDisabled()
    await user.type(keyInput, 'dl-key:fx')
    expect(save).toBeEnabled()
    await user.click(save)
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'deepl', apiKey: 'dl-key:fx' }),
    )
  })

  it('defaultName seeds the advanced name field per engine', async () => {
    const user = userEvent.setup()
    render(
      <TranslationProviderWizard
        catalog={CATALOG}
        defaultName={(type) => (type === 'deepl' ? 'DeepL 2' : null)}
        onSave={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /deepl/i }))
    const details = screen.getByText('Advanced').closest('details')
    if (details) details.open = true
    expect(screen.getByLabelText('Name')).toHaveValue('DeepL 2')
  })

  it('back returns to the tiles, then out of the wizard', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /add provider/i }))
    await user.click(screen.getByRole('button', { name: /deepl/i }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('group', { name: 'Choose a translation engine' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByTestId('tlp-row-tp1')).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: /deepl/i }))
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('TranslationProvidersPanel (edit)', () => {
  it('edit pre-fills from the card; a blank key keeps the stored one', async () => {
    const user = userEvent.setup()
    const { handlers } = renderPanel()
    await openActions(user, 'DeepL main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    expect(screen.getByText('Edit provider')).toBeInTheDocument()
    const details = screen.getByText('Advanced').closest('details')
    if (details) details.open = true
    expect(screen.getByDisplayValue('DeepL main')).toBeInTheDocument()
    expect(screen.getByText('API key saved')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /save provider/i }))
    expect(handlers.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tp2', type: 'deepl', apiKey: null }),
    )
  })

  it('cancel returns to the card list', async () => {
    const user = userEvent.setup()
    renderPanel()
    await openActions(user, 'DeepL main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByTestId('tlp-row-tp1')).toBeInTheDocument()
  })

  it('has no axe violations in the edit form', async () => {
    const user = userEvent.setup()
    const { container } = renderPanel()
    await openActions(user, 'DeepL main')
    await user.click(screen.getByRole('menuitem', { name: 'Edit provider' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
