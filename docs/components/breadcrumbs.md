# Breadcrumbs

`<nav>` breadcrumb trail with a home link, intermediate links and a current
page label. SPA routing via `linkComponent` (pass your router `Link`); the
current step renders as text, not a link.

## import

```ts
import {
  Breadcrumbs,
  type BreadcrumbItem,
  type BreadcrumbLinkProps,
} from '@neuronection/assistant-ui/breadcrumbs'
```

## props

Extends `React.ComponentProps<'nav'>`.

| prop | type | default | notes |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | `[]` | `{ label, href?, icon? }` |
| `currentLabel` | `string` | — | last segment, rendered as text with `aria-current="page"` |
| `homeHref` | `string` | — | renders the house-icon home link |
| `homeLabel` | `string` | `'Home'` | home link accessible name |
| `linkComponent` | `ComponentType<BreadcrumbLinkProps>` | `'a'` | swap for your SPA `Link` |
| `className` | `string` | — | merges onto the `<nav>` |

Renders nothing when `items`, `currentLabel` and `homeHref` are all empty.

## controlled contract

None — rendering is derived from props. Clicks are real links (native or
your router component).

## labels & i18n

`homeLabel` + item labels are app content.

## examples

minimal:

```tsx
<Breadcrumbs items={[{ label: 'Courses', href: '/courses' }]} currentLabel="Math 101" />
```

realistic with an SPA router link:

```tsx
<Breadcrumbs
  homeHref="/"
  homeLabel={t('common.home')}
  items={trail.map((step) => ({ label: t(step.key), href: step.href }))}
  currentLabel={t('notes.title')}
  linkComponent={Link}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): `<nav>`
+ link list, current step as text with `aria-current="page"`, native link
semantics through `linkComponent`.

## related

[`SettingsShell`](./settings-shell.md), [`Wizard`](./wizard.md).
