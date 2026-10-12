# SwitchRow

Labeled `role="switch"` row with an animated knob — the standalone settings
toggle the family's setup surfaces (desktop/study/health) previously
hand-rolled. Full-width bordered row: visible label plus an optional sub-line
(`currentValue` — apps render the live value there, e.g. `now: gpt-5.6`),
and the switch on the right.

## import

```ts
import { SwitchRow } from '@neuronection/assistant-ui/switch-row'
```

## props

Extends `React.ComponentProps<'button'>` (spread onto the switch button).

| prop | type | default | notes |
|---|---|---|---|
| `label` | `ReactNode` | — | visible row label; doubles as the accessible name |
| `checked` | `boolean` | — | controlled on/off (`aria-checked`) |
| `onCheckedChange` | `(checked: boolean) => void` | — | controlled toggle |
| `currentValue` | `ReactNode` | — | sub-line under the label (`now: …`) |
| `disabled` | `boolean` | `false` | inert + dimmed |

## controlled contract

Pure controlled: `checked` in, `onCheckedChange(!checked)` out on click,
Enter and Space. No internal state.

## labels & i18n

`label` and `currentValue` are caller content — pass translated strings.

## examples

```tsx
<SwitchRow
  label={t('settings.setup.review.fillText')}
  currentValue={`${t('settings.setup.review.now')}: ${currentChatModel ?? t('settings.setup.review.unset')}`}
  checked={fillText}
  onCheckedChange={setFillText}
/>
```

## accessibility

Native `<button>` with `role="switch"` + `aria-checked`; Enter/Space toggle
(asserted in `tests/switch-row.test.tsx`); the knob is `aria-hidden`.

## related

[`SetupReview`](./setup-review.md) renders these rows; see the
[ai-settings guide](../guides/ai-settings.md).
