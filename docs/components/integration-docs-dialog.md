# DocsDialog

The bundle-docs viewer (plan 33 G4): bundles carry docs; this is the
family's lightweight answer so no product re-invents it — a tree navigation
with a content SLOT. The docs tree and each node's content are app-fetched
data; the dialog renders navigation + selection + the app's content. All
labels ride props.

## import

```ts
import { DocsDialog } from '@neuronection/assistant-ui/integration-docs-dialog'
```

## props

- `open: boolean` + `onOpenChange(open)` — controlled modal (Radix).
- `docs: IntegrationDocsNode[]` — the tree: `{ id, title, children? }`.
- `selectedId?: string | null` + `onSelect(nodeId)` — controlled selection
  (falls back to the first node when unset).
- `renderContent(node)` — REQUIRED content slot: app-owned fetch + render
  for the selected node.
- `status?: 'loading' | 'error' | 'ready'` — the content pane's triad.
- `errorDetail?: string | null` — rendered under the error message.
- `labels?: DocsDialogLabels` — title/description/close, `treeLabel`,
  `emptyLabel` ("ships no docs"), `loadingLabel`, `errorLabel`.
- `className` — merges onto the modal content.

## controlled contract

The dialog never fetches or stores anything: the tree is data in, content
rendering is the app's slot, selection is controlled.

## label/i18n contract

`labels` with English defaults; node titles come from the data.

## accessibility

`nav` with `aria-label`; tree entries are buttons with `aria-current` for
the selection; content pane is a labelled region; Escape closes. See
[accessibility](../accessibility.md).

Related: [IntegrationCard](./integration-card.md),
[ActionResultDialog](./integration-action-result-dialog.md).
