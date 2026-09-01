# RangeBar

Static low–high band with an optional value dot — reference ranges on a
number line (e.g. lab results). Renders nothing when `high <= low`.
Display-only by design.

## import

```ts
import { RangeBar } from '@neuronection/assistant-ui/range-bar'
```

## props

Extends `React.ComponentProps<'div'>`.

| prop | type | default | notes |
|---|---|---|---|
| `low` | `number` | — | band start (required, finite) |
| `high` | `number` | — | band end (required, > `low`) |
| `min` / `max` | `number` | `low - span` / `high + span` | visible domain; auto-shifted to keep non-negative domains |
| `value` | `number \| null` | — | the "you are here" dot |
| `unit` | `string` | — | appended to labels/titles |
| `label` | `string` | — | heading above the bar |
| `valueLabel` | `string` | `'You'` | dot title prefix |
| `className` | `string` | — | merges |

## controlled contract

None — pure display. Numbers in, pixels out; invalid ranges render `null`.

## labels & i18n

`label`/`valueLabel` are app strings; the axis ticks are formatted numbers
(`toLocaleString` for integers).

## examples

minimal:

```tsx
<RangeBar low={4} high={11} value={7.2} unit="mmol/L" />
```

realistic (health-style lab row):

```tsx
<RangeBar
  label={t('labs.glucose')}
  low={70}
  high={99}
  value={reading.mgDl}
  valueLabel={t('labs.yourValue')}
  unit="mg/dL"
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): static
band with label; display only (use visible text for the actual value if it
matters to AT users).

## related

[`ScaleSlider`](./scale-slider.md) (input counterpart),
[`Table`](./table.md).
