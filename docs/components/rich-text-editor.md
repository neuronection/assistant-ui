# RichTextEditor

Controlled rich-text editor primitive (Tiptap) with a markdown round-trip
contract: the app owns a markdown string, the editor owns the document.
Ships a configurable formatting toolbar plus a `toolbarExtra` slot so apps
can drop in their own controls (AI assist buttons, dictation, …) without
forking the component. Intentionally small: math, drawings, dictation
transport and AI flows are app-side compositions.

## import

```ts
import { RichTextEditor } from '@neuronection/assistant-ui/rich-text-editor'
```

## props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — (required) | Markdown source. External changes are applied to the document; a value equal to the last emitted markdown is ignored (echo-safe). |
| `onValueChange` | `(markdown: string) => void` | — (required) | Emitted on every document change with the serialized markdown. |
| `ariaLabel` | `string` | — (required) | Accessible name for the editable region (also names nothing else — the toolbar names itself via `labels.toolbar`). |
| `disabled` | `boolean` | `false` | Sets the document non-editable and disables toolbar buttons. |
| `toolbar` | `RichTextToolbarGroup[] \| false` | all groups | Groups in render order: `'history'`, `'heading'`, `'format'`, `'list'`, `'quote'`. `false` renders no toolbar. |
| `toolbarExtra` | `ReactNode` | — | App-owned controls rendered at the end of the toolbar (use for AI/dictation/etc.). |
| `labels` | `Partial<RichTextEditorLabels>` | English defaults | `toolbar` (toolbar name, default *Formatting*), `bold`, `italic`, `strike`, `code`, `heading`, `bulletList`, `orderedList`, `blockquote`, `undo`, `redo`. |
| `icons` | `Partial<RichTextEditorIcons>` | Lucide defaults | Per-button icon overrides. |
| `className` | `string` | — | Merged onto the root (`data-as="rich-text-editor"`). |

## controlled contract

- The editor is the source of truth for the document; `onValueChange` emits
  serialized markdown after every transaction.
- External `value` changes are applied with caret preservation: when the
  editor is focused, the caret offset is clamped and restored after the
  content swap. A `value` identical to the last emitted (or currently
  serialized) markdown never triggers a re-set — parent echo loops are safe.
- Serialization is markdown-only (via `tiptap-markdown`); unknown custom
  nodes are not preserved across external syncs.

## label/i18n contract

All visible strings are props with English defaults (`labels`, `titles`);
apps translate at call sites. The component never imports an i18n engine.

## examples

minimal:

```tsx
const [text, setText] = useState('')
<RichTextEditor value={text} onValueChange={setText} ariaLabel="Comment" />
```

realistic (app slot + translated labels):

```tsx
<RichTextEditor
  value={summary}
  onValueChange={setSummary}
  ariaLabel={t('cv.summary')}
  labels={{ toolbar: t('editor.formatting'), bold: t('editor.bold') }}
  toolbar={['history', 'format', 'list']}
  toolbarExtra={<AiActionsDropdown … />}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): toolbar
`role="toolbar"` named via `labels.toolbar`; `aria-pressed` toggle buttons;
labelled contenteditable editable region; toolbar buttons are tabbable and
Enter-activatable; `Control+B` toggles bold (asserted).

## related

[`Textarea`](./textarea.md), [`AiActionsDropdown`](./ai-actions-dropdown.md),
[`FlowStatusCard`](./flow-status.md).
