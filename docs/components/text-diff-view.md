# TextDiffView

Side-by-side text diff ("what changed") with word-level intra-line
highlighting, per-side line numbers, prev/next change navigation, expandable
unchanged-line folds and virtualized rendering for long diffs. Pure and
controlled: two strings in, rendered diff out. The diff engine
(`computeLineDiff`, `wordSegments`) is exported for app-side stats.

## import

```ts
import {
  TextDiffView,
  computeLineDiff,
  wordSegments,
} from '@neuronection/assistant-ui/text-diff-view'
```

## props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `original` | `string` | — (required) | The old text. |
| `suggested` | `string` | — (required) | The new text. |
| `contextLines` | `number` | `2` | Unchanged lines kept visible around each changed block; the rest collapse into expandable folds. |
| `showHeader` | `boolean` | `true` | Column labels (*Original* / *Suggested*) + `+N −M` stats + change navigation. |
| `showNav` | `boolean` | `true` | Prev/next change buttons with an `n/N` counter (active block is tinted and scrolled into view). |
| `labels` | `Partial<TextDiffViewLabels>` | English defaults | `original`, `suggested`, `showLess` (*Show less*), `prevChange`, `nextChange`, `unchangedLines(count)` (plural callback), `changePosition(index, total)`. |
| `className` | `string` | — | Merged onto the outer box (`data-as="text-diff-view"`). |
| `bodyClassName` | `string` | — | Applied to the scrolling body — size the view here (e.g. `max-h-64`, `flex-1`). |

The view owns its scroll container; give the component a bounded height via
the parent layout or `bodyClassName`.

## rendering contract

- Left column = original (`-` gutter, removed lines), right column =
  suggested (`+` gutter, added lines); unchanged lines render as context
  pairs. Changed words inside a replaced line are highlighted (`<mark>`).
- Identical texts render a "No changes" placeholder instead of the view.
- Folds expand on click ("N unchanged lines") and re-collapse ("Show less").
- Rendering is virtualized — long diffs mount only visible rows.

## label/i18n contract

Strings are props with English defaults; `unchangedLines` and
`changePosition` are formatter callbacks so apps can use i18next plurals at
call sites.

## examples

minimal:

```tsx
<TextDiffView original={oldTranscript} suggested={newTranscript} />
```

realistic (bounded panel, translated labels):

```tsx
<TextDiffView
  original={version.markdown}
  suggested={workingContent}
  contextLines={1}
  bodyClassName="max-h-72"
  labels={{
    original: t('diff.original'),
    unchangedLines: (count) => t('diff.unchangedLines', { count }),
  }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): header navigation
buttons are labelled and disabled-aware; changed/active rows carry
`data-changed` / `data-active` hooks; the diff body is a scrollable region
(keep `bodyClassName` sized so keyboard scrolling works).

## related

[`RichTextEditor`](./rich-text-editor.md),
[`AiActionsDropdown`](./ai-actions-dropdown.md).
