import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  ProviderSetupTiles,
  ProviderSetupManualTile,
  type ProviderSetupTileData,
} from '../src/components/provider-setup-tiles/ProviderSetupTiles'

const presets: ProviderSetupTileData[] = [
  { key: 'openai', name: 'OpenAI' },
  { key: 'gemini', name: 'Google AI Studio' },
  { key: 'ollama', name: 'Ollama', local: true },
]

describe('ProviderSetupTiles', () => {
  it('renders preset tiles in the given order with local captions — never any "recommended"', () => {
    render(<ProviderSetupTiles presets={presets} onSelect={() => {}} />)
    const group = screen.getByRole('group', { name: /choose a provider/i })
    const names = within(group)
      .getAllByRole('button')
      .map((button) => button.textContent)
    // 'OOpenAI' = monogram fallback (openai mark gone upstream) + tile label
    expect(names).toEqual(['OOpenAI', 'Google AI Studio', 'OllamaLocal'])
    expect(screen.queryByText(/recommended/i)).not.toBeInTheDocument()
  })

  it('select reports the preset key on click and Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ProviderSetupTiles presets={presets} onSelect={onSelect} />)
    const openai = screen.getByRole('button', { name: 'OpenAI' })
    await user.click(openai)
    expect(onSelect).toHaveBeenCalledWith('openai')
    expect(openai).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('disabled tiles render inert with their reason', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ProviderSetupTiles
        presets={[
          ...presets,
          { key: 'anthropic', name: 'Anthropic', disabled: true, disabledReason: 'builder unwired' },
        ]}
        onSelect={onSelect}
      />,
    )
    const disabled = screen.getByRole('button', { name: /anthropic/i })
    expect(disabled).toBeDisabled()
    expect(screen.getByText('builder unwired')).toBeInTheDocument()
    await user.click(disabled)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('marks configured presets and the paste-suggested tile', () => {
    render(
      <ProviderSetupTiles
        presets={presets}
        configured={['openai']}
        suggestedKey="gemini"
        configuredLabel="Set up"
        onSelect={() => {}}
      />,
    )
    const openai = screen.getByRole('button', { name: /openai/i })
    expect(within(openai).getByText('Set up')).toBeInTheDocument()
    const gemini = screen.getByRole('button', { name: /google ai studio/i })
    expect(gemini).toHaveAttribute('data-suggested', 'true')
    expect(
      screen.getByText('Suggested for your pasted key'),
    ).toBeInTheDocument()
  })

  it('renders the manual tile appended by the app', async () => {
    const user = userEvent.setup()
    const onManual = vi.fn()
    render(
      <ProviderSetupTiles presets={presets} onSelect={() => {}}>
        <ProviderSetupManualTile onClick={onManual}>Manual setup</ProviderSetupManualTile>
      </ProviderSetupTiles>,
    )
    await user.click(screen.getByRole('button', { name: /manual setup/i }))
    expect(onManual).toHaveBeenCalledOnce()
  })

  it('renders per-tile capability chips in the given order, neutral (equal weight)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ProviderSetupTiles
        presets={[
          { key: 'openai', name: 'OpenAI', chips: [{ key: 'chat', label: 'Chat' }, { key: 'vision', label: 'Vision' }] },
          { key: 'openrouter', name: 'OpenRouter', chips: [{ key: 'chat', label: 'Chat' }, { key: 'decision', label: 'Decision' }] },
          { key: 'typesafe', name: 'TypeSafe', chips: [{ key: 'decision', label: 'Decision' }] },
          { key: 'ollama', name: 'Ollama', chips: [{ key: 'chat', label: 'Chat' }, { key: 'local', label: 'Local' }, { key: 'decision', label: 'Decision' }] },
        ]}
        onSelect={onSelect}
      />,
    )
    const typesafe = screen.getByRole('button', { name: /TypeSafe/i })
    const typesafeChips = within(typesafe).getAllByText('Decision')
    expect(typesafeChips).toHaveLength(1)
    const ollama = screen.getByRole('button', { name: /Ollama/i })
    for (const chip of ['Chat', 'Local', 'Decision']) {
      expect(within(ollama).getByText(chip)).toBeInTheDocument()
    }
    const chipsRow = within(ollama).getAllByText(/chat|local|decision/i)
    expect(chipsRow.map((node) => node.textContent)).toEqual(['Chat', 'Local', 'Decision'])
    // chips never rank (all neutral) and never block selection
    expect(ollama.querySelectorAll('[data-as-cap][data-active]')).toHaveLength(0)
    await user.click(ollama)
    expect(onSelect).toHaveBeenCalledWith('ollama')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ProviderSetupTiles
        presets={[
          ...presets,
          { key: 'typesafe', name: 'TypeSafe', chips: [{ key: 'decision', label: 'Decision' }] },
        ]}
        configured={['openai']}
        onSelect={() => {}}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
