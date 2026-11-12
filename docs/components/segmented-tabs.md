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
| `wrap` | `boolean` | `false` | flow onto multiple rows when the labels do not fit one line (measured thumb) |

## controlled contract

`value` in, `onValueChange` out. Arrow keys call `onValueChange` too
(automatic activation — selection follows focus), then focus moves to the
new tab. The thumb is a decorative `span` (`aria-hidden`, `data-thumb`);
in the default single-row mode it is positioned by percentage width +
`translateX(activeIndex * 100%)`, so it adapts to any item count.

## wrapping

`wrap` trades the equal-width single-row grid for a `flex-wrap` strip of
content-sized pills: when the labels fit one line the strip renders as one
row; when they do not, tabs flow onto further rows instead of overflowing
or scrolling away. The thumb is then measured from the selected tab's real
geometry (rect delta, re-measured through a `ResizeObserver` and on every
selection change), so it slides across rows too. Semantics, roving focus
and keyboard activation are identical in both modes; the root carries a
`data-wrap` hook for app styling. Use it for long tab sets (8+ labels)
that overflow common content widths — short strips keep the default.

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

realistic (many tabs, wrap instead of scroll):

```tsx
<SegmentedTabs ariaLabel="Audit views" wrap items={AUDIT_TABS.map((tab) => ({
  value: tab, label: t(`audit.tab.${tab}`),
}))} value={active} onValueChange={setActive} />
```

## accessibility

[`accessibility.md`](../accessibility.md#segmentedtabs) — `role="tablist"`
+ `tab`, `aria-selected`, roving tabIndex, Arrow/Home/End with wrap-around
and disabled-skip; thumb is `aria-hidden` (also in `wrap` mode, where it is
measured rather than percentage-positioned). Pair each tab with its panel in
app code (panels stay app-owned).

## related modules

[`menu`](./menu.md) (action lists — not state),
[`view-toggle`](./view-toggle.md) (two-state pressed buttons),
[`pane`](./settings-shell.md) shells that host the panels.
