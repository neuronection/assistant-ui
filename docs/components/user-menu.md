# UserMenu

Family-standard user menu: avatar/identity trigger + identity header +
action list (including checkable items for theme/language toggles).
Composed from the `Menu` primitives; Radix provides focus management,
typeahead and collision handling.

## import

```ts
import { UserMenu, type UserMenuItem } from '@neuronection/assistant-ui/user-menu'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `items` | `UserMenuItem[]` | — | `{ id, label, icon?, tone?, disabled?, pending?, checked? }` |
| `onItemSelect` | `(id: string) => void` | — | fires with the item id (checkable items included) |
| `name` | `string` | — | shown in trigger + panel header |
| `email` | `string` | — | shown in trigger + panel header, muted |
| `avatarUrl` | `string` | — | image disc; falls back to initials disc |
| `initials` | `string` | from `name` | override disc text |
| `align` | `'start' \| 'end'` | `'end'` | panel alignment |
| `labels` | `{ openMenu?: string }` | `'Open user menu'` | trigger aria-label; apps translate |
| `className` | `string` | — | on the wrapper (`data-as="user-menu"`) |

## controlled contract

None — the menu is stateless beyond Radix's open state. All behavior is
expressed through `items` + `onItemSelect` (e.g. a language toggle item is
re-rendered with the new `checked` value after selection).

## labels & i18n

Item labels and identity strings are app strings (pass `t(...)` results);
only `labels.openMenu` has an English default.

## examples

minimal:

```tsx
<UserMenu
  email={user.email}
  items={[{ id: 'signout', label: 'Sign out', tone: 'danger', icon: LogOut }]}
  onItemSelect={(id) => id === 'signout' && logout()}
/>
```

realistic (health-style header menu with toggles):

```tsx
<UserMenu
  name={user.fullName}
  email={user.email}
  items={[
    { id: 'profile', label: t('nav.profile'), icon: UserRound },
    { id: 'lang', label: 'Ελληνικά', icon: Globe, checked: lang === 'el' },
    { id: 'theme', label: t('nav.darkMode'), icon: Moon, checked: dark },
    { id: 'signout', label: t('nav.signOut'), icon: LogOut, tone: 'danger' },
  ]}
  onItemSelect={(id) => {
    if (id === 'signout') logout()
    if (id === 'lang') toggleLanguage()
    if (id === 'theme') toggleTheme()
  }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): trigger
has `aria-haspopup="menu"` + labelled name; checkable entries are
`role="menuitemcheckbox"` with `aria-checked`; pending entries set
`aria-busy` and cannot be selected. Radix keyboard semantics asserted
(arrows, typeahead, Escape).

## related

[`Menu`](./menu.md) for custom menus, [`Popover`](./popover.md) for rich
panels (e.g. tenant switchers), [`SidebarNav`](./sidebar-nav.md) for the
navigation shell this usually sits in.
