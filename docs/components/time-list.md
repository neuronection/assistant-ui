# TimeList

Chip-based editor for a list of `HH:MM` times: each chip opens the clock
picker, an add pill appends a slot, `maxItems` caps the list. For a single
time use [`TimePicker`](./time-picker.md).

## import

```ts
import { TimeList } from '@neuronection/assistant-ui/time-list'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string[]` | — | 24-hour `HH:MM` strings |
| `onChange` | `(next: string[]) => void` | — | fully replaced list out |
| `label` | `string` | — | small uppercase heading |
| `hint` | `string` | — | helper text under the label |
| `addLabel` | `string` | `'Add time'` | add pill |
| `emptyLabel` | `string` | — | shown when the list is empty |
| `maxItems` | `number` | — | caps the chips; add pill hides at max |
| `maxItemsLabel` | `(n: number) => string` | `` (n) => `Maximum of ${n} items.` `` | note at max |
| `removeLabel` | `string` | `'Remove time'` | per-chip × accessible name |
| `disabled` | `boolean` | `false` | disables every chip + the add pill |
| `clockSize` | `number` | `220` | picker clock diameter |
| `className` | `string` | — | merges |

## controlled contract

`value` in (array of `HH:MM`), whole-list `onChange` out (add appends
`'09:00'`, edit replaces an index, remove filters). Chip open state is
internal.

## labels & i18n

All strings are props with English defaults (`maxItemsLabel` is a function
for proper pluralization).

## examples

minimal:

```tsx
<TimeList value={medTimes} onChange={setMedTimes} addLabel={t('health.addTime')} />
```

realistic (capped medication reminders):

```tsx
<TimeList
  value={reminders}
  onChange={setReminders}
  label={t('health.reminderTimes')}
  hint={t('health.reminderHint')}
  maxItems={4}
  maxItemsLabel={(n) => t('health.maxTimes', { count: n })}
  removeLabel={t('common.removeTime')}
  emptyLabel={t('health.noTimes')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): chips with
`Edit <time>` buttons, add/remove/edit via native button semantics, remove
buttons named via `removeLabel`; the clock inside is the `TimePicker`
contract.

## related

[`TimePicker`](./time-picker.md), [`DatePicker`](./date-picker.md).
