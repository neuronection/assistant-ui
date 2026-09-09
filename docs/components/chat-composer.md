# ChatComposer

The family chat input: auto-growing IME-safe textarea (Enter sends,
Shift+Enter newlines, composition never submits), send/stop states,
toolbar + attachment + suggestion slots, drag-drop and paste file wiring.
Controlled; transports, sessions and upload endpoints stay app-side.

## import

```ts
import { ChatComposer } from '@neuronection/assistant-ui/chat-composer'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `value` / `onValueChange` | `string` · `(v) => void` | Controlled text. |
| `onSubmit` | `() => void` | Enter / Send button / form submit (IME-safe). |
| `sending` | `boolean` | Turn in flight — swaps Send for Stop, blocks Enter. |
| `onStop` | `() => void` | Stop control while `sending` (family stop endpoint). |
| `disabled` | `boolean` | Dims and blocks everything. |
| `maxRows` | `number` | Auto-grow cap before scrolling. Default `8`. |
| `toolbarStart` / `toolbarEnd` | `ReactNode` | Inside the input row — attach menu, equation, draw, dictation… |
| `attachments` | `ReactNode` | Rail above the input (`FileQueue`, image chips). |
| `suggestions` | `ReactNode` | Chips / context strip above everything. |
| `onAttachFiles` | `(files: File[]) => void` | Drag-drop + paste wiring (also enables the drop styling). |
| `placeholder` / `ariaLabel` | `string` | Defaults "Send a message…" / "Message". |
| `labels` / `icons` | | send/stop strings; `LucideIcon` overrides (defaults ArrowUp/Square). |
| `textareaRef` | `Ref<HTMLTextAreaElement>` | Focus management app-side. |

## styling hooks

| Hook | Meaning |
| --- | --- |
| `form[data-as="chat-composer"]` | The composer root (also carries `data-sending`). |
| `[data-as="chat-composer-row"]` | The input row (toolbar slots + textarea + send/stop). |
| `[data-as="chat-composer-row"][data-multiline]` | Present whenever the auto-growing textarea renders more than one line (same layout pass as the auto-grow height; absent in jsdom-style environments without layout). Apps use it to restructure the row — e.g. wrap the toolbars into a footer under a full-width textarea. |

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
/>
```

## accessibility

Labelled textarea (`aria-label`), labelled send/stop buttons with focus
rings; the input container shows `focus-within` affordance; drag state is
announced via `role="status"`. Keyboard flows tested (Enter/Shift+Enter,
IME guard, stop swap).

## related

[`chat-panel`](./chat-panel.md), [`dictation`](./dictation.md),
[`file-queue`](./file-queue.md), [`chat-core`](./chat-core.md).
