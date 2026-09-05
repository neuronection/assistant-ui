# SettingsShell

Two-pane settings layout: sticky section nav (icon, label, description per
entry) + content pane. Fully controlled navigation; the router/page state
stays app-side.

## import

```ts
import { SettingsShell, type SettingsNavItem } from '@neuronection/assistant-ui/settings-shell'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `nav` | `SettingsNavItem[]` | — | `{ id, label, description?, icon?, trailing? }` |
| `active` | `string` | — | active nav id |
| `onNavigate` | `(id: string) => void` | — | |
| `header` | `{ icon?: LucideIcon; title: string }` | — | small header above the nav |
| `children` | `ReactNode` | — | content pane (`lg:col-span-3`) |
| `className` | `string` | — | on the outer grid (`grid lg:grid-cols-4` default) |
| `navClassName` | `string` | — | on the nav card (e.g. sticky offset) |

`trailing` is a ReactNode rendered at the row's trailing edge (`ml-auto`,
vertically centered) — use it for status dots, counts or badges that belong
to the nav entry itself rather than its description.

## controlled contract

`active` + `onNavigate` — the library renders no routes. Content pane
switching is app-side (`active === 'models' ? <ModelsTab/> : …`).

## labels & i18n

`header.title` and nav labels/descriptions are app strings; the nav has a
fixed `aria-label="Settings sections"`.

## examples

minimal:

```tsx
<SettingsShell
  nav={[{ id: 'general', label: 'General' }]}
  active={tab}
  onNavigate={setTab}
>
  {tab === 'general' && <GeneralTab />}
</SettingsShell>
```

realistic (study `SettingsPage.tsx` shape):

```tsx
<SettingsShell
  nav={[
    { id: 'providers', label: t('settings.providers'), icon: Plug, description: t('settings.providersHint') },
    { id: 'models', label: t('settings.models'), icon: Boxes },
    { id: 'tasks', label: t('settings.tasks'), icon: ListChecks },
  ]}
  active={tab}
  onNavigate={setTab}
  header={{ icon: KeyRound, title: t('settings.title') }}
>
  {tab === 'providers' ? <ProvidersTab /> : tab === 'models' ? <ModelsTab /> : <TasksTab />}
</SettingsShell>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure):
`<nav aria-label="Settings sections">`, active entry `aria-current="page"`,
nav entries are native buttons.

## related

[`Breadcrumbs`](./breadcrumbs.md), the
[ai-settings guide](../guides/ai-settings.md) for the tab content.
