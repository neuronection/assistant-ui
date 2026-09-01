# CapabilityChips

Toggle group (or static badge row) for capability tags like `text`, `vision`,
`tools`. `variant="toggle"` renders `aria-pressed` buttons; `variant="badge"`
renders non-interactive spans. `minSelected` keeps the last selected chip
on instead of silently refusing removals.

## import

```ts
import {
  CapabilityChips,
  type CapabilityDescriptor,
} from '@neuronection/assistant-ui/capability-chips'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `caps` | `CapabilityDescriptor[]` | — | `{ value, label, icon? }`; labels/icons are app-owned |
| `selected` | `string[]` | — | selected cap values |
| `onToggle` | `(value: string) => void` | — | omit (or `variant="badge"`) for non-interactive |
| `variant` | `'toggle' \| 'badge'` | `'toggle'` | badge variant renders spans |
| `minSelected` | `number` | `0` | when `selected.length <= minSelected`, selected chips disable instead of toggling off |
| `disabled` | `boolean` | `false` | |
| `ariaLabel` | `string` | — | group accessible name (interactive variant only) |
| `className` | `string` | — | merges onto the root |

## controlled contract

`selected` is the source of truth; each click reports `onToggle(value)` —
the app computes the next array. With `minSelected`, the component disables
the chips that would drop the selection below the minimum (never silently
ignores clicks).

## labels & i18n

`CapabilityDescriptor.label` is app-provided — build descriptors from your
i18n dictionary:

```ts
const caps = ['text', 'vision', 'tools'].map((value) => ({
  value,
  label: t(`settings.caps.${value}`),
  icon: CAP_ICONS[value],
}))
```

## examples

minimal (toggle):

```tsx
<CapabilityChips
  caps={[{ value: 'text', label: 'Text' }, { value: 'vision', label: 'Vision' }]}
  selected={selected}
  onToggle={(value) => toggle(value)}
  ariaLabel="Capabilities"
/>
```

realistic — badge row on a registry model row (from study `ModelsTab`):

```tsx
<CapabilityChips
  variant="badge"
  caps={model.caps.map(descriptorFor)}
  selected={model.caps}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#settings-blocks): `role="group"`
of `aria-pressed` toggle buttons; badge variant renders non-interactive
spans; below `minSelected` the last chip disables instead of silently
refusing.

## related

[`ModelRegistry`](./model-registry.md),
[`TaskAssignmentPicker`](./task-assignment-picker.md).
