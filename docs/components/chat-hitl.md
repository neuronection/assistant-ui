# chat-hitl

Human-in-the-loop proposal card (family plan 77): a persisted mutation
the user resolves. The chatbot (or any proposing surface) lands typed ops
as cards; the card shows a field-level before/after diff and Approve /
Reject actions. Presentational + controlled — status is a prop and
resolve is an event; transport, toasts and stores stay app-side.

## import

```ts
import { HitlProposalCard } from '@neuronection/assistant-ui/chat-hitl'
// or from the barrel:
import { HitlProposalCard } from '@neuronection/assistant-ui'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Card headline, e.g. `Update experience · Siemens internship`. |
| `status` | `'pending' \| 'approved' \| 'rejected' \| 'conflict' \| 'expired'` | Only `pending` renders actions. |
| `diff` | `FieldDiffValue[]` | Field rows `{ field, label?, before?, after? }`; long text (either side > 80 chars) renders through `TextDiffView`. |
| `action` | `'create' \| 'update' \| 'delete'` | Proposal mutation kind. `create` renders the rows through `FieldSummary` instead of a before→after diff — empty values are skipped, fields render as label/value rows and long text as a plain prose block (a create has no before-state to diff against). Update/delete keep the classic diff; omitted → legacy diff behavior. |
| `destructive` | `boolean` | Destructive ops arm a two-step confirm (Approve → Confirm delete / Cancel) before `onApprove` fires. |
| `onApprove` / `onReject` | `() => void` | Resolve events. `onReject` absent → no reject button (e.g. read-only history). |
| `busy` | `boolean` | Resolve in flight — disables actions, shows a spinner on the primary. |
| `error` | `string` | Resolve error text (`role="alert"`). |
| `labels` | `Partial<HitlProposalCardLabels>` | approve/reject/confirm/cancel + the five status words + `conflictHint`. |
| `icon` | `LucideIcon` | Default `ClipboardCheck`. |

`FieldDiff` is exported separately for one-off diff rows outside a card;
`FieldSummary` for non-diff item summaries (empty fields skipped, long
text as prose).

## accessibility

Actions are real `<button>`s (Tab / Enter tested); the destructive flow
re-labels the armed button to "Confirm delete" and adds a Cancel button
(no modal dependency); terminal states render zero controls; `error`
carries `role="alert"`; status words are visible text (no sr-only-only
state). Keep diff content text-legible; avoid nested interactive
elements inside the diff region.

## related

[`chat-tool-card`](./chat-tool-card.md) (observation cards — no actions),
[`text-diff-view`](./text-diff-view.md) (long-text diffs),
[`confirmation-modal`](./confirmation-modal.md) (app-composed confirms).
