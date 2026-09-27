# UserMenu

Family-standard identity dropdown: avatar/identity trigger + switcher slot +
identity header (email + role badge) + status pill + appearance section
(language submenu, theme checkables) + app entries + logout. Composed from the `Menu`
primitives; Radix provides focus management, typeahead and collision
handling.

## import

```ts
import { UserMenu, type UserMenuItem } from '@neuronection/assistant-ui/user-menu'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `user` | `{ name?, email?, role?, avatarUrl? }` | — | structured identity; wins per field over the legacy flat props |
| `items` | `UserMenuItem[]` | `[]` | `{ id, label, icon?, tone?, disabled?, pending?, checked? }` |
| `onItemSelect` | `(id: string) => void` | — | fires with the item id (checkable items included) |
| `name` | `string` | — | legacy flat identity (shown in trigger + panel header) |
| `email` | `string` | — | legacy flat identity (shown in trigger + panel header, muted) |
| `avatarUrl` | `string` | — | image disc; falls back to initials disc |
| `initials` | `string` | from `name` | override disc text |
| `roleBadge` | `string` | `user.role` | badge text (app-translated); renders when set |
| `switcher` | `ReactNode` | — | app-composed switcher (ProfileSwitcher / TenantSwitcher) in a top section |
| `status` | `{ label: string; tone?: 'success' \| 'info' \| 'warning' }` | — | status pill under the identity block |
| `theme` | `'light' \| 'dark' \| 'system'` | — | controlled theme value for the appearance section |
| `onThemeChange` | `(theme) => void` | — | fires with the picked theme id |
| `themeLabels` | `{ light?, dark?, system? }` | — | one checkable row per label given; apps opt into exactly the options they support |
| `language` | `string` | — | controlled language id |
| `onLanguageChange` | `(id: string) => void` | — | fires with the picked language id |
| `languages` | `{ id, label }[]` | — | rendered as checkable rows in a **Language submenu** (Languages ▸) when `language`/`onLanguageChange` are set |
| `onLogout` | `() => void` | — | renders the danger logout row when set |
| `logoutLabel` | `string` | `'Log out'` | logout row text |
| `align` | `'start' \| 'end'` | `'end'` | panel alignment |
| `labels` | `{ openMenu?, account? }` | `'Open user menu'` | trigger aria-label; `account` is the identity section eyebrow |
| `icons` | `{ logout?, language?, themeLight?, themeDark?, themeSystem? }` | `LogOut`/`Globe`/`Sun`/`Moon`/`Monitor` | Lucide icon overrides |
| `className` | `string` | — | on the wrapper (`data-as="user-menu"`) |
| `triggerClassName` | `string` | — | on the trigger button |
| `contentClassName` | `string` | — | on the panel — e.g. `overflow-visible` when a switcher renders its own floating panel |

## render order

Fixed, top to bottom (each section renders only when its props are given;
separators render between adjacent sections):

1. `switcher` slot
2. identity block — `labels.account` eyebrow, avatar/initials disc, name,
   email, role badge
3. `status` pill
4. appearance — language rows, then theme rows
5. `items`
6. logout row

## controlled contract

`theme` + `onThemeChange`, `language` + `onLanguageChange` and `items` +
`onItemSelect` are fully controlled — the component never owns state; apps
re-render with the new values. With a single `themeLabels` entry (e.g. only
`dark`), selecting the active row reports the opposite theme (toggle
semantics); with multiple entries it reports the picked id.

## labels & i18n

Item labels, identity strings, status pill and role badge are app strings
(pass `t(...)` results); only `labels.openMenu` and `logoutLabel` have
English defaults.

## examples

minimal:

```tsx
<UserMenu
  email={user.email}
  onLogout={logout}
/>
```

realistic (full identity dropdown with switcher, status and appearance):

```tsx
<UserMenu
  user={{ name: user.fullName, email: user.email, role: user.role }}
  roleBadge={t('roles.admin')}
  switcher={<TenantSwitcher className="w-full" />}
  status={{ label: t('sync.synced'), tone: 'success' }}
  theme={theme}
  onThemeChange={setTheme}
  themeLabels={{ light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }}
  language={lang}
  onLanguageChange={setLanguage}
  languages={[
    { id: 'en', label: t('common.english') },
    { id: 'el', label: t('common.greek') },
  ]}
  items={[
    { id: 'profile', label: t('common.profile'), icon: UserRound },
    { id: 'settings', label: t('common.settings'), icon: Settings },
  ]}
  onItemSelect={(id) => id === 'profile' && navigate('/profile')}
  onLogout={() => void logout()}
  labels={{ openMenu: t('common.account'), account: t('common.account') }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): trigger
has `aria-haspopup="menu"` + labelled name; checkable entries are
`role="menuitemcheckbox"` with `aria-checked`; pending entries set
`aria-busy` and cannot be selected. Radix keyboard semantics asserted
(arrows, typeahead, Escape) and focus returns to the trigger on close.
Keydowns originating from typing targets inside the `switcher` slot are
excluded from menu typeahead, so embedded inputs keep normal text-entry
behavior (Escape still closes).

## related

[`Menu`](./menu.md) for custom menus, [`Popover`](./popover.md) for rich
panels (e.g. tenant switchers), [`ProfileSwitcher`](./profile-switcher.md)
for the switcher slot, [`SidebarNav`](./sidebar-nav.md) for the navigation
shell this usually sits in.
