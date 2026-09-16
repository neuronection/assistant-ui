# SettingsShell

Two-pane settings layout: sticky section nav (icon, label, description per
entry) + content pane. Fully controlled navigation; the router/page state
stays app-side. The layout responds to the shell's **own width** (container
query), not the viewport — beside a docked side panel the page column can be
narrow on a wide screen, and the shell adapts to what it actually gets.

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
| `header` | `{ icon?: LucideIcon; title: string }` | — | small header above the nav (rail mode only) |
| `children` | `ReactNode` | — | content pane (3 of 4 columns in rail mode) |
| `className` | `string` | — | on the outer shell (the size container; the grid lives in component CSS) |
| `navClassName` | `string` | — | on the nav card (e.g. sticky offset) |

`trailing` is a ReactNode rendered at the entry's trailing edge — use it for
status dots, counts or badges that belong to the nav entry itself rather
than its description. In chip mode the trailing node sits right after the
label; in rail mode it is pushed to the row edge.

## layout & theming

All layout is owned by component CSS on `[data-as]` hooks (root
`settings-shell`, body grid `settings-shell-body`, nav `settings-shell-nav`,
nav card `settings-shell-navbox`, entries `settings-shell-navitem`, content
`settings-shell-content`). Host apps compile their own utilities **after**
the library stylesheet, so utility-based column rules would silently
collide — component CSS removes that.

Two modes, switched by a container query on the root:

- **Narrow** (shell < `48rem` wide — small windows, phones, or a docked
  side panel squeezing the page): the nav renders as a **wrapping chip row**
  (icons + labels, descriptions and header hidden) above the full-width
  content pane.
- **Rail** (shell ≥ `48rem`): the classic 1+3 grid — sticky vertical nav
  card with descriptions on the left, content pane on the right.

Browsers without container-query support render the narrow layout (usable
everywhere). Apps should not restyle the grid; the mode hooks exist for
tests and exceptional overrides via app CSS targeting `[data-as]`.

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
