# ChipList

Read-only chip display for a list of short strings, with optional per-chip
remove and click-through. Six tint variants. Renders `null` when empty
unless `emptyText` is set (then a muted paragraph).

## import

```ts
import { ChipList, type ChipVariant } from '@neuronection/assistant-ui/chip-list'
```

## props

Extends `React.ComponentProps<'div'>`.

| prop | type | default | notes |
|---|---|---|---|
| `items` | `ReadonlyArray<string \| null \| undefined>` | — | null/undefined entries are dropped |
| `onRemove` | `(item: string) => void` | — | renders a per-chip × button |
| `onItemClick` | `(value: string, index: number) => void` | — | chip content becomes a button |
| `variant` | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | tint |
| `emptyText` | `string` | — | muted paragraph when the cleaned list is empty |
| `showChevron` | `boolean` | `false` | chevron on clickable chips (with `onItemClick`) |
| `removeLabel` | `string` | `'Remove'` | per-chip accessible name (`Remove <item>`) |
| `className` | `string` | — | merges |

## controlled contract

Stateless: the cleaned `items` array is rendered as-is; removals/clicks
report out with the item string (clicks also carry the index). With
`onItemClick`, each chip's content is a real `<button>`.

## labels & i18n

`removeLabel`/`emptyText` are props; chip text is `items`.

## examples

minimal:

```tsx
<ChipList items={['cardio', 'bloodwork']} />
```

realistic (removable, translated):

```tsx
<ChipList
  items={allergies}
  onRemove={(item) => remove(item)}
  removeLabel={t('health.removeAllergy')}
  emptyText={t('health.noAllergies')}
  variant="warning"
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): remove buttons named
`<removeLabel> — <item>` (native button semantics).

## related

[`ChipInput`](./chip-input.md), [`Badge`](./badge.md),
[`TechChips`](./about.md).
