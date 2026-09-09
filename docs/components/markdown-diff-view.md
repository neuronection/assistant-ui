# MarkdownDiffView

Side-by-side **formatted** markdown diff ("what changed") for documents whose
content is meant to be read rendered — headings, KaTeX math, tables, lists,
mermaid diagrams. Blocks are compared at the markdown-block level (blank-line
separated, with fenced code and `$$` display-math spans kept intact), and each
block renders through the same surface as [`chat-markdown`](./chat-markdown.md):
unchanged blocks appear once across the full width, changed blocks render
side-by-side with add/delete tinting, plus per-change navigation and
expandable unchanged-block folds.

When reviewers need the exact source characters, use
[`TextDiffView`](./text-diff-view.md) — it stays line-precise and virtualized.
This component trades line-level precision and virtualization for readable,
rendered output; it is not virtualized (every block renders its markdown).

Two-app rule note: markdown review surfaces exist across the family chat
stacks (`chat-markdown` is a family module), so the formatted diff rides on
the same dependency — no app-local copies.

## import

```ts
import {
  MarkdownDiffView,
  splitMarkdownBlocks,
} from '@neuronection/assistant-ui/markdown-diff-view'
```

## props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `original` | `string` | — (required) | The old markdown document. |
| `suggested` | `string` | — (required) | The new markdown document. |
| `contextBlocks` | `number` | `1` | Unchanged blocks kept visible around each change; the rest collapse into expandable folds. |
| `showHeader` | `boolean` | `true` | Column labels (*Original* / *Suggested*) + `+N −M` changed-block stats + change navigation. |
| `showNav` | `boolean` | `true` | Prev/next change buttons with an `n/N` counter (active block is tinted and scrolled into view). |
| `labels` | `Partial<MarkdownDiffViewLabels>` | English defaults | `original`, `suggested`, `unchangedBlocks(count)` (plural callback), `showLess`, `prevChange`, `nextChange`, `changePosition(index, total)`, `noChanges`. |
| `className` | `string` | — | Merged onto the outer box (`data-as="markdown-diff-view"`). |
| `bodyClassName` | `string` | — | Applied to the scrolling body — size the view here (e.g. `max-h-80`). |

`splitMarkdownBlocks(markdown)` is exported for callers that need the same
block segmentation the component diffs over (tests, stats).

## rendering contract

- Unchanged blocks render **once**, full width, with `data-context`.
- Changed groups render in a two-column grid: left = removed block
  (`data-kind="del"`, danger tint), right = added block
  (`data-kind="add"`, success tint); a missing side renders an empty muted
  cell. Rows carry `data-changed`, the navigated group `data-active`.
- Block segmentation ignores blank lines inside fenced code and `$$`
  display-math spans; an unclosed fence runs to the end of the document.
- Identical documents render the `noChanges` placeholder instead of the view.
- Rendering is **not virtualized** — for very long source-level diffs prefer
  `TextDiffView`.

## label/i18n contract

Strings are props with English defaults; `unchangedBlocks` and
`changePosition` are formatter callbacks so apps can use i18next plurals at
call sites.

## examples

minimal:

```tsx
<MarkdownDiffView original={oldMarkdown} suggested={newMarkdown} />
```

realistic (bounded panel, translated labels):

```tsx
<MarkdownDiffView
  original={proposal.payload.original_md}
  suggested={proposal.payload.new_markdown}
  bodyClassName="max-h-80"
  labels={{
    original: t('diff.original'),
    suggested: t('diff.suggested'),
    unchangedBlocks: (count) => t('diff.unchangedBlocks', { count }),
    showLess: t('diff.showLess'),
    prevChange: t('diff.prevChange'),
    nextChange: t('diff.nextChange'),
    changePosition: (index, total) => t('diff.changePosition', { index, total }),
  }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): header navigation
buttons are labelled and disabled-aware; fold buttons are labelled; changed
rows carry `data-changed` / `data-active` hooks; the diff body is a
scrollable region (keep `bodyClassName` sized so keyboard scrolling works).

## related

[`TextDiffView`](./text-diff-view.md),
[`chat-markdown`](./chat-markdown.md),
[`RichTextEditor`](./rich-text-editor.md).
