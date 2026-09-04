# FlowStatusCard

Renders a running/finished/failed/interrupted multi-step AI flow from the
family event vocabulary (guidelines §5: `flow_started` / `node_started` /
`node_finished` / `flow_finished` / `flow_failed` / `interrupt`). Purely
presentational + controlled (library ADR-006): the app maps transport events
to props; the card never sees SSE/WS. Used for button-triggered flows and
flows invoked from chat.

## import

```ts
import {
  FlowStatusCard,
  type FlowError,
  type FlowStep,
  type FlowStepStatus,
} from '@neuronection/assistant-ui/flow-status'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `title` | `string` | — | flow name, e.g. "Analyzing document" |
| `steps` | `FlowStep[]` | — | ordered; one per graph node (`{ id, label, status }`) |
| `status` | `FlowStepStatus` | — | overall run status: `'pending' \| 'running' \| 'done' \| 'failed' \| 'interrupted'` |
| `error` | `FlowError` | — | set when `status === 'failed'` (`{ code, message, retryable }`) |
| `onRetry` | `() => void` | — | rendered only when `error?.retryable` |
| `onCancel` | `() => void` | — | rendered while `status === 'running'` |
| `onResume` | `() => void` | — | rendered when `status === 'interrupted'` |
| `detail` | `ReactNode` | — | payload slot: HITL card, references, extra info |
| `labels` | `Partial<Record<'retry' \| 'cancel' \| 'resume', string>>` | — | action label overrides |
| `className` | `string` | — | merges onto the root |

## controlled contract

All state is in: the card renders whatever `steps` × `status` × `error`
describe and reports intent through the three callbacks. The app owns the
event stream (SSE/WS → props mapping) and flips the props as events arrive;
`node_started`/`node_finished` become per-step `status` updates, the running
step is emphasized and marked `aria-current="step"`. A header summary line
(`role="status"`) shows language-neutral progress (`2/4`) and, while
running, the current node's label. Action visibility is derived, never
stored: *Cancel* only while running, *Resume* only when interrupted,
*Retry* only on a retryable failure. The root carries
`data-status="<status>"` for token-safe overrides; each step `<li>` carries
`data-status="<step-status>"` and the failure block carries
`data-as="flow-status-card-error"` as stable styling hooks.

## labels & i18n

All strings are props with English defaults (`Retry` / `Cancel` / `Resume`);
step labels, title and the error message arrive in `steps`/`title`/`error`
and are translated at the call site before they are passed in. The progress
summary is numeric only (`2/4`), so it needs no translation.

## examples

minimal (a running document analysis):

```tsx
<FlowStatusCard
  title="Analyzing document"
  steps={[
    { id: 'parse', label: 'Parsing document', status: 'done' },
    { id: 'skills', label: 'Extracting skills', status: 'running' },
    { id: 'match', label: 'Matching roles', status: 'pending' },
  ]}
  status="running"
  onCancel={cancelRun}
/>
```

realistic — interrupted flow with an app-composed HITL detail card:

```tsx
<FlowStatusCard
  title="Update job history"
  steps={[
    { id: 'collect', label: 'Collecting changes', status: 'done' },
    { id: 'confirm', label: 'Waiting for your confirmation', status: 'interrupted' },
    { id: 'apply', label: 'Applying updates', status: 'pending' },
  ]}
  status="interrupted"
  onResume={() => resumeRun(threadId)}
  detail={<HitlCard payload={interrupt} onApprove={approve} onReject={reject} />}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#ai-patterns): steps render as an
`<ol>`; the running step is `aria-current="step"`; the summary is a
`role="status"` live region; the failure block is `role="alert"`; action
buttons are native buttons reached in DOM order with Enter activation
(asserted in `tests/flow-status.test.tsx`).

## related

[`ErrorBanner`](./error-banner.md), [`Spinner`](./spinner.md),
[`ConnectionTestRow`](./connection-test-row.md) — status/feedback
primitives the card composes or pairs with.
