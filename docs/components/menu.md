# Menu

Radix dropdown-menu compound — `Menu`, `MenuTrigger`, `MenuContent`,
`MenuGroup`, `MenuItem`, `MenuSeparator`, `MenuLabel` — plus `ActionMenu`,
a self-contained trigger + items-driven menu. `MenuItem` supports
`icon`, `danger` and `pending` (spinner + disabled).

## import

```ts
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  ActionMenu,
  type ActionMenuItem,
} from '@neuronection/assistant-ui/menu'
```

## props — MenuItem

Extends Radix `DropdownMenu.Item` props.

| prop | type | default | notes |
|---|---|---|---|
| `icon` | `LucideIcon` | — | leading icon |
| `danger` | `boolean` | — | danger tint |
| `pending` | `boolean` | — | spinner icon, disabled + `aria-busy` |
| `disabled` | `boolean` | — | forwarded |
| `onSelect` | `() => void` | — | |

## props — MenuContent

Radix `Content` props; `sideOffset` defaults to `6`, `collisionPadding` to
`8`. Portals to the body and stacks via `--as-z-popover`.

## props — ActionMenu

| prop | type | default | notes |
|---|---|---|---|
| `label` | `string` | — | trigger accessible name |
| `trigger` | `ReactNode` | — | icon/content inside the round trigger |
| `items` | `ActionMenuItem[]` | — | `{ key, label, icon?, danger?, disabled?, pending?, onSelect }` |
| `align` | `'start' \| 'center' \| 'end'` | `'end'` | |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | |
| `triggerClassName` / `panelClassName` | `string` | — | merges |
| `disabled` | `boolean` | `false` | |

## controlled contract

`Menu` (Root) accepts Radix `open`/`onOpenChange` for controlled use;
`ActionMenu` is uncontrolled. Menus ship `modal={false}` where composed
(`ActionMenu`, [`ContextMenu`](./context-menu.md)) so the rest of the app
stays interactive/announced. Items select on click; the trigger opens on
pointerdown (Radix behavior).

## labels & i18n

Item labels + `label` are app strings; translate at the call site.

## examples

minimal (compound):

```tsx
<Menu>
  <MenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal /></Button>
  </MenuTrigger>
  <MenuContent>
    <MenuLabel>Note</MenuLabel>
    <MenuItem icon={Pencil} onSelect={rename}>{t('common.rename')}</MenuItem>
    <MenuSeparator />
    <MenuItem icon={Trash2} danger onSelect={remove}>{t('common.delete')}</MenuItem>
  </MenuContent>
</Menu>
```

realistic (items-driven, pending state):

```tsx
<ActionMenu
  label={t('common.actions')}
  trigger={<MoreVertical className="size-4" aria-hidden />}
  items={[
    { key: 'export', label: t('common.export'), icon: Download, onSelect: exportItem },
    { key: 'sync', label: t('common.sync'), icon: RefreshCw, pending: syncing, onSelect: sync },
  ]}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): `role="menu"` /
`menuitem`, ArrowDown moves focus, Enter selects, Escape closes, disabled
items carry `data-disabled` and are not selectable.

## related

[`ContextMenu`](./context-menu.md), [`AiActionsDropdown`](./ai-actions-dropdown.md).
