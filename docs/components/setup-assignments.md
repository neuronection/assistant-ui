# setup-assignments

The "Default assignments" section of the guided setup review: a titled,
hinted list of per-task switches in one bordered container. Each switch
fills that task's empty default — gap-fill semantics live app-side, the
rows only carry the choice.

## Import

```ts
import { SetupAssignments } from '@neuronection/assistant-ui/setup-assignments'
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | the section heading (e.g. "Default assignments") |
| `hint` | `string` | — | one-line explanation under the heading |
| `rows` | `SetupAssignmentRow[]` | — | `{ id, label, hint?, checked, disabled?, onCheckedChange }` — one switch per task |
| `className` | extras | — | merges onto the root |

`SetupAssignmentRow.hint` renders as the switch's `currentValue` sub-line
(e.g. "now: unset · fills: gpt-5.6-terra").

## Controlled contract

Fully controlled: `checked` in, `onCheckedChange(id-level choice)` out.
The library performs no task-to-slot logic — the app maps switch state
onto its five-bind options body (see `setup-review`).

## Accessibility

Inherits `SwitchRow`'s row contract (`role="switch"` + `aria-checked`,
`now:` sub-line); the section is labelled by its heading text. See
[accessibility.md](../accessibility.md#setup-assignments).

## Example

```tsx
<SetupAssignments
  title="Default assignments"
  hint="Each switch fills that task's empty default slot."
  rows={[
    { id: 'chat', label: 'Chat default', checked: true, onCheckedChange: set.bind('chat') },
    { id: 'vision', label: 'Vision analysis', checked: false, hint: 'now: unset', onCheckedChange: set.bind('vision') },
  ]}
/>
```

## Related

- [`setup-review`](./setup-review.md) — the review step this section renders inside
- [`switch-row`](./switch-row.md) — the switch contract
