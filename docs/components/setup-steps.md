# setup-steps

Two-plus-step wizard progress ("Connect" → "Choose defaults"): numbered
badges, a done check on the passed steps, the current step highlighted,
hairline connectors between steps. The guided setup's tiles and key form
are one mental unit (step 1); the review is step 2 — the header makes
that split visible before the user commits.

## Import

```ts
import { SetupSteps } from '@neuronection/assistant-ui/setup-steps'
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `steps` | `SetupStep[]` | — | `{ id, label }` in display order |
| `current` | `number` | — | zero-based active index; past the last step marks all done, negative marks all upcoming |
| `label` | `string` | `'Setup progress'` | accessible name for the progress list |
| `className` | extras | — | merges onto the `ol` |

## Controlled contract

Display-only: the current step is a prop; steps are not interaction
targets. The active step carries `aria-current="step"`.

## Accessibility

An `aria-label`ed ordered list; the numeric/done markers are
`aria-hidden` while the step LABEL carries the state in text (done gets
color + check, current gets emphasis — state never rides color alone).
See [accessibility.md](../accessibility.md#setup-steps).

## Example

```tsx
<SetupSteps
  steps={[{ id: 'connect', label: 'Connect' }, { id: 'defaults', label: 'Choose defaults' }]}
  current={0}
/>
```

## Related

- [`setup-first-run-card`](./setup-first-run-card.md) — the guided setup's entry
- [`setup-review`](./setup-review.md) — the completion step
