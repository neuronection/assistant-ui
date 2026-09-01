# PopoverButton

Self-contained popover: trigger button + panel in one component. Hover-open
mode, lazy children (pass a function; called only while open), controlled or
internal open state, and a `closeSignal` counter for app-driven closing
(e.g. close on outside state change).

## import

```ts
import { PopoverButton } from '@neuronection/assistant-ui/popover-button'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `trigger` | `ReactNode` | — | content inside the round trigger |
| `children` | `ReactNode \| (() => ReactNode)` | — | panel content; function = lazy (rendered only while open) |
| `label` | `string` | — | trigger + panel accessible name (required) |
| `align` | `'start' \| 'center' \| 'end'` | `'end'` | |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | |
| `sideOffset` | `number` | `8` | |
| `panelClassName` / `triggerClassName` | `string` | — | merges |
| `openOnHover` | `boolean` | `false` | hover opens; click is prevented then |
| `focusOnOpen` | `boolean` | `true` | panel grabs focus on open |
| `preserveFocus` | `boolean` | `false` | `onMouseDown` preventDefault on the trigger |
| `closeSignal` | `number` | `0` | increment to force-close |
| `open` / `defaultOpen` / `onOpenChange` | — | — | controlled or uncontrolled |
| `disabled` | `boolean` | `false` | |

## controlled contract

Pass `open` to control; otherwise internal with `defaultOpen`. All transitions
report via `onOpenChange`. `closeSignal > 0` closes the panel from the app
(the counter, not the value, is the trigger).

## labels & i18n

`label` is required — it names both the trigger (`aria-label`) and the panel
(`role="dialog"` + `aria-label`). Translate it.

## examples

minimal:

```tsx
<PopoverButton label="Filters" trigger={<Filter className="size-4" aria-hidden />}>
  {filterFields}
</PopoverButton>
```

realistic (lazy children + closeSignal, study pattern):

```tsx
const [closeSignal, setCloseSignal] = useState(0)

<PopoverButton
  label={t('mail.composeOptions')}
  trigger={<Sparkles className="size-4" aria-hidden />}
  closeSignal={closeSignal}
  openOnHover={false}
>
  {() => (
    <ActionPicker
      onPicked={(action) => {
        apply(action)
        setCloseSignal((n) => n + 1)
      }}
    />
  )}
</PopoverButton>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): Radix popover behind a
button; Escape closes the panel.

## related

[`Popover`](./popover.md), [`InfoButton`](./info-button.md) (built on this),
[`Menu`](./menu.md).
