# TimePicker

Clock-face time picker in a popover: editable hour/minute fields, AM/PM
segmented control (12h UI over a 24h value), SVG clock with a draggable
ring, Done button. `TimePickerContent` (the popover body) is exported for
custom hosts — that's what `TimeList` embeds.

## import

```ts
import {
  TimePicker,
  TimePickerContent,
  type TimePickerProps,
} from '@neuronection/assistant-ui/time-picker'
```

## props — TimePicker

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string \| null \| undefined` | — | 24-hour `HH:MM` |
| `onChange` | `(value: string) => void` | — | 24-hour `HH:MM` out |
| `placeholder` | `string` | — | trigger text when empty |
| `disabled` | `boolean` | `false` | |
| `id` | `string` | — | |
| `size` | `number` | `240` | clock face diameter in px |
| `label` | `string` | — | accessible trigger name (+ optional visible label) |
| `hourLabel` | `string` | `'Hour'` | |
| `minuteLabel` | `string` | `'Minute'` | |
| `doneLabel` | `string` | `'Done'` | |
| `variant` | `'default' \| 'unstyled'` | `'default'` | |
| `className` | `string` | — | merges onto the wrapper |

## props — TimePickerContent

`{ value, onChange, onDone?, size? (240), hourLabel?, minuteLabel?,
doneLabel?, className? }` — owns a working copy seeded from `value` on
mount; the parent should unmount it when the host popover closes.

## controlled contract

`value` (24h `HH:MM` string) in, `onChange` out while editing; `onDone`
reports the explicit Done button. Invalid/empty values stay `null` until a
valid time is assembled.

## labels & i18n

`label`, `hourLabel`, `minuteLabel`, `doneLabel` are props with English
defaults.

## examples

minimal:

```tsx
<TimePicker value={start} onChange={setStart} label={t('common.startTime')} />
```

realistic (custom host via `TimePickerContent`):

```tsx
<PopoverContent className="w-[300px] p-0">
  <TimePickerContent
    value={value}
    onChange={setValue}
    onDone={() => setOpen(false)}
    hourLabel={t('common.hour')}
    minuteLabel={t('common.minute')}
    doneLabel={t('common.done')}
  />
</PopoverContent>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): trigger
("Choose time"), clock face as `role="slider"`, hour/minute textboxes,
AM/PM segmented buttons, ArrowRight increments the hour, typed hour + Tab
commits a 24-hour value (14 → 2 PM), Done and Escape close.

## related

[`TimeList`](./time-list.md), [`Popover`](./popover.md).
