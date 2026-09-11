import {
  FlowTelemetryStrip,
  FlowTraceCard,
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
    { label: 'Applying fixes', note: '3 edits applied', at: '2026-09-11T09:00:05Z' },
    { label: 'Finalizing', note: 'final v3', at: '2026-09-11T09:00:08Z' },
  ],
  llmCalls: [
    {
      id: 'a1',
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
    {
      id: 'a2',
      task: 'cv_build_review',
      stage: 'cv_draft.review',
      status: 'ok',
      provider: 'openai_compatible',
      model: 'vision-large',
      promptVersion: 'v1',
      tokensIn: 3200,
      tokensOut: 700,
      latencyMs: 2100,
    },
  ],
  toolOps: [
    { label: 'Updating styling', ok: true, detail: 'design updated (private copy)' },
    { label: 'Rewriting text', ok: true, detail: 'summary.summary rewritten' },
    { label: 'Reordering sections', ok: false, detail: 'block_index 24 out of range' },
  ],
  outcome: 'completed',
  outcomeLabel: 'Completed',
}

const simulatedTrace: FlowTrace = {
  ...trace,
  simulated: true,
  outcome: 'cap',
  outcomeLabel: 'Stopped at cap',
}

export const CompletedRun = () => (
  <div style={{ maxWidth: 520 }}>
    <FlowTraceCard trace={trace} />
  </div>
)

export const SimulatedRun = () => (
  <div style={{ maxWidth: 520 }}>
    <FlowTraceCard trace={simulatedTrace} />
  </div>
)

export const TelemetryStrip = () => (
  <div style={{ maxWidth: 520 }}>
    <FlowTelemetryStrip calls={4} tokensIn={5400} tokensOut={1600} edits={2} />
  </div>
)

export const TelemetryStripSimulated = () => (
  <div style={{ maxWidth: 520 }}>
    <FlowTelemetryStrip calls={6} tokensIn={5400} tokensOut={1600} edits={0} simulated />
  </div>
)
