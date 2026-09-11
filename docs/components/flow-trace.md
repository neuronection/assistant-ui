# FlowTraceCard / FlowTelemetryStrip

The run-telemetry pair for multi-step flows (plan 65.4): `FlowTraceCard`
renders a finished or running run's trace — outcome + stage timeline, a
per-call LLM ledger table (task, stage, provider+model, tokens in/out,
latency, prompt version, status) and the applied/rejected ops list — and
`FlowTelemetryStrip` renders the compact live counters (`N call(s) ·
tokens in/out · edits`) the progress card polls. Purely presentational +
controlled (library ADR-006): the app maps its run ledger (e.g. career's
`GET /cv/{id}/runs`) onto the library-owned `FlowTrace` schema — **zero
app data joins** in the component. Mock-provider rows badge themselves as
`Simulated — no real spend`.

## import

```ts
import {
  FlowTraceCard,
  FlowTelemetryStrip,
  formatFlowLatency,
  type FlowTrace,
  type FlowTraceCall,
  type FlowTraceStage,
  type FlowTraceToolOp,
} from '@neuronection/assistant-ui/flow-trace'
```

## `FlowTrace` schema

| field | type | notes |
|---|---|---|
| `stages` | `FlowTraceStage[]` | ordered; each `{ label, note?, at? (ISO) }` |
| `llmCalls` | `FlowTraceCall[]` | each `{ id, task, label?, stage?, status?, provider?, model?, promptVersion?, tokensIn?, tokensOut?, latencyMs? }` |
| `toolOps` | `FlowTraceToolOp[]?` | each `{ label, ok, detail? }` — ✓/✗ marker rows |
| `outcome` | `string \| null` | canonical value, e.g. `completed` \| `cap` \| `failed` \| `cancelled` |
| `outcomeLabel` | `string \| null` | display label overriding `outcome` |
| `simulated` | `boolean?` | true while rows ride the mock provider |

## props (`FlowTraceCard`)

| prop | type | default | notes |
|---|---|---|---|
| `trace` | `FlowTrace` | — | the mapped run ledger |
| `labels` | `Partial<FlowTraceCardLabels>` | English defaults | `title`, `stages`, `calls`, `ops`, `outcome`, `simulated`, `tokens`, `latency`, `model`, `status`, `prompt`, `task` |
| `className` | `string` | — | merges onto the root |

## props (`FlowTelemetryStrip`)

| prop | type | default | notes |
|---|---|---|---|
| `calls` | `number \| null` | — | calls made so far |
| `tokensIn` / `tokensOut` | `number \| null` | — | tokens so far |
| `edits` | `number \| null` | — | applied ops so far |
| `simulated` | `boolean` | — | renders the simulated badge |
| `labels` | partial record | English defaults | `calls`, `tokensIn`, `tokensOut`, `edits`, `simulated` |
| `className` | `string` | — | merges onto the root |

## controlled contract

Both components render exactly what they receive; nothing fetches, stores
or localizes. The app owns the run data (endpoint/poll → schema mapping)
and re-renders as it updates. A card/strip without renderable data renders
nothing (null) so lists and live polling can mount them unconditionally.
Task keys (`task`), stage labels and op labels are visible-but-canonical;
apps pass `label`/`labels` to localize.

## minimal snippet

```tsx
<FlowTraceCard trace={{ stages, llmCalls, toolOps, outcome: 'completed' }} />
<FlowTelemetryStrip
  calls={trace.llmCalls.length}
  tokensIn={4400}
  tokensOut={1600}
  edits={2}
/>
```

## realistic snippet (career's runs list)

```tsx
{runs.map((run) => (
  <li key={run.job_id}>
    <button onClick={() => toggleRun(run.job_id)}>{run.status}</button>
    {openRun === run.job_id ? (
      <>
        <FlowTraceCard
          trace={{
            stages: run.stages.map((stage) => ({
              label: t(`cvBuilder.stage.${stage.node}`),
              note: stage.note,
              at: stage.at,
            })),
            llmCalls: run.llm_calls.map((call) => ({
              id: call.id,
              task: call.task,
              label: t(`ai.tasks.${call.task}`),
              stage: call.stage,
              status: call.status === 'ok' ? 'ok' : 'error',
              provider: call.provider,
              model: call.model,
              promptVersion: call.prompt_version,
              tokensIn: call.tokens_in,
              tokensOut: call.tokens_out,
              latencyMs: call.latency_ms,
            })),
            toolOps: run.iterations.flatMap((it) =>
              (it.ops ?? []).map((op) => ({
                label: t(`cvBuilder.op.${op.op}`),
                ok: op.ok,
                detail: op.detail,
              })),
            ),
            outcome: run.outcome,
            outcomeLabel: run.outcome ? t(`cvBuilder.outcome.${run.outcome}`) : null,
            simulated: run.llm_calls.every((call) => call.provider === 'mock'),
          }}
        />
        {run.live ? (
          <FlowTelemetryStrip
            calls={run.aggregate.calls}
            tokensIn={run.aggregate.tokens_in}
            tokensOut={run.aggregate.tokens_out}
            edits={run.applied_ops}
          />
        ) : null}
      </>
    ) : null}
  </li>
))}
```

## accessibility

See [accessibility.md](../accessibility.md). `data-as` hooks:
`flow-trace-card`, `flow-trace-outcome` / `flow-trace-outcome-badge`,
`flow-trace-simulated-badge`, `flow-trace-stages`, `flow-trace-calls`,
`flow-trace-ops`, `flow-trace-status`, `flow-trace-simulated`.

## related modules

- [`flow-status`](./flow-status.md) — the live per-step progress card.
- [`chat-trace-timeline`](./chat-trace-timeline.md) — the chat-turn
  trace (duration-proportional bars); flow-trace is the job-run ledger
  (stages + calls + ops), not a turn timeline.
- [`badge`](./badge.md) — apps may badge outcomes in list rows.
