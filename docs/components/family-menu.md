# FamilyMenu

The family switcher for a sidebar footer. One compact trigger opens a
portaled list of the other Neuronection assistants — tinted app marks,
a two-line description per product, a chip on the current app, a close
button, and a hub link with an optional version.

Presentational and controlled: products, labels and links come in as
props, links are plain anchors, and Radix Popover owns open state, focus,
Escape and outside-click behavior.

## import

```ts
import { FamilyMenu, defaultFamilyProjects } from '@neuronection/assistant-ui/family-menu'
// or from the package root
```

## props

Extends `React.ComponentProps<'button'>` (rest props go to the trigger).

| prop | type | default | notes |
|---|---|---|---|
| `current` | `FamilyApp` (`'health' \| 'career' \| 'study' \| 'desktop'`) | — | marks the matching row with `currentLabel` |
| `projects` | `ReadonlyArray<FamilyProject>` | family defaults | `{ id, name, description?, href, app?, icon?, current? }`; `app` brings the family mark, `icon` overrides it, `current` forces the marker |
| `label` | `string` | `'Explore'` | visible trigger text |
| `ariaLabel` | `string` | `` `${label} projects` `` | accessible trigger name |
| `menuLabel` | `string` | `'Neuronection family'` | dialog accessible name (the visible header is the blue lowercase wordmark) |
| `familyLabel` | `string` | `'family'` | muted word after the wordmark |
| `countLabel` | `((count: number) => string \| null) \| null` | `` (n) => `${n} apps` `` | return `null` (or pass `null`) to hide |
| `closeLabel` | `string` | `'Close'` | close button name |
| `currentLabel` | `string` | `'Current'` | chip on the current row |
| `hubUrl` / `hubLabel` | `string` | `https://neuronection.com` / `'neuronection.com'` | footer link |
| `version` | `string` | — | rendered at the end of the footer when set |
| `theme` | `LogoTheme` | `'light'` | mark art variant |
| `open` / `defaultOpen` / `onOpenChange` | `boolean` / `boolean` / `(open: boolean) => void` | — | controlled or uncontrolled |
| `side` / `align` | `'top' \| 'right' \| 'bottom' \| 'left'` / `'start' \| 'center' \| 'end'` | `'top'` / `'start'` | popover placement |
| `contentClassName` | `string` | — | merges onto the popover panel (width is `19rem` by default) |
| `className` | `string` | — | merges onto the trigger |

`FamilyProject`:

```ts
type FamilyProject = {
  id: string
  name: string
  description?: string
  href: string
  app?: FamilyApp
  icon?: React.ReactNode
  current?: boolean
}
```

## controlled contract

`open` / `onOpenChange` control the popover; omit both for uncontrolled
use with `defaultOpen`. The component never navigates on its own — every
product row and the hub link are `<a target="_blank" rel="noreferrer">`.

## labels & i18n

`label`, `ariaLabel`, `menuLabel`, `familyLabel`, `countLabel`, `closeLabel`, `currentLabel`,
`hubLabel` and the product names/descriptions are props with English
defaults. Translate them at the call site; pass `projects` when the copy
needs to be localized.

## examples

Sidebar footer row next to Fund / About:

```tsx
import { FamilyMenu } from '@neuronection/assistant-ui'

<div className="flex items-center justify-center gap-1.5">
  <FamilyMenu current="career" version={pkg.version} label={t('footer.explore')} />
  <button onClick={openFund}>Fund</button>
  <a href="/about">About</a>
</div>
```

Custom products (new family apps, or an app-side order):

```tsx
<FamilyMenu
  current="world-knowledge"
  projects={[
    {
      id: 'world-knowledge',
      name: 'World Knowledge',
      description: 'Structured knowledge packs for grounded answers.',
      href: 'https://neuronection.com',
      current: true,
    },
    ...defaultFamilyProjects,
  ]}
/>
```

## accessibility

- Trigger is a real button; Radix sets `aria-haspopup="dialog"` and
  `aria-expanded`.
- The panel is a `role="dialog"` named by `menuLabel`; the close button is a
  labelled real button.
- Current row adds `(Current)` to its link name and shows a visible chip.
- Escape closes and restores focus to the trigger; outside click closes;
  Tab reaches the trigger, every row, the close button and the hub link.
- Axe-clean closed and open; covered by `tests/family-menu.test.tsx`.
