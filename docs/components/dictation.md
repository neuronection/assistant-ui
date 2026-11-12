# Dictation (useDictation / DictationButton / DictationStrip / DictationUnavailable)

Speech-to-text dictation: the library owns the **recording state machine**
(MediaRecorder negotiation, timer, level metering, cancel, teardown) and the
**UI** (mic button + recording/transcribing/error strip); the app injects the
**transport** — one `transcribe(blob)` closure that calls its own gateway.
No fetching, keys or i18n engine inside the library (ADR-006).

`DictationUnavailable` is the sibling capability state: the app resolves
whether speech-to-text is assigned and renders either `DictationButton` or
`DictationUnavailable` with its own reason and optional settings action. The
library never fetches task assignments, routes, or decides availability;
`DictationButtonProps` is unchanged.

## import

```ts
import {
  useDictation,
  DictationButton,
  DictationStrip,
  DictationUnavailable,
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

## DictationUnavailable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | — (required) | Short reason shown first, e.g. *Dictation unavailable*. |
| `detail` | `string` | — | Optional explanation (the app's assignment/configuration state). |
| `action` | `{ label: string; onClick: () => void }` | — | Optional follow-up (e.g. open voice settings). Both fields are required; without a handler no control is rendered. |
| `className` | `string` | — | Merged onto the root. |

## controlled contract

Fully controlled: state comes from `useDictation`; both recording components
render exactly what the hook reports. The strip renders nothing while idle
and an `role="alert"` row while an error is set.

`DictationUnavailable` is fully presentational: `label`/`detail`/`action` are
the app's resolved capability state. It renders a `role="note"` row and a
native button only when an action handler exists — never a disabled or
handler-less control. The app decides between it and `DictationButton`; the
mic button is not overloaded with an `unavailable` status.

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

Capability gate (app resolves the assignment; unknown/loading keeps the mic):

```tsx
{hasSpeechToText === false ? (
  <DictationUnavailable
    label={t('dictation.unavailable')}
    detail={t('dictation.noModelAssigned')}
    action={{ label: t('dictation.openSettings'), onClick: openVoiceSettings }}
  />
) : (
  <DictationButton status={dictation.status} onStart={() => void dictation.start()} />
)}
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): labelled mic toggle with
`aria-pressed` while recording; strip is `role="status"` while recording /
transcribing and `role="alert"` for errors; Stop/Cancel/Dismiss are labelled
buttons. `DictationUnavailable` is a `role="note"` row with its reason as
text; the optional action is a native button reached by Tab and activated by
Enter/Space, and an action label without a handler is never rendered.

## related

[`RichTextEditor`](./rich-text-editor.md), [`FlowStatusCard`](./flow-status.md),
[`EmptyState`](./empty-state.md), [`SetupFirstRunCard`](./setup-first-run-card.md).
