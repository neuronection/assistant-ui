# FieldLabel

Label text with an inline `InfoButton` for the explanatory popover. The
popover carries `info` (+ optional `infoTitle`); `label` is the info
button's accessible name.

## import

```ts
import { FieldLabel } from '@neuronection/assistant-ui/field-label'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `children` | `ReactNode` | — | the label text |
| `info` | `ReactNode` | — | popover body |
| `infoTitle` | `ReactNode` | — | popover heading |
| `label` | `string` | — | info button accessible name (default `'Information'`) |
| `showOnHover` | `boolean` | — | forwarded to `InfoButton` (opacity-until-hover) |
| `className` | `string` | — | merges |

## controlled contract

None — wraps `InfoButton`, which manages its own open state (hover/click).

## labels & i18n

All strings are app content; pass a translated `label` for the icon button.

## examples

minimal:

```tsx
<FieldLabel label="What is a capability?" info="Caps filter task catalogs.">
  Capabilities
</FieldLabel>
```

realistic (study pattern):

```tsx
<FieldLabel
  label={t('settings.capsInfo')}
  infoTitle={t('settings.capsTitle')}
  info={t('settings.capsExplanation')}
>
  {t('settings.modelCaps')}
</FieldLabel>
```

## accessibility

See [accessibility.md](../accessibility.md#utilities-no-aria-contract):
presentational wrapper; the inner `InfoButton` is a labelled popover button
(see [`InfoButton`](./info-button.md)).

## related

[`InfoButton`](./info-button.md), [`InfoTooltip`](./tooltip.md).
