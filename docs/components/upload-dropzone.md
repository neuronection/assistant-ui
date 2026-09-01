# UploadDropzone

Presentational dropzone: drag-and-drop **and** OS file-picker (click, or
Enter/Space from keyboard focus) report `File[]` via `onFiles`. Uploading,
storage and progress stay app-side. Optional folder picking via the
non-standard `webkitdirectory` attribute.

## import

```ts
import { UploadDropzone } from '@neuronection/assistant-ui/upload-dropzone'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `onFiles` | `(files: File[]) => void` | — | drops + picker results |
| `uploading` | `boolean` | `false` | busy state: spinner, `cursor-progress`, input suppressed |
| `variant` | `'block' \| 'row'` | `'block'` | big panel vs compact row |
| `label` | `string` | `'Drop files here or click to browse'` | also the accessible name |
| `hint` | `string` | — | second line |
| `browseLabel` | `string` | `'Choose files'` | shown while uploading (`<browseLabel>…`) |
| `folderLabel` | `string` | `'Choose folder'` | shown while dragging |
| `accept` | `string` | — | `accept` passthrough (e.g. `'application/pdf'`) |
| `multiple` | `boolean` | `true` | |
| `allowFolders` | `boolean` | `false` | adds the directory picker input |
| `disabled` | `boolean` | `false` | |
| `className` | `string` | — | merges; drag state also emits `data-dragging` |

## controlled contract

`onFiles(files)` out — every source (drop, click, keyboard activation).
Suppressed while `uploading`/`disabled`. The file inputs reset themselves
after each emit, so picking the same file twice re-fires.

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<UploadDropzone onFiles={(files) => upload(files)} />
```

realistic (row variant + accept + busy, study pattern):

```tsx
<UploadDropzone
  variant="row"
  accept=".pdf,.md,image/*"
  uploading={isUploading}
  onFiles={(files) => uploadMutation.mutate(files)}
  label={t('materials.dropLabel')}
  hint={t('materials.dropHint')}
  browseLabel={t('materials.uploading')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#file-surface): labelled dropzone
button; click **and Enter from keyboard focus** open the OS picker; drop
accepted; suppressed while uploading/disabled.

## related

[`FileCard`](./file-card.md), [`FileQueue`](./file-queue.md).
