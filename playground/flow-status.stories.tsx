import {
  FlowStatusCard,
  type FlowStep,
} from '../src/components/flow-status/FlowStatusCard'

const runningSteps: FlowStep[] = [
  { id: 'parse', label: 'Parsing document', status: 'done' },
  { id: 'skills', label: 'Extracting skills', status: 'running' },
  { id: 'match', label: 'Matching roles', status: 'pending' },
  { id: 'report', label: 'Writing report', status: 'pending' },
]

export const Running = () => (
  <div style={{ maxWidth: 420 }}>
    <FlowStatusCard
      title="Analyzing document"
      steps={runningSteps}
      status="running"
      onCancel={() => {}}
    />
  </div>
)

export const Done = () => (
  <div style={{ maxWidth: 420 }}>
    <FlowStatusCard
      title="Analyzing document"
      steps={runningSteps.map((step) => ({ ...step, status: 'done' as const }))}
      status="done"
    />
  </div>
)

export const FailedRetryable = () => (
  <div style={{ maxWidth: 420 }}>
    <FlowStatusCard
      title="Analyzing document"
      steps={[
        { id: 'parse', label: 'Parsing document', status: 'done' },
        { id: 'skills', label: 'Extracting skills', status: 'failed' },
        { id: 'match', label: 'Matching roles', status: 'pending' },
      ]}
      status="failed"
      error={{
        code: 'provider_timeout',
        message: 'The model did not answer within 30 s. You can retry the run.',
        retryable: true,
      }}
      onRetry={() => {}}
    />
  </div>
)

export const InterruptedResume = () => (
  <div style={{ maxWidth: 420 }}>
    <FlowStatusCard
      title="Update job history"
      steps={[
        { id: 'collect', label: 'Collecting changes', status: 'done' },
        { id: 'confirm', label: 'Waiting for your confirmation', status: 'interrupted' },
        { id: 'apply', label: 'Applying updates', status: 'pending' },
      ]}
      status="interrupted"
      onResume={() => {}}
      detail={
        <div
          style={{
            border: '1px solid var(--as-border)',
            borderRadius: 'var(--as-radius)',
            padding: 12,
            fontSize: 13,
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Proposed change</p>
          <p style={{ color: 'var(--as-muted-fg)' }}>
            Add “Frontend Engineer, Nova Labs (2024–now)” to your work history.
          </p>
        </div>
      }
    />
  </div>
)
