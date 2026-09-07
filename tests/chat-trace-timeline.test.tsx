import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  ChatTraceTimeline,
  type ChatTraceTimelineEntry,
} from '../src/components/chat-trace-timeline'

const entries: ChatTraceTimelineEntry[] = [
  { kind: 'phase', label: 'searching the catalog', startMs: 0, durationMs: 1200 },
  { kind: 'tool', label: 'search_jobs', detail: '{"query": "nurse"}', startMs: 60, durationMs: 45 },
  { kind: 'phase', label: 'writing the reply', startMs: 1250, durationMs: 800 },
]

const trace = {
  model: 'gpt-5.6',
  latencyMs: 2000,
  inputTokens: 900,
  outputTokens: 210,
  thinking: 'I should search the catalog first.',
}

describe('ChatTraceTimeline', () => {
  it('shows the collapsed summary and expands on click', async () => {
    const user = userEvent.setup()
    render(<ChatTraceTimeline trace={trace} entries={entries} />)
    const toggle = screen.getByRole('button', { name: 'Show response trace' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveTextContent('2.0 s')
    expect(toggle).toHaveTextContent('1 tools')
    expect(toggle).toHaveTextContent('gpt-5.6')
    expect(screen.queryByText('Total 2.0 s')).not.toBeInTheDocument()
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Total 2.0 s')).toBeInTheDocument()
    expect(screen.getByText('210 tokens')).toBeInTheDocument()
  })

  it('sorts entries by startMs and renders proportional bars', () => {
    const shuffled = [entries[1]!, entries[2]!, entries[0]!]
    const { container } = render(
      <ChatTraceTimeline trace={trace} entries={shuffled} defaultOpen />,
    )
    const rows = Array.from(container.querySelectorAll('[data-kind]'))
    expect(rows).toHaveLength(3)
    expect(rows[0]!.getAttribute('data-kind')).toBe('phase')
    expect(rows[0]).toHaveTextContent('searching the catalog')
    expect(rows[1]).toHaveTextContent('search_jobs')
    const bar = rows[1]!.querySelector('.h-full') as HTMLElement
    expect(bar.style.width).toBe('2.25%')
  })

  it('shows tool argument detail as the row tooltip', () => {
    render(<ChatTraceTimeline trace={{ latencyMs: 2000 }} entries={entries} defaultOpen />)
    expect(screen.getByTitle('{"query": "nurse"}')).toBeInTheDocument()
  })

  it('reveals the reasoning disclosure', async () => {
    const user = userEvent.setup()
    render(<ChatTraceTimeline trace={trace} entries={entries} defaultOpen />)
    const toggle = screen.getByRole('button', { name: 'Reasoning' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(screen.getByText('I should search the catalog first.')).toBeInTheDocument()
  })

  it('omits the reasoning block and zero tokens without data', () => {
    render(
      <ChatTraceTimeline trace={{ latencyMs: 500 }} entries={[]} defaultOpen />,
    )
    expect(screen.queryByRole('button', { name: 'Reasoning' })).not.toBeInTheDocument()
    expect(screen.getByText('0 tokens')).toBeInTheDocument()
  })

  it('supports label overrides', () => {
    render(
      <ChatTraceTimeline
        trace={{ latencyMs: 500 }}
        entries={[]}
        defaultOpen
        labels={{ toggle: 'Spur anzeigen', total: 'Gesamt', tokens: 'Token', reasoning: 'Begründung', tools: 'Werkzeuge' }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Spur anzeigen' })).toBeInTheDocument()
    expect(screen.getByText('Gesamt 500 ms')).toBeInTheDocument()
    expect(screen.getByText('0 Token')).toBeInTheDocument()
    expect(screen.getByText(/0 Werkzeuge/)).toBeInTheDocument()
  })

  it('toggles from the keyboard', async () => {
    const user = userEvent.setup()
    render(<ChatTraceTimeline trace={trace} entries={entries} />)
    const toggle = screen.getByRole('button', { name: 'Show response trace' })
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('passes axe collapsed and expanded', async () => {
    const collapsed = render(<ChatTraceTimeline trace={trace} entries={entries} />)
    expect(await axe(collapsed.container)).toHaveNoViolations()
    collapsed.unmount()
    const expanded = render(
      <ChatTraceTimeline trace={trace} entries={entries} defaultOpen />,
    )
    expect(await axe(expanded.container)).toHaveNoViolations()
  })
})
