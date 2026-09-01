# InfoButton

Small round info icon that opens a popover panel. `showOnHover` fades it in
when the surrounding `group` is hovered (always visible on focus-within);
click/hover behavior and lazy children come from [`PopoverButton`](./popover-button.md).

## import

```ts
import { InfoButton } from '@neuronection/assistant-ui/info-button'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `children` | `ReactNode` | — | popover body |
| `title` | `ReactNode` | — | bolded first line in the panel |
| `label` | `string` | `'Information'` | trigger accessible name |
| `showOnHover` | `boolean` | `true` | fade-in until the parent `group` is hovered |
| `openOnHover` | `boolean` | `true` | panel opens on trigger hover |
| `className` | `string` | — | merges onto the wrapper span |

## controlled contract

Open state is internal (via `PopoverButton`). Mouse events are stopped from
propagating so info buttons survive inside clickable rows/cards.

## labels & i18n

`label` and `title` are app content — translate `label` (it is the
accessible name).

## examples

minimal:

```tsx
<InfoButton label="Why local?">Runs on your machine; no data leaves it.</InfoButton>
```

realistic (inside a card header group):

```tsx
<CardHeader className="group">
  <CardTitle className="flex items-center gap-1">
    {t('health.heartRate')}
    <InfoButton label={t('common.moreInfo')} title={t('health.hrTitle')}>
      {t('health.hrExplanation')}
    </InfoButton>
  </CardTitle>
</CardHeader>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): popover button with
default name "Information", opens on click, content exposed to AT; fade-in
never hides it from keyboard focus (`focus-within:opacity-100`).

## related

[`FieldLabel`](./field-label.md), [`PopoverButton`](./popover-button.md),
[`InfoTooltip`](./tooltip.md).
