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
| `toolbarExtra` | `ReactNode \| ((editor: Editor \| null) => ReactNode)` | — | App-owned controls rendered at the end of the toolbar (AI assist, dictation, …). The render-prop form receives the editor for command buttons. |
| `extensions` | `Extensions` | `[StarterKit, Markdown]` | **Full override** of the document extension set — apps declare their complete set (include `Document`-level nodes; a partial list fails schema compilation). Keep the array stable/memoized. |
| `contentClassName` | `string` | — | Extra classes merged onto the editable region (ProseMirror element) after the built-ins via tailwind-merge (app utilities win). |
| `onReady` | `(editor: Editor \| null) => void` | — | Called once when the editor instance is created and again with `null` on destroy/unmount. Stable identity — never called per render. The app's handle for commands, event wiring (`selectionUpdate`, …) and insert flows. |
| `headingLevels` | `Array<1 \| 2 \| 3 \| 4>` | `[2]` | One heading toggle per level in the `heading` group, each with its own `aria-pressed` state. |
| `parseMarkdown` | `(markdown: string) => string` | — | Map incoming app-domain markdown before it reaches the document (fidelity conventions). |
| `serializeMarkdown` | `(markdown: string) => string` | — | Map the serialized document before emission and echo comparison. |
| `labels` | `Partial<RichTextEditorLabels>` | English defaults | `toolbar` (toolbar name, default *Formatting*), `bold`, `italic`, `strike`, `code`, `heading` — `(level) => string`, default `` (level) => `Heading ${level}` ``, `bulletList`, `orderedList`, `blockquote`, `undo`, `redo`. |
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
- History buttons reflect undo/redo availability (`editor.can()`) and
  disable while there is nothing to undo/redo.
- `onReady` hands the live `Editor` to the app; run commands or wire editor
  events there, not during render.

## label/i18n contract

All visible strings are props with English defaults (`labels`, `titles`);
apps translate at call sites. The component never imports an i18n engine.
`labels.heading` is a function of the heading level so per-level toggles
(from `headingLevels`) get distinct accessible names.

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

full override + per-level headings + `onReady` (app owns the complete
extension set):

```tsx
const extensions = useMemo(
  () => [
    StarterKit.configure({ paragraph: false, link: { protocols: ['http', 'https', 'mailto'] } }),
    BlankLineParagraph, CaMath, MarkdownTable, TableRow, TableCell, TableHeader,
    Markdown.configure({ html: false, breaks: true, linkify: false }),
  ],
  [],
)
<RichTextEditor
  value={body}
  onValueChange={setBody}
  ariaLabel={t('note.body')}
  extensions={extensions}
  parseMarkdown={encodeForParse}
  serializeMarkdown={decodeFromSerialize}
  contentClassName="prose-notes min-h-56 max-h-[65vh] overflow-y-auto"
  toolbar={['history', 'heading', 'format', 'list', 'quote']}
  headingLevels={[2, 3]}
  labels={{ heading: (level) => (level === 2 ? t('editor.heading2') : t('editor.heading3')) }}
  toolbarExtra={(editor) => <AppButtons editor={editor} />}
  onReady={(editor) => { editorRef.current = editor }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): toolbar
`role="toolbar"` named via `labels.toolbar`; `aria-pressed` toggle buttons
(one per `headingLevels` entry, named via `labels.heading(level)`);
labelled contenteditable editable region; toolbar buttons are tabbable and
Enter-activatable; `Control+B` toggles bold (asserted).

## related

[`Textarea`](./textarea.md), [`AiActionsDropdown`](./ai-actions-dropdown.md),
[`FlowStatusCard`](./flow-status.md).
