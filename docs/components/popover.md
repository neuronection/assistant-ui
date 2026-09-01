# Popover

Radix popover compound — `Popover`, `PopoverTrigger`, `PopoverAnchor`,
`PopoverClose`, `PopoverContent`. Thin pass-through parts with the family
surface styling and `--as-z-popover` stacking.

## import

```ts
import {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
} from '@neuronection/assistant-ui/popover'
```

## props

`Popover`/`PopoverTrigger`/`PopoverAnchor`/`PopoverClose` forward their
Radix props (incl. controlled `open`/`onOpenChange`). `PopoverContent`:

| prop | type | default | notes |
|---|---|---|---|
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | |
| `sideOffset` | `number` | `6` | |
| `className` | `string` | — | merges (default width `w-72`, padding `p-4`) |
| …Radix Content props | — | — | `side`, `onOpenAutoFocus`, … |

## controlled contract

Radix semantics: `open` + `onOpenChange` on the Root for controlled use;
Escape and outside click report `onOpenChange(false)` and restore focus to
the trigger.

## labels & i18n

None of its own — content is app-rendered.

## examples

minimal:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">{t('common.filter')}</Button>
  </PopoverTrigger>
  <PopoverContent className="w-56">{/* filter fields */}</PopoverContent>
</Popover>
```

realistic (controlled open, study pattern):

```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon" aria-label={t('common.options')}>
      <SlidersHorizontal className="size-4" aria-hidden />
    </Button>
  </PopoverTrigger>
  <PopoverContent align="end">
    <ViewToggle view={view} onChange={setView} />
  </PopoverContent>
</Popover>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): Escape closes and
restores focus to the trigger.

## related

[`PopoverButton`](./popover-button.md) (self-contained),
[`Combobox`](./combobox.md) and [`DatePicker`](./date-picker.md) (built on it).
