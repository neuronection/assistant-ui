# Tooltip

Radix tooltip compound — `TooltipProvider`, `Tooltip`, `TooltipTrigger`,
`TooltipContent` (inverted surface, max-w-64) — plus `InfoTooltip`, a
one-part info icon that speaks on focus/hover (`trigger="hover"`, default)
or click (becomes a popover).

## import

```ts
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  InfoTooltip,
  type InfoTooltipProps,
} from '@neuronection/assistant-ui/tooltip'
```

## props — TooltipContent

Radix Content props; `sideOffset` defaults to `6`.

## props — InfoTooltip

| prop | type | default | notes |
|---|---|---|---|
| `content` | `ReactNode` | — | tooltip body |
| `title` | `string` | — | bolded first line |
| `icon` | component | `Info` | |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | |
| `trigger` | `'hover' \| 'click'` | `'hover'` | click mode renders a popover |
| `label` | `string` | `'Information'` | trigger accessible name |
| `className` | `string` | — | on the trigger button |

## controlled contract

Radix semantics: tooltip opens on focus **and** hover, closes on blur/leave;
delay is Radix default. `InfoTooltip` click mode manages its own popover
state.

## labels & i18n

`label`/`title`/`content` are app content; translate `label` (accessible
name).

## examples

minimal:

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" aria-label={t('common.details')}><Info /></Button>
  </TooltipTrigger>
  <TooltipContent>{t('common.detailsHint')}</TooltipContent>
</Tooltip>
```

realistic (`InfoTooltip` next to a label):

```tsx
<label className="flex items-center gap-1 text-sm">
  {t('settings.temperature')}
  <InfoTooltip
    label={t('settings.temperatureInfo')}
    title={t('settings.temperature')}
    content={t('settings.temperatureExplanation')}
  />
</label>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): `role="tooltip"`;
**focus (Tab) shows the tooltip — not hover-only**; `InfoTooltip` has a
default accessible label and a click/popover mode.

## related

[`InfoButton`](./info-button.md), [`FieldLabel`](./field-label.md),
[`Popover`](./popover.md).
