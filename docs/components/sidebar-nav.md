# SidebarNav

Family-standard vertical navigation panel: items with icons and badges,
one nesting level with section dividers, controlled active state, optional
collapsed icon rail with hover flyouts, pinned secondary items, and
header/footer slots. Fully presentational + controlled (ADR-006) — the
router, role filtering, i18n and drawer shells stay app-side.

## import

```ts
import { SidebarNav, type NavItem, type NavChild } from '@neuronection/assistant-ui/sidebar-nav'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `items` | `NavItem[]` | — | `{ id, label, icon?, badge?, children?, disabled?, section? }`; `section` renders a divider above the item (top-level flat sidebars) or above the child (inside groups, first occurrence only); **pre-filtered by the app** (roles, feature flags) |
| `secondaryItems` | `NavItem[]` | — | flat items pinned below the scroll area, above `footer` (the Settings/About pattern); same rendering, active state, rail behavior and keyboard traversal order as `items`; rendered as a separate bordered region, omitted when empty |
| `activeId` | `string \| null` | — | the app resolves route → id |
| `onNavigate` | `(id: string) => void` | — | fires for leaves only; group triggers toggle instead |
| `collapsed` | `boolean` | `false` | controlled icon rail |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | |
| `collapsible` | `boolean` | `false` | renders the rail toggle handle (desktop only) |
| `expandedIds` | `string[]` | — | controlled group expansion |
| `onExpandedIdsChange` | `(ids: string[]) => void` | — | |
| `header` | `ReactNode` | — | slot above the list (brand, logo) |
| `footer` | `ReactNode` | — | slot below the list (settings, profile, version) |
| `labels` | `{ navAria?, expand?, collapse?, openGroup? }` | English defaults | aria-labels; apps translate |
| `className` | `string` | — | on the root `<nav>` (width default `w-64` / `w-20` rail) |
| `navClassName` | `string` | — | on the scrollable list region |

## controlled contract

- `activeId` + `onNavigate`: the library renders no routes. Map ids back to
  routes app-side (`onNavigate={(id) => navigate(routeFor[id])}`).
- `collapsed` + `onCollapsedChange`: persist the preference app-side
  (store or localStorage).
- Group expansion is uncontrolled by default (with auto-expand when
  `activeId` enters a group); pass `expandedIds` + `onExpandedIdsChange`
  to own it.
- Empty group (`children: []`, e.g. after app-side filtering) renders
  nothing.

## labels & i18n

Labels are plain strings — build the item array at render time so
`t(labelKey)` flows through (all three apps use i18next). Aria strings
come from `labels` with English defaults.

## examples

minimal:

```tsx
<SidebarNav
  items={[
    { id: '/', label: 'Home', icon: Home },
    { id: '/courses', label: 'Courses', icon: BookOpen },
  ]}
  activeId={resolveActiveId(pathname)}
  onNavigate={(id) => navigate(id)}
/>
```

realistic (groups + sections + rail + pinned items + slots):

```tsx
<SidebarNav
  items={menuItems.map(({ path, labelKey, icon, subItems }) => ({
    id: path,
    label: t(labelKey),
    icon,
    children: subItems?.map((s) => ({ id: s.path, label: t(s.labelKey), section: s.section })),
  }))}
  secondaryItems={[
    { id: '/settings', label: t('nav.settings'), icon: Settings },
    { id: '/about', label: t('nav.about'), icon: Info },
  ]}
  activeId={resolveActiveId(location)}
  onNavigate={(id) => navigate(id)}
  collapsed={sidebarCollapsed}
  onCollapsedChange={toggleSidebarCollapse}
  collapsible
  header={<BrandBlock />}
  footer={<SidebarFooter />}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure):
`<nav aria-label>` root, `aria-current="page"` on the active entry,
`aria-expanded`/`aria-controls` on group triggers, flyouts labelled by
their group. Keyboard: Tab traverses in order (main list first, then
pinned `secondaryItems`); Enter/Space activates; ArrowUp/ArrowDown move
(with arrows and Home/End crossing between the main list and pinned
items in visual order); ArrowRight expands (or enters) a group;
ArrowLeft collapses (or returns to the trigger); Home/End jump; rail
flyouts support arrows and Escape (focus returns to the trigger).

## related

[`SettingsShell`](./settings-shell.md) for two-pane settings layouts,
[`Breadcrumbs`](./breadcrumbs.md) for in-page path, [`Menu`](./menu.md) /
[`Popover`](./popover.md) for app-built dropdown panels.
