# ProfileSwitcher

Family-standard profile switcher (identity-auth §6 "switching is data-level
UX"): current-profile trigger + panel listing the user's profiles with
select, create, rename, set-Default and delete flows. Presentational +
controlled (ADR-006): profiles in, events out — no fetching, no stores.

## import

```ts
import {
  ProfileSwitcher,
  type ProfileItem,
} from '@neuronection/assistant-ui/profile-switcher'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `profiles` | `ProfileItem[]` | — | `{ id, name, is_default?, color? }` — `color` is an optional accent (`#rrggbb`); rendered as a letter swatch |
| `currentId` | `string \| null` | — | the active profile; falls back to the first entry for the trigger text |
| `onSelect` | `(profile: ProfileItem) => void` | — | row activation; the panel closes afterwards |
| `onCreate` | `(name: string) => void \| Promise<unknown>` | — | create form; receives the trimmed name, never empty |
| `onRename` | `(profile: ProfileItem, name: string) => void \| Promise<unknown>` | — | inline rename; trimmed, skipped when unchanged |
| `onDelete` | `(profile: ProfileItem) => void \| Promise<unknown>` | — | trash action per row; confirmations belong to the caller |
| `onSetDefault` | `(profile: ProfileItem) => void \| Promise<unknown>` | — | optional "make Default" per row (identity-auth §12); omitted ⇒ no star action |
| `loading` | `boolean` | `false` | replaces the list with a loading note |
| `error` | `string \| null` | `null` | shown as `role="alert"` above the create form |
| `align` | `'start' \| 'end'` | `'start'` | panel alignment on the trigger |
| `labels` | `Partial<ProfileSwitcherLabels>` | English defaults | every string (see the `Labels` interface) |
| `icons` | `ProfileSwitcherIcons` | lucide defaults | `trigger`, `create`, `rename`, `setDefault`, `delete`, `empty` |
| `className` | `string` | — | on the wrapper (`data-as="profile-switcher"`) |

## controlled contract

The component owns only its transient UI state (panel open, create draft,
inline-rename draft). The profile list, the current selection and every
mutation are the app's: handlers receive the `ProfileItem` and the app
re-renders with fresh `profiles` / `currentId` (the switcher never mutates
its props). Optimistic updates are fine; errors surface through `error`.

## labels & i18n

All strings pass in through `labels` with English defaults (`label`
templates like `rename(name)` receive the profile name); apps translate at
call sites (career, study, health use i18next).

## examples

minimal:

```tsx
<ProfileSwitcher
  profiles={profiles}
  currentId={activeProfileId}
  onSelect={(profile) => switchProfile(profile.id)}
  onCreate={(name) => createProfile(name)}
  onRename={(profile, name) => renameProfile(profile.id, name)}
  onDelete={(profile) => deleteProfile(profile.id)}
/>
```

realistic (with set-Default and a persisted last-used selection):

```tsx
<ProfileSwitcher
  profiles={profiles}
  currentId={activeProfileId}
  onSelect={(profile) => {
    setActiveProfile(profile.id)
    localStorage.setItem('ca-profile-id', profile.id)
  }}
  onCreate={async (name) => {
    await api.post('/profiles', { name })
    await query.invalidateQueries({ queryKey: ['profiles'] })
  }}
  onRename={async (profile, name) => {
    await api.patch(`/profiles/${profile.id}`, { name })
    await query.invalidateQueries({ queryKey: ['profiles'] })
  }}
  onDelete={async (profile) => {
    if (!(await confirm({ title: t('profiles.confirmDelete') }))) return
    await api.delete(`/profiles/${profile.id}`)
    await query.invalidateQueries({ queryKey: ['profiles'] })
  }}
  onSetDefault={async (profile) => {
    await api.patch(`/profiles/${profile.id}`, { is_default: true })
    await query.invalidateQueries({ queryKey: ['profiles'] })
  }}
  labels={{ trigger: t('profiles.switch') }}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): trigger is a
labelled button with `aria-haspopup="dialog"`; the panel is a
`role="dialog"` labelled by `panelTitle`; rows mark the active profile with
`aria-current`; every icon-only action carries a name built from its label
template. Keyboard contract asserted in tests: Enter/Space opens and focus
lands on the first row, Tab runs select → row actions → rows → create form,
Enter activates/submits, Escape cancels an inline rename first and closes
the panel on the second press with focus returned to the trigger.

## related

[`Popover`](./popover.md) primitives the panel, [`Button`](./button.md) and
[`Input`](./input.md) for the actions and forms,
[`AdminUserTable`](./admin-user-table.md) for the sibling identity surface.
