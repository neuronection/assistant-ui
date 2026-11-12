# ChatComposer

The family chat input: auto-growing IME-safe textarea (Enter sends,
Shift+Enter newlines, composition never submits), send/stop states with
a rotate-through morph on the swap, token-timed focus glow, pulsing
drag-over affordance, sliding attachment/suggestion rails, toolbar
slots, drag-drop and paste file wiring. Controlled; transports, sessions
and upload endpoints stay app-side.

## import

```ts
import { ChatComposer } from '@neuronection/assistant-ui/chat-composer'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `value` / `onValueChange` | `string` · `(v) => void` | Controlled text. |
| `onSubmit` | `() => void` | Enter / Send button / form submit (IME-safe). |
| `sending` | `boolean` | Turn in flight — swaps Send for Stop (rotational morph on the swap, never on first mount), blocks Enter. |
| `onStop` | `() => void` | Stop control while `sending` (family stop endpoint). |
| `disabled` | `boolean` | Dims and blocks everything. |
| `canSubmit` | `boolean` | Overrides the send button's blank-text guard — apps that allow attachment-only submits (health's image-only "what's this?" turn) pass `true` while ready attachments exist; `false` force-disables. Default: enabled only when `value.trim() !== ''`. Enter/form submit is unaffected — the app's `onSubmit` stays the guard. |
| `commands` | `ChatComposerCommands` | Slash-command / mention palette: `{ trigger? ('/' default), items: { id, label, hint?, icon? }[], maxItems? (8), onSelect }`. Opens while the caret touches a trigger-started word; fuzzy-filtered (`searchScore`); ArrowUp/Down move, Enter/Tab select (never submit while open), Escape dismisses. `onSelect(id, token)` receives the draft offsets (`token.start/end/query`) — the app replaces that span with its insertion. The textarea wires `aria-controls` + `aria-autocomplete="list"` + `aria-activedescendant` into the `role="listbox"` palette. |
| `history` | `string[]` | Previously sent prompts (oldest → newest). ArrowUp on an empty draft recalls the last one, ArrowUp/ArrowDown walk the stack, ArrowDown past the newest clears the draft. Editing a recalled draft exits the stack. |
| `maxRows` | `number` | Auto-grow cap fallback (rows of 22px) when the textarea carries no CSS `max-h-*`; a `max-h-*` class always wins. Default `8`. |
| `toolbarStart` / `toolbarEnd` | `ReactNode` | Inside the input row — attach menu, equation, draw, dictation… |
| `attachments` | `ReactNode` | Rail above the input (`FileQueue`, image chips); slides up on mount. |
| `suggestions` | `ReactNode` | Chips / context strip above everything; slides up on mount. |
| `onAttachFiles` | `(files: File[]) => void` | Drag-drop + paste wiring (also enables the drop styling). |
| `placeholder` / `ariaLabel` | `string` | Defaults "Send a message…" / "Message". |
| `labels` / `icons` | | send/stop strings; `LucideIcon` overrides (defaults ArrowUp/Square). |
| `textareaRef` | `Ref<HTMLTextAreaElement>` | Focus management app-side. |

## styling hooks

| Hook | Meaning |
| --- | --- |
| `form[data-as="chat-composer"]` | The composer root (also carries `data-sending`). |
| `[data-as="chat-composer-row"]` | The input row (toolbar slots + textarea + send/stop). Row motion is CSS-owned here: token-timed border/background/box-shadow transitions, a `--as-primary` focus glow on `:focus-within`, and a `1.4s` drop-zone pulse while `data-dragging` — all disabled under `prefers-reduced-motion`. |
| `[data-as="chat-composer-row"][data-multiline]` | Present while the auto-growing textarea renders more than one line (same layout pass as the auto-grow height; absent in jsdom-style environments without layout). Apps use it to restructure the row — e.g. wrap the toolbars into a footer under a full-width textarea. Hysteretic by contract: once set it stays until the draft clears, because restructuring the row changes the textarea's width and a flag re-measured at the new width would flip itself every keystroke near the wrap threshold. |

## example (realistic)

```tsx
<ChatComposer
  value={draft}
  onValueChange={setDraft}
  onSubmit={() => void stream.send(draft)}
  sending={stream.status === 'pending' || stream.status === 'streaming'}
  onStop={() => void stream.stop()}
  toolbarStart={<AttachMenu courseId={courseId} />}
  toolbarEnd={<DictationButton onText={setDraft} />}
  attachments={pending.length > 0 ? <FileQueue items={pending} /> : null}
  onAttachFiles={(files) => upload(files)}
  canSubmit={draft.trim() !== '' || pending.some((file) => file.ready)}
/>
```

## accessibility

Labelled textarea (`aria-label`), labelled send/stop buttons with focus
rings; the input container shows `focus-within` affordance; drag state is
announced via `role="status"`. **Escape stops the turn** while `sending`
(when `onStop` is given). The command palette is a `role="listbox"` with
`role="option"` entries; the textarea carries `aria-controls`,
`aria-autocomplete="list"` and `aria-activedescendant` while open, and
Enter/Tab never submit while the palette is open. History recall is pure
keyboard. Keyboard flows tested (Enter/Shift+Enter, IME guard, stop
swap, palette nav + select + dismiss, history recall).

## related

[`chat-panel`](./chat-panel.md), [`dictation`](./dictation.md),
[`file-queue`](./file-queue.md), [`chat-core`](./chat-core.md).
