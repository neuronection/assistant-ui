# CheckIndicator

16px tri-state checkbox button (`role="checkbox"`, `aria-checked` incl.
`mixed`). For row-bulk-select headers and item rows; stops propagation so it
works inside clickable rows/cards.

## import

```ts
import { CheckIndicator } from '@neuronection/assistant-ui/check-indicator'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `checked` | `boolean` | — | visual + `aria-checked` |
| `label` | `string` | — | accessible name (required) |
| `onToggle` | `() => void` | — | click handler (app flips `checked`) |
| `mixed` | `boolean` | `false` | renders a dash, `aria-checked="mixed"` |
| `className` | `string` | — | merges |

## controlled contract

`checked`/`mixed` in, `onToggle` out. The button calls
`event.stopPropagation()` before `onToggle` so rows stay clickable.

## labels & i18n

`label` is the accessible name — pass a translated string (e.g.
`{t('common.select')} — {item.name}`).

## examples

minimal:

```tsx
<CheckIndicator checked={all} mixed={some} label="Select all" onToggle={toggleAll} />
```

realistic inside a clickable list row:

```tsx
<div role="button" onClick={openItem} className="cursor-pointer">
  <CheckIndicator
    checked={selectedIds.has(item.id)}
    label={`${t('common.select')} — ${item.name}`}
    onToggle={() => toggle(item.id)}
  />
  <span>{item.name}</span>
</div>
```

## accessibility

See [accessibility.md](../accessibility.md#actions): `role="checkbox"`,
`aria-checked` incl. `mixed`, Enter and Space toggle.

## related

[`SelectionBar`](./selection-bar.md), [`Marquee`](./marquee.md) (keyboard
alternative for drag selection).
