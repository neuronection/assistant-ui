# Dictation (useDictation / DictationButton / DictationStrip)

Speech-to-text dictation: the library owns the **recording state machine**
(MediaRecorder negotiation, timer, level metering, cancel, teardown) and the
**UI** (mic button + recording/transcribing/error strip); the app injects the
**transport** — one `transcribe(blob)` closure that calls its own gateway.
No fetching, keys or i18n engine inside the library (ADR-006).

## import

```ts
import {
  useDictation,
  DictationButton,
  DictationStrip,
} from '@neuronection/assistant-ui/dictation'
```

## useDictation options

| Option | Type | Description |
| --- | --- | --- |
| `transcribe` | `(audio: Blob) => Promise<{ text: string }>` | App-owned transport (required). Reject to fail. |
| `classifyError` | `(error: unknown) => DictationError` | Map transport failures to `unsupported / denied / unassigned / failed` (e.g. a 409 → `unassigned`). Default: `failed` with the error message. |
| `onResult` | `(text: string) => void` | Called with the transcript on success. |

Returns `{ status: 'idle' | 'recording' | 'transcribing', seconds, error, levelRef, start, stop, cancel, dismissError }`.
`levelRef` feeds `DictationStrip`'s level meter (a ref, so the meter animates
without re-renders). Unmount while recording tears the stream down.

## DictationButton props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `status` | `DictationStatus` | — (required) | Drives pressed/disabled/pulse states. |
| `onStart` | `() => void` | — (required) | Typically `() => void dictation.start()`. |
| `label` | `string` | `'Dictate'` | Accessible name + tooltip. |
| `recordingLabel` | `string` | = `label` | Visually hidden text while recording. |
| `className` | `string` | — | Merged onto the button. |

## DictationStrip props

| Prop | Type | Description |
| --- | --- | --- |
| `status`, `seconds`, `levelRef`, `error` | — | From `useDictation`. |
| `labels` | `Partial<DictationStripLabels>` | English defaults: `recording` (*Recording…*), `transcribing` (*Transcribing…*), `stop` (*Stop*), `cancel` (*Cancel*), `dismissError` (*Dismiss*), `unsupported`, `denied`, `unassigned`, `failed` (`{detail}` interpolated). |
| `onStop`, `onCancel`, `onDismissError` | `() => void` | Strip actions (only rendered when relevant). |
| `className` | `string` | Merged onto the root. |

## controlled contract

Fully controlled: state comes from `useDictation`; both components render
exactly what the hook reports. The strip renders nothing while idle and an
`role="alert"` row while an error is set.

## label/i18n contract

All strings are props with English defaults; apps translate at call sites.

## example (realistic)

```tsx
const dictation = useDictation({
  transcribe: (blob) => api.transcribe(blob), // app gateway call
  classifyError: (error) =>
    error instanceof ApiError && error.status === 409
      ? { kind: 'unassigned' }
      : { kind: 'failed', detail: String(error) },
  onResult: (text) => insertAtCursor(text),
})
<DictationButton status={dictation.status} onStart={() => void dictation.start()} />
<DictationStrip … onStop={() => void dictation.stop()} />
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): labelled mic toggle with
`aria-pressed` while recording; strip is `role="status"` while recording /
transcribing and `role="alert"` for errors; Stop/Cancel/Dismiss are labelled
buttons.

## related

[`RichTextEditor`](./rich-text-editor.md), [`FlowStatusCard`](./flow-status.md).
