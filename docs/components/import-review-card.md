# ImportReviewCard

Review-first import surface: a file picker, a mapped/dropped/warnings/conflicts
report, and one explicit **Apply import** action. It is presentational — the app
reads and parses the file and owns the API; the card only renders the preview and
emits `onFileSelected` / `onApply`.

## import

```ts
import {
  ImportReviewCard,
  type ImportReviewReport,
} from '@neuronection/assistant-ui/import-review-card'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `title` | `string` | — | card heading |
| `description` | `string` | — | optional supporting copy |
| `accept` | `string` | — | file input accept list |
| `fileName` | `string \| null` | — | app-owned selected filename |
| `status` | `'idle' \| 'loading' \| 'preview' \| 'applied' \| 'error'` | `'idle'` | drives the icon/apply visibility |
| `report` | `ImportReviewReport \| null` | — | groups, dropped, warnings, conflicts, applied, created |
| `error` | `string \| null` | — | `role="alert"` error text |
| `busy` | `boolean` | `false` | disables choose/apply and spins the apply icon |
| `canApply` | `boolean` | `true` | app gate (e.g. all conflicts resolved) |
| `labels` | `Partial<ImportReviewLabels>` | English defaults | choose/apply/applied/drop/warnings/conflicts/mapped/created/hint |
| `onFileSelected` | `(file: File) => void` | — | selection only; parsing is app-side |
| `onApply` | `() => void` | — | explicit write boundary |
| `onReset` | `() => void` | — | optional "choose another" action |

## controlled contract

Everything is controlled: `status`, `report`, `busy`, `canApply`. The card never
reads the file, calls an API, or writes anything. `onFileSelected` fires once per
pick; `onApply` is shown only in `preview` and is disabled while `busy` or
`canApply={false}`.

The report is an **invariant subset**, not a fixed schema: `groups` is any
labelled counts; `dropped`/`warnings` are strings; `conflicts` name the existing
and incoming values. Unknown fields must be named in `dropped` — never silently
discarded.

## labels & i18n

All visible strings are props with English defaults (`choose`, `apply`, `applied`,
`drop`, `warnings`, `conflicts`, `mapped`, `created`, `invalidFile`, `fileHint`).
Apps translate at the call site; no i18n engine is bundled.

## examples

minimal:

```tsx
<ImportReviewCard
  title="JSON Resume"
  accept="application/json,.json"
  onFileSelected={(file) => void preview(file)}
/>
```

realistic (preview then explicit apply):

```tsx
<ImportReviewCard
  title={t('jsonResume.title')}
  description={t('jsonResume.intro')}
  accept="application/json,.json"
  fileName={file?.name}
  status={busy ? 'loading' : report ? 'preview' : 'idle'}
  report={report}
  busy={busy}
  labels={{ choose: t('jsonResume.choose'), apply: t('jsonResume.apply') }}
  onFileSelected={(file) => void preview(file)}
  onApply={() => void apply()}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#importreviewcard): the choose control
is a real button (Enter/Space), the file input is hidden from AT, the report is
read in document order, errors use `role="alert"`, and Apply is disabled while
busy.

## related

[`UploadDropzone`](./upload-dropzone.md), [`FileCard`](./file-card.md),
[`Button`](./button.md).
