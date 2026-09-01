# FileQueue

Grid of `FileCard`s with an aggregate summary line and optional
drag-to-reorder. Reorder reports intent — `onReorder(fromId, toId)` — the
app owns ordering. Renders a muted paragraph when empty (if `emptyText`).

## import

```ts
import { FileQueue, type FileQueueItem } from '@neuronection/assistant-ui/file-queue'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `files` | `FileQueueItem[]` | — | `{ id, name, sizeBytes?, status?, error?, thumbnailUrl?, included? }` |
| `onRemove` | `(id: string) => void` | — | renders card × buttons |
| `onToggleInclude` | `(id: string) => void` | — | renders card checkboxes |
| `onOpen` | `(id: string) => void` | — | card click |
| `onReorder` | `(fromId: string, toId: string) => void` | — | drop intent |
| `reorderable` | `boolean` | `Boolean(onReorder)` | force off with `false` |
| `emptyText` | `string` | — | empty-state paragraph |
| `summary` | `ReactNode` | — | overrides the default `N files · 1.2 MB` line |
| `removeLabel` / `includeLabel` | `string` | `'Remove file'` / `'Include in processing'` | forwarded to every card |
| `className` | `string` | — | merges |

## controlled contract

`files` is the source of truth; remove/include/open/reorder report by `id`.
Drop targets highlight via the focus ring token while dragging. Set
`reorderable={false}` to keep drag wiring but not the drop targets.

## labels & i18n

Labels forwarded to `FileCard`; `summary`/`emptyText` are app content.

## examples

minimal:

```tsx
<FileQueue files={uploads} onRemove={(id) => remove(id)} />
```

realistic (reorder + toggle, study pattern):

```tsx
<FileQueue
  files={materials}
  onRemove={(id) => removeMaterial(id)}
  onToggleInclude={(id) => toggleInclude(id)}
  onReorder={(fromId, toId) => move({ fromId, toId })}
  emptyText={t('materials.empty')}
  removeLabel={t('common.removeFile')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#file-surface): list of `FileCard`
remove/include controls plus the aggregate summary; reorder intent reports
on drop (keyboard reordering stays app-side — pair with other affordances
if needed).

## related

[`FileCard`](./file-card.md), [`UploadDropzone`](./upload-dropzone.md).
