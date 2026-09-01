# ScaleSlider

Native range input paired with a numeric input, colored by position on a
green→red hue scale (`scaleColorForValue` exported). Emits `''` when cleared
— "no value" is a first-class state.

## import

```ts
import { ScaleSlider, scaleColorForValue } from '@neuronection/assistant-ui/scale-slider'
```

## props

Extends `React.ComponentProps<'div'>` (minus `onChange`).

| prop | type | default | notes |
|---|---|---|---|
| `value` | `number \| '' \| null \| undefined` | — | `''`/null = empty |
| `onChange` | `(value: number \| '') => void` | — | numeric or cleared |
| `min` / `max` | `number` | — | required |
| `step` | `number` | `1` | |
| `lowLabel` / `highLabel` | `string` | — | axis captions under the track |
| `showInput` | `boolean` | `true` | the paired number input |
| `disabled` | `boolean` | `false` | |
| `ariaLabel` | `string` | `'Scale'` | slider name (`<ariaLabel> value` for the input) |
| `className` | `string` | — | merges |

## controlled contract

`value` in, `onChange(number | '')` out: slider `change` emits numeric
values, typed input syncs, clearing the input emits `''`, blur clamps to
`min`/`max`. The thumb/border color is derived via `scaleColorForValue(min,
max, value)` (hue 142 → 0 across the domain).

## labels & i18n

`ariaLabel` + `lowLabel`/`highLabel` are app strings.

## examples

minimal:

```tsx
<ScaleSlider value={severity} onChange={setSeverity} min={0} max={10} ariaLabel={t('pain.severity')} />
```

realistic (health-style rating):

```tsx
<ScaleSlider
  value={entry.energy ?? ''}
  onChange={(v) => setEnergy(v)}
  min={0}
  max={10}
  lowLabel={t('mood.low')}
  highLabel={t('mood.high')}
  ariaLabel={t('mood.energy')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): `role="slider"` (native
range) paired with a number input; slider `change` emits numeric values;
typed input syncs; blur clamps; clearing emits `''`.

## related

[`RangeBar`](./range-bar.md), [`Input`](./input.md).
