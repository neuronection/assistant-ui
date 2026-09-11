import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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

describe('ChatTraceTimeline tool observability', () => {
  const observableEntries: ChatTraceTimelineEntry[] = [
    { kind: 'phase', label: 'thinking', startMs: 0, durationMs: 500 },
    {
      kind: 'tool',
      label: 'notify',
      detail: '{"message": "ping"}',
      args: '{\n  "message": "ping"\n}',
      response: 'Notification sent.',
      status: 'ok',
      startMs: 500,
      durationMs: 45,
    },
    {
      kind: 'tool',
      label: 'failing_tool',
      status: 'error',
      response: 'Permission denied.',
      startMs: 600,
      durationMs: 12,
    },
  ]

  it('renders status dots with an accessible title', () => {
    render(
      <ChatTraceTimeline trace={{ latencyMs: 600 }} entries={observableEntries} defaultOpen />,
    )
    expect(screen.getByTitle('ok')).toBeInTheDocument()
    expect(screen.getByTitle('error')).toBeInTheDocument()
  })

  it('expands arguments and response blocks from the row disclosure', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ChatTraceTimeline trace={{ latencyMs: 600 }} entries={observableEntries} defaultOpen />,
    )
    const chevrons = container.querySelectorAll('[data-as="chat-trace-detail-toggle"]')
    expect(chevrons.length).toBe(2)
    expect(screen.queryByText('Arguments')).not.toBeInTheDocument()

    await user.click(screen.getByText('notify'))
    const regions = container.querySelectorAll('[data-as="chat-trace-detail"]')
    expect(regions).toHaveLength(1)
    expect(regions[0]!).toHaveAttribute('data-open', 'true')
    expect(within(regions[0] as HTMLElement).getByText('Arguments')).toBeInTheDocument()
    expect(within(regions[0] as HTMLElement).getByText('message')).toBeInTheDocument()
    expect(within(regions[0] as HTMLElement).getByText('ping')).toBeInTheDocument()
    expect(within(regions[0] as HTMLElement).getByText('Response')).toBeInTheDocument()
    expect(within(regions[0] as HTMLElement).getByText('Notification sent.')).toBeInTheDocument()
    expect(regions[0]!.textContent).not.toContain('"message"')

    await user.click(chevrons[1] as Element)
    expect(container.querySelectorAll('[data-as="chat-trace-detail"]')).toHaveLength(2)
    expect(container.textContent).toContain('Permission denied.')
  })

  it('renders array responses as value chips in the detail block', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ChatTraceTimeline
        trace={{ latencyMs: 600 }}
        entries={[
          {
            kind: 'tool',
            label: 'search_jobs',
            startMs: 0,
            durationMs: 5,
            args: '{"query": "hi"}',
            response: '["ml-engineer", "game-developer", "graphic-designer"]',
          },
        ]}
        defaultOpen
      />,
    )
    await user.click(screen.getByText('search_jobs'))
    const region = container.querySelector('[data-as="chat-trace-detail"]') as HTMLElement
    expect(region).not.toBeNull()
    expect(within(region).getByText('ml-engineer')).toBeInTheDocument()
    expect(within(region).getByText('game-developer')).toBeInTheDocument()
    expect(within(region).getByText('graphic-designer')).toBeInTheDocument()
    expect(within(region).getByText('query')).toBeInTheDocument()
    expect(within(region).getByText('hi')).toBeInTheDocument()
    expect(region.querySelector('pre')).toBeNull()
  })

  it('tool-row labels are not cropped by the duration bar (wide label column)', () => {
    render(
      <ChatTraceTimeline trace={{ latencyMs: 2000 }} entries={entries} defaultOpen />,
    )
    const label = screen.getByText('search_jobs')
    expect(label.className).toContain('w-24')
    expect(label.getAttribute('title')).not.toBeNull()
  })

  it('rows without observability data keep the spacer layout', () => {
    const { container } = render(
      <ChatTraceTimeline trace={{ latencyMs: 2000 }} entries={entries} defaultOpen />,
    )
    expect(screen.queryByText('Arguments')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-as="chat-trace-status"]')).toHaveLength(0)
    expect(container.querySelectorAll('[data-as="chat-trace-detail-toggle"]')).toHaveLength(0)
  })

  it('stays axe-clean with observability data', async () => {
    const { axe } = await import('jest-axe')
    const { container } = render(
      <ChatTraceTimeline trace={{ latencyMs: 600 }} entries={observableEntries} defaultOpen />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
