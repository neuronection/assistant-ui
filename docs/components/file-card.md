# FileCard

One attachment: thumbnail/file glyph, name, size, status line
(queued/processing/done/failed), optional include-checkbox and remove
button, optional drag handle wiring. `formatBytes` is exported for app-side
summaries.

## import

```ts
import { FileCard, formatBytes, type FileCardStatus } from '@neuronection/assistant-ui/file-card'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `name` | `string` | — | file name (truncated, `title` tooltip) |
| `sizeBytes` | `number` | — | humanized via `formatBytes` |
| `status` | `'queued' \| 'processing' \| 'done' \| 'failed'` | `'queued'` | drives the status line |
| `error` | `string \| null` | — | shown in the failed state |
| `thumbnailUrl` | `string \| null` | — | app owns object-URL lifecycle |
| `included` | `boolean` | `true` | checkbox state (dimmed when false) |
| `onToggleInclude` | `() => void` | — | renders the checkbox when set |
| `onRemove` | `() => void` | — | renders the × when set |
| `onOpen` | `() => void` | — | makes the card clickable |
| `draggable` | `boolean` | `false` | HTML5 drag handle wiring |
| `onDragStart` / `onDragEnd` | `() => void` | — | drag intent reports |
| `removeLabel` | `string` | `'Remove file'` | × accessible name (`<removeLabel> — <name>`) |
| `includeLabel` | `string` | `'Include in processing'` | checkbox label (`<includeLabel> — <name>`) |
| `className` | `string` | — | merges |

## controlled contract

Everything is controlled: `status`, `included`, drag state. Events out:
toggle/remove/open/drag. The app owns uploads, object URLs and ordering
(see [`FileQueue`](./file-queue.md) for the grid + reorder wrapper).

## labels & i18n

`removeLabel`/`includeLabel` are props with English defaults; the fixed
status words ("Processing…", "Done", "Failed") are library-internal — pass
`error` for a translated failure text.

## examples

minimal:

```tsx
<FileCard name="lecture.pdf" sizeBytes={812345} onRemove={remove} />
```

realistic (processing upload with include toggle):

```tsx
<FileCard
  name={file.name}
  sizeBytes={file.size}
  status={uploading ? 'processing' : file.error ? 'failed' : 'done'}
  error={file.error ?? null}
  thumbnailUrl={file.objectUrl}
  included={file.included}
  onToggleInclude={() => toggle(file.id)}
  onRemove={() => remove(file.id)}
  removeLabel={t('common.removeFile')}
  includeLabel={t('common.includeFile')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#file-surface): remove button
named "`<removeLabel> — <name>`", include checkbox labelled per file,
processing `role="status"`, failure state text.

## related

[`FileQueue`](./file-queue.md), [`UploadDropzone`](./upload-dropzone.md).
