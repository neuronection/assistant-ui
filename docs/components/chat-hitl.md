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
| `status` | `'pending' \| 'approved' \| 'rejected' \| 'conflict' \| 'expired' \| 'reverted'` | `pending` and `conflict` render resolve actions (a conflict re-applies the refreshed diff under the `reapply` label); `reverted` is the terminal state of an undone approved card (plan 99). |
| `diff` | `FieldDiffValue[]` | Field rows `{ field, label?, before?, after? }`. Values render three ways: long text (either side > 80 chars) through `TextDiffView`, structured collections (`isStructuredList` — lists of plain objects, plan 99's skills/achievements/links rows) as chip rows with the entry's label + role/level suffix, scalars inline or as parsed chips for string arrays. |
| `action` | `'create' \| 'update' \| 'delete'` | Proposal mutation kind. `create` renders the rows through `FieldSummary` instead of a before→after diff — empty values are skipped, fields render as label/value rows and long text as a plain prose block (a create has no before-state to diff against). Update/delete keep the classic diff; omitted → legacy diff behavior. |
| `destructive` | `boolean` | Destructive ops arm a two-step confirm (Approve → Confirm delete / Cancel) before `onApprove` fires. |
| `onApprove` / `onReject` / `onPreview` | `() => void` | Resolve events. `onReject` absent → no reject button (e.g. read-only history). `onPreview` (plan 99) renders a Preview button on pending AND approved/reverted cards — a tier-3 slot: the library owns the button + a11y, the app owns what a preview is (before/after modal, highlighting). Omitted → no button. |
| `busy` | `boolean` | Resolve in flight — disables actions, shows a spinner on the primary. |
| `conflictNote` | `string` | App-owned conflict detail (the server's drift reason); replaces the default `conflictHint` when given. |
| `children` | `ReactNode` | App-owned body slot rendered between the field rows and the resolve actions (target/edit summaries, rendered diffs, previews) — tier-3 composition, the card keeps the chrome + actions. |
| `error` | `string` | Resolve error text (`role="alert"`). |
| `labels` | `Partial<HitlProposalCardLabels>` | approve/reject/confirm/cancel/preview/reapply + the six status words + `conflictHint`. |
| `icon` | `LucideIcon` | Default `ClipboardCheck`. |
| `previewTestId` | `string` | Preview button `data-testid` (default `hitl-preview-button`; pass `hitl-preview-{id}` for per-card targeting). |

`FieldDiff` is exported separately for one-off diff rows outside a card;
`FieldSummary` for non-diff item summaries (empty fields skipped, long
text as prose). `isStructuredList`, `chipLabel`, `FieldChips` and
`valueText` are exported for apps composing custom value rows — the
chips caption is `label (role · lvl N)`.

`FieldDiff` is exported separately for one-off diff rows outside a card;
`FieldSummary` for non-diff item summaries (empty fields skipped, long
text as prose).

## composition snippet (body slot + conflict)

```tsx
<HitlProposalCard
  title="Edit note · Calculus"
  status={proposal.status}
  diff={diffRows}
  conflictNote={proposal.conflictReason}
  onApprove={approve}
  onReject={dismiss}
  onPreview={() => setPreviewOpen(true)}
  labels={{ reapply: t('proposals.reapply'), preview: t('proposals.preview') }}
>
  <ProposalBody proposal={proposal} />
</HitlProposalCard>
```

The body slot carries everything app-specific (target breadcrumbs, anchored
edit summaries, a formatted/raw diff toggle); the card keeps the status
chrome, the resolve actions and the destructive two-step confirm.

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
