import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import {
  FlowTelemetryStrip,
  FlowTraceCard,
  formatFlowLatency,
  type FlowTrace,
} from '../src/components/flow-trace/FlowTraceCard'

const trace: FlowTrace = {
  stages: [
    { label: 'Reading the draft', at: '2026-09-11T09:00:00Z' },
    {
      label: 'Reviewing',
      note: 'reviewing the draft (1/3)',
      at: '2026-09-11T09:00:02Z',
    },
  ],
  llmCalls: [
    {
      id: 'a1',
      task: 'cv_build_review',
      stage: 'cv_draft.review',
      status: 'ok',
      provider: 'mock',
      model: 'mock-vision',
      promptVersion: 'v1',
      tokensIn: 1200,
      tokensOut: 300,
      latencyMs: 850,
    },
    {
      id: 'a2',
      task: 'cv_draft',
      stage: 'cv_draft.plan',
      status: 'ok',
      provider: 'openai_compatible',
      model: 'gpt-5.6',
      promptVersion: 'v1',
      tokensIn: 2200,
      tokensOut: 900,
      latencyMs: 1500,
    },
  ],
  toolOps: [
    { label: 'Updating styling', ok: true, detail: 'design updated' },
    { label: 'Rewriting text', ok: false, detail: 'reverted' },
  ],
  outcome: 'completed',
  outcomeLabel: 'Completed',
}

describe('FlowTraceCard', () => {
  it('renders the call table with every row and the mock badge', () => {
    render(<FlowTraceCard trace={trace} />)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(screen.getByText('cv_build_review')).toBeInTheDocument()
    expect(screen.getByText('gpt-5.6')).toBeInTheDocument()
    expect(screen.getAllByText('mock').length).toBeGreaterThan(0)
    expect(screen.getByText('1200/300')).toBeInTheDocument()
    expect(screen.getByText('2200/900')).toBeInTheDocument()
    expect(screen.getByText('850 ms')).toBeInTheDocument()
    expect(screen.getByText('1.5 s')).toBeInTheDocument()
    expect(screen.getAllByText('v1').length).toBe(2)
  })

  it('renders every stage with its note and time', () => {
    render(<FlowTraceCard trace={trace} />)
    expect(screen.getAllByText('Reading the draft').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reviewing').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('reviewing the draft (1/3)').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByRole('listitem')).toHaveLength(
      trace.stages.length + trace.toolOps!.length,
    )
  })

  it('renders the ops ledger with ok/rejected markers and detail tooltips', () => {
    render(<FlowTraceCard trace={trace} />)
    expect(screen.getAllByText('Updating styling').length).toBeGreaterThan(0)
    expect(screen.getByText('Rewriting text')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByText('✗')).toBeInTheDocument()
    expect(screen.getByTitle('design updated')).toBeInTheDocument()
  })

  it('renders the outcome and the simulated badge for mock-provider runs', () => {
    render(<FlowTraceCard trace={{ ...trace, simulated: true }} />)
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(screen.getByTitle('Simulated')).toBeInTheDocument()
  })

  it('labels override every English default', () => {
    render(
      <FlowTraceCard
        trace={{ stages: [], llmCalls: trace.llmCalls }}
        labels={{
          title: 'Run-Ablauf',
          calls: 'Aufrufe',
          simulated: 'Simuliert',
        }}
      />,
    )
    expect(screen.getByText('Run-Ablauf')).toBeInTheDocument()
    expect(screen.getByText('Aufrufe')).toBeInTheDocument()
  })

  it('renders nothing without data', () => {
    const { container } = render(
      <FlowTraceCard trace={{ stages: [], llmCalls: [] }} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('passes axe; the card is informational (no interactive widgets)', async () => {
    const { container } = render(
      <FlowTraceCard trace={{ ...trace, simulated: true }} />,
    )
    expect(await axe(container)).toHaveNoViolations()
    expect(container.querySelector('button')).toBeNull()
  })
})

describe('FlowTelemetryStrip', () => {
  it('renders the compact counters in order', () => {
    render(
      <FlowTelemetryStrip calls={4} tokensIn={1200} tokensOut={300} edits={2} />,
    )
    expect(screen.getByText('4 call(s)')).toBeInTheDocument()
    expect(screen.getByText('1200 tokens in')).toBeInTheDocument()
    expect(screen.getByText('300 tokens out')).toBeInTheDocument()
    expect(screen.getByText('2 edits')).toBeInTheDocument()
  })

  it('stays honest for mock-provider runs: the simulated badge is visible', () => {
    render(<FlowTelemetryStrip calls={1} tokensIn={0} tokensOut={0} simulated />)
    expect(screen.getByTitle('Simulated — no real spend')).toBeInTheDocument()
    expect(screen.getAllByText('Simulated').length).toBeGreaterThan(0)
  })

  it('renders nothing without data or the badge', () => {
    const { container } = render(<FlowTelemetryStrip />)
    expect(container).toBeEmptyDOMElement()
  })

  it('passes axe', async () => {
    const { container } = render(
      <FlowTelemetryStrip calls={2} tokensIn={5} tokensOut={2} edits={1} simulated />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('formatFlowLatency', () => {
  it('formats ms and seconds, and dashes null values', () => {
    expect(formatFlowLatency(320)).toBe('320 ms')
    expect(formatFlowLatency(1500)).toBe('1.5 s')
    expect(formatFlowLatency(null)).toBe('—')
  })
})
