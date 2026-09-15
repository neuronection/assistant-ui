# SegmentedTabs

Pill-style segmented control with a raised, sliding thumb — a compact tab
switcher where every option stays visible (inspector panels, view/filter
switches). Full ARIA tabs semantics: the active tab is the only tab stop
(roving `tabIndex`), arrows move selection with wrap-around, Home/End jump
to the ends, disabled segments are skipped.

## import

```ts
import { SegmentedTabs } from '@neuronection/assistant-ui/segmented-tabs'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `items` | `SegmentedTabsItem[]` | — | `{ value, label, icon?, disabled? }` |
| `value` | `string` | — | active segment's `value` |
| `onValueChange` | `(value: string) => void` | — | selection follows click *and* arrow keys |
| `ariaLabel` | `string` | — | accessible name of the `tablist` (required) |
| `className` | `string` | — | merges onto the root |

## controlled contract

`value` in, `onValueChange` out. Arrow keys call `onValueChange` too
(automatic activation — selection follows focus), then focus moves to the
new tab. The thumb is a decorative `span` (`aria-hidden`, `data-thumb`)
positioned by percentage width + `translateX(activeIndex * 100%)`, so it
adapts to any item count.

## labels & i18n

`ariaLabel` names the whole group; item `label`s are the accessible names
of the tabs — pass translated strings. Icons are decorative.

## styling hooks

Tokens only (`--as-muted` track, `--as-surface-raised` thumb,
`--as-accent` active icon, `--as-focus-ring`). The root carries
`data-as="segmented-tabs"`; apps restyle via tokens/`data-as`, never class
names.

## examples

minimal:

```tsx
<SegmentedTabs items={items} value={value} onValueChange={setValue} ariaLabel="Views" />
```

realistic (app inspector):

```tsx
<SegmentedTabs
  ariaLabel="Inspector panels"
  items={[
    { value: 'context', label: t('inspector.context'), icon: Layers },
    { value: 'design', label: t('inspector.design'), icon: Palette },
    { value: 'sections', label: t('inspector.sections'), icon: LayoutList },
  ]}
  value={tab}
  onValueChange={(next) => setTab(next as InspectorTab)}
/>
```

## accessibility

[`accessibility.md`](../accessibility.md#segmentedtabs) — `role="tablist"`
+ `tab`, `aria-selected`, roving tabIndex, Arrow/Home/End with wrap-around
and disabled-skip; thumb is `aria-hidden`. Pair each tab with its panel in
app code (panels stay app-owned).

## related modules

[`menu`](./menu.md) (action lists — not state),
[`view-toggle`](./view-toggle.md) (two-state pressed buttons),
[`pane`](./settings-shell.md) shells that host the panels.
