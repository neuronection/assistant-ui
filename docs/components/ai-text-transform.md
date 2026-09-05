# useAiTextTransform

Streaming AI text-transform **state machine** (idle → running → done /
error / cancelled): delta coalescing, event subscription, optional status
polling and a hard timeout. The app injects the transport — start /
subscribe / cancel / poll closures over its own gateway. No fetching, keys
or i18n engine inside the library (ADR-006). Render progress with
[`FlowStatusCard`](./flow-status.md) (family-ai rule: never hand-rolled).

## import

```ts
import { useAiTextTransform } from '@neuronection/assistant-ui/ai-text-transform'
```

## options

| Option | Type | Description |
| --- | --- | --- |
| `transport` | `AiTextTransformTransport` | `start(): Promise<jobId>` · `subscribe(jobId, handlers) => unsubscribe` (`onDelta` / `onDone` / `onError`) · optional `cancel(jobId)` · optional `poll(jobId)` → `{ status, result?, error? }`. |
| `pollIntervalMs` | `number` | Poll fallback interval (only when `poll` provided). Default `800`. |
| `timeoutMs` | `number` | Hard timeout for a running job (only when `poll` provided). Default `90 000`. |
| `flushMs` | `number` | Delta coalescing window. Default `50`. |

## returns

`{ status: 'idle' | 'running' | 'done' | 'error' | 'cancelled', result, error, start, stop, reset }`

- `start()` begins a job; events after a terminal state are ignored (late
  WS deliveries can't overwrite a finished result).
- `stop()` unsubscribes, calls `cancel(jobId)` and reports `cancelled`.
- `reset()` returns to a clean `idle`.
- `start` / `stop` / `reset` are stable across renders.

## example (realistic)

```tsx
const transform = useAiTextTransform({
  transport: {
    start: async () => (await api.startEditorTransform(body)).job_id,
    subscribe: (jobId, handlers) =>
      ws.subscribe(`ai-editor:${jobId}`, mapFamilyEvents(handlers)),
    cancel: (jobId) => api.cancelEditorTransformJob(jobId),
    poll: (jobId) => api.getEditorTransformJob(jobId),
  },
})
```

## accessibility

Utility hook — no rendered ARIA contract of its own; render progress with
[`FlowStatusCard`](./flow-status.md#accessibility) and announce results in
your own UI.

## related

[`RichTextEditor`](./rich-text-editor.md), [`FlowStatusCard`](./flow-status.md),
[`DictationButton`](./dictation.md).
