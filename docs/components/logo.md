# Logo

Family brand marks and wordmarks as inline SVGs: `NeuronectionMark`,
`NeuronectionWordmark` (+ `mono`), and per-app marks `CareerMark`,
`StudyMark`, `HealthMark`. `useLogoId` is exported for building unique SVG
ids in app-drawn marks.

## import

```ts
import {
  NeuronectionMark,
  NeuronectionWordmark,
  CareerMark,
  StudyMark,
  HealthMark,
  useLogoId,
  type LogoProps,
} from '@neuronection/assistant-ui/logo'
```

## props

All marks accept `LogoProps` (extends SVG props minus `children`):

| prop | type | default | notes |
|---|---|---|---|
| `size` | `number \| string` | `32` (marks) / `20` (wordmark) | width & height unless overridden |
| `theme` | `'light' \| 'dark'` | `'light'` | swaps the art variant; also sets `data-as-theme` |
| `title` | `string` | — | accessible `<title>` inside the SVG |
| `width` / `height` | `number \| string` | `size` | override the square box |
| `className` / …svg props | — | — | merged/passed through |

`NeuronectionWordmark` adds `mono?: boolean` (default `false`) for the
single-color variant.

## controlled contract

None — static SVGs with an internal `useId` for gradient deduplication.

## labels & i18n

`title` is the accessible name — pass your app name or omit when the logo
sits next to visible text.

## examples

minimal:

```tsx
<HealthMark size={40} title="Health Assistant" />
```

realistic (dark theme wordmark in a footer):

```tsx
<NeuronectionWordmark size={20} mono theme="dark" title="Neuronection" />
```

## accessibility

See [accessibility.md](../accessibility.md#utilities-no-aria-contract):
presentational unless `title` is provided (then the SVG exposes its
`<title>`).

## related

[`AboutPanel`](./about.md) (uses the marks by default),
[`ThemeScope`](./theme-scope.md).
