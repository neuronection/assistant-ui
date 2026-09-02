# ChipInput

Editable chip list with an inline input: Enter/comma commits, paste splits
into chips, Backspace on empty input removes the last chip, blur commits the
draft, duplicates are ignored (case-insensitive). Pass `addLabel` to render
an explicit add button that commits the draft — useful when the multi-entry
affordance isn't obvious from the input alone.

## import

```ts
import { ChipInput } from '@neuronection/assistant-ui/chip-input'
```

## props

Extends `React.ComponentProps<'div'>` (minus `onChange`).

| prop | type | default | notes |
|---|---|---|---|
| `value` | `string[]` | — | chips |
| `onChange` | `(value: string[]) => void` | — | full next-array out |
| `placeholder` | `string` | — | shown on the input when there are no chips |
| `separators` | `string[]` | `[',']` | keys that commit the draft (newline always does) |
| `inputLabel` | `string` | `'Add'` | input accessible name |
| `removeLabel` | `string` | `'Remove'` | prefixed per chip (`Remove <chip>`) |
| `addLabel` | `string` | — | when set, renders an explicit add button with this accessible name |
| `disabled` | `boolean` | `false` | |
| `className` | `string` | — | merges |

## controlled contract

`value` in, whole-array `onChange` out (add/remove never mutate in place).
The draft text is internal and cleared on commit. Clicking the container
focuses the input. The add button commits the draft, re-focuses the input,
and is disabled while the draft is empty.

## labels & i18n

`inputLabel`/`removeLabel` are props with English defaults; translate at the
call site.

## examples

minimal:

```tsx
<ChipInput value={tags} onChange={setTags} placeholder="Add tag…" />
```

realistic (translated, custom separators):

```tsx
<ChipInput
  value={recipients}
  onChange={setRecipients}
  placeholder={t('mail.recipientsPlaceholder')}
  separators={[',', ';']}
  inputLabel={t('mail.addRecipient')}
  removeLabel={t('mail.removeRecipient')}
/>
```

with an explicit add button:

```tsx
<ChipInput
  value={hobbies}
  onChange={setHobbies}
  inputLabel="New hobby"
  addLabel="Add"
  placeholder="e.g. chess, sketching"
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): labelled input + chip
remove buttons (`Remove <chip>`), Enter/comma commit, Backspace removes the
last chip, paste splits, Tab reaches remove buttons and the input. The
optional add button is a labelled button, disabled while the draft is
empty.

## related

[`ChipList`](./chip-list.md) (read-only display), [`CapabilityChips`](./capability-chips.md).
