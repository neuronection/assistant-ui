# ContextMenu

Coordinate-anchored menu: render it with `{x, y}` (pointer position) and an
item list; it opens when `items` is non-empty and reports `onClose`.
`modal={false}` under the hood so it layers safely next to other overlays.
Disabled items render inert with an optional `hint` tooltip. Items may be
plain actions or `{ key, separator: true }` entries — a non-focusable divider
that groups related actions (e.g. filter actions above navigation).

## import

```ts
import {
  ContextMenu,
  type ContextMenuEntry,
  type ContextMenuItem,
} from '@neuronection/assistant-ui/context-menu'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `x` | `number` | — | viewport X for the anchor |
| `y` | `number` | — | viewport Y for the anchor |
| `items` | `ContextMenuEntry[]` | — | action: `{ key, label, icon?, onSelect?, danger?, disabled?, hint? }` · divider: `{ key, separator: true }` |
| `onClose` | `() => void` | — | called on select and on dismiss |
| `className` | `string` | — | merges onto the content panel |

## controlled contract

App owns `{x, y, items}` state (typically set in an `onContextMenu`
handler); the menu is open exactly while `items.length > 0`. Selection calls
the item's `onSelect` and then `onClose`. Keep `modal={false}` semantics
when composing: focus restore on close is suppressed so inline editors an
item spawned don't get blurred away.

## labels & i18n

Item labels are app strings.

## examples

minimal:

```tsx
<ContextMenu
  x={pos.x}
  y={pos.y}
  items={pos ? [{ key: 'open', label: 'Open', onSelect: open }] : []}
  onClose={() => setPos(null)}
/>
```

realistic (grouped entity menu — filter actions above a navigation group):

```tsx
<div
  onContextMenu={(event) => {
    event.preventDefault()
    setMenu({ x: event.clientX, y: event.clientY, item })
  }}
>
  <ContextMenu
    x={menu.x}
    y={menu.y}
    items={[
      { key: 'include', label: t('filters.menu.include', { value }), onSelect: include },
      { key: 'exclude', label: t('filters.menu.exclude', { value }), danger: true, onSelect: exclude },
      { key: 'sep', separator: true },
      { key: 'page', label: t('filters.menu.openPage'), icon: ExternalLink, onSelect: openPage },
    ]}
    onClose={() => setMenu(null)}
  />
</div>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): `role="menu"` /
`menuitem` at x/y, Enter selects and reports `onClose`, Escape closes,
disabled items carry `data-disabled` and are not selectable.

## related

[`Menu`](./menu.md) (trigger-anchored + `ActionMenu`),
[`MenuItem` reuse](./menu.md).
