# MarkdownSurface

The family's read-only **streaming markdown surface** — the renderer behind
every chat bubble: GFM tables, KaTeX math, lazily-imported mermaid diagrams,
copyable code blocks with language tags. Model output is untrusted input:
raw HTML never renders (no `rehype-raw`), URLs pass a safe transform.

## import

```ts
import { MarkdownSurface } from '@neuronection/assistant-ui/chat-markdown'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Markdown source. |
| `streaming` | `boolean` | Live turn — defers mermaid to the final render; math stays on (error-tolerant). |
| `gfm` | `boolean` | remark-gfm (tables, strikethrough, task lists). Default `true`. |
| `math` | `boolean` | remark-math + rehype-katex (`throwOnError: false`). Default `true`. |
| `mermaid` | `boolean` | Render ```mermaid fences as diagrams (forced off while `streaming`). Default `true`. |
| `mermaidTheme` | `'neutral' \| 'default' \| 'dark' \| 'forest'` | Mermaid theme. Default `'neutral'`. |
| `components` | `MarkdownComponents` | Per-key overrides of the default renderers (`a` for mentions/citations, `code`, `table`…). |
| `urlTransform` | `UrlTransform` | Safe default; apps pass a tolerant transform for internal schemes (study mentions). |
| `showCodeLanguage` | `boolean` | Language tag on code blocks. Default `true`. |
| `labels` | `Partial<MarkdownCodeBlockLabels>` | `copy` / `code` strings. |

Base typography (headings, lists, blockquote, tables, `.katex-display`)
ships in the library CSS scoped to `[data-as="chat-markdown"]` — it holds
in Tailwind apps whose preflight removes browser defaults. KaTeX CSS is
bundled into `styles.css` and its fonts ship in `dist/fonts`.

## example (realistic)

```tsx
<MarkdownSurface
  value={message.content}
  streaming={live?.status === 'streaming'}
  components={{
    a: ({ href, children }) =>
      href?.startsWith('citation://') ? <CitationButton ref={href.slice(11)}>{children}</CitationButton> : undefined,
  }}
/>
```

## accessibility

Surface `div` with `data-as="chat-markdown"`; heading levels pass through
from the markdown source; code blocks expose an `aria-label`
(`<language> code`) and a labelled copy button; mermaid diagrams render an
`svg` (title it via your markdown `---\ntitle: …\n---` frontmatter or
`aria-label` on the wrapper); tables keep native `table` semantics.

## related

[`chat-message`](./chat-message.md), [`chat-transcript`](./chat-transcript.md),
[`chat-core`](./chat-core.md), [`CopyButton`](./copy-button.md),
[`RichTextEditor`](./rich-text-editor.md) (editing counterpart).
