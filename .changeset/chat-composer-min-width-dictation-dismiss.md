---
"@neuronection/assistant-ui": minor
---

`chat-composer` / `dictation`: keep the input usable and let capability
notices be dismissed.

- **`ChatComposer`** textarea gains a `min-w-32` (8rem) floor. Toolbar slots
  are icon-scale by contract; a prose notice placed in `toolbarStart` /
  `toolbarEnd` can no longer collapse the input on narrow rails.
- **`DictationUnavailable`** gains optional `onDismiss` and `dismissLabel`
  (default *Dismiss*). When `onDismiss` is provided it renders a labelled
  close control alongside the reason/action; the app owns the dismissal
  state. The row aligns top for multi-line prose.
- Docs: the composer layout contract and the dictation placement rule
  (full-width above the input row, never a toolbar slot) are stated in the
  component pages; narrow-frame stories added.
