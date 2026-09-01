# DatePicker

Popover calendar: days/months/years views, min/max range, arrow-key day
grid, `allowClear`, and an `unstyled` variant for embedding in app chrome.
Value is a `yyyy-MM-dd` string; date-fns formatting on the inside.

## import

```ts
import { DatePicker } from '@neuronection/assistant-ui/date-picker'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string \| null \| undefined` | — | ISO `yyyy-MM-dd` |
| `onChange` | `(value: string) => void` | — | ISO string out |
| `onClear` | `() => void` | — | reports alongside the clear button |
| `allowClear` | `boolean` | `false` | shows the × |
| `clearLabel` | `string` | `'Clear'` | |
| `placeholder` | `string` | `'Select date'` | |
| `displayFormat` | `string` | `'dd/MM/yyyy'` | date-fns format for the trigger |
| `minDate` / `maxDate` | `Date` | — | out-of-range days render disabled |
| `weekStartsOn` | `0 \| 1` | `1` | 0 = Sunday |
| `disabled` | `boolean` | `false` | |
| `required` | `boolean` | — | forwarded to the hidden input |
| `variant` | `'default' \| 'unstyled'` | `'default'` | unstyled drops the bordered trigger |
| `id` | `string` | auto | on the hidden form input |
| `name` | `string` | — | hidden `<input type="hidden">` for form wiring |
| `label` | `string` | `'Choose date'` | trigger accessible name |
| `prevLabel` / `nextLabel` | `string` | `'Previous'` / `'Next'` | |
| `className` / `panelClassName` | `string` | — | wrapper / popover panel |

## controlled contract

`value` in (ISO string or null), `onChange(yyyy-MM-dd)` out. Open state,
view mode (days/months/years) and focused day are internal and reset from
`value` on open. Clearing reports `onChange('')` + `onClear`.

## labels & i18n

`label`, `clearLabel`, `placeholder`, `prevLabel`/`nextLabel` are props;
month/weekday names come from date-fns (use date-fns `locale` at the app
level if you need translated calendars).

## examples

minimal:

```tsx
<DatePicker value={due} onChange={setDue} allowClear />
```

realistic (bounded range, translated, form-wired):

```tsx
<DatePicker
  value={deadline}
  onChange={setDeadline}
  minDate={today}
  maxDate={endOfYear}
  label={t('course.deadline')}
  clearLabel={t('common.clear')}
  name="deadline"
  required
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): button
trigger ("Choose date"), `role="grid"` day grid with roving tabindex,
`aria-current="date"` for today, ArrowRight/Down move focus, Enter selects
and closes, Escape closes, out-of-range days disabled, hidden input for
form wiring.

## related

[`Popover`](./popover.md), [`TimePicker`](./time-picker.md).
