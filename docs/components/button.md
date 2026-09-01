# Button

The primary action primitive. Five variants, four sizes, built-in loading
spinner, `asChild` composition via Radix Slot. Exported with its
`buttonVariants` recipe for reuse in app-side CVA styles.

## import

```ts
import { Button, buttonVariants } from '@neuronection/assistant-ui/button'
```

## props

Extends `React.ComponentProps<'button'>`.

| prop | type | default | notes |
|---|---|---|---|
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'default'` | |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | `icon` = round 36px square |
| `asChild` | `boolean` | `false` | render `children` as the element (Radix Slot) — e.g. an `<a>` styled as button |
| `loading` | `boolean` | `false` | shows a `Spinner`, sets `aria-busy`, disables |
| `className` | `string` | — | merges via `cn` |
| …native | `disabled`, `onClick`, `type`, `title`, … | — | passed through |

## controlled contract

Purely presentational: click out via `onClick`. `loading` is app state —
the component disables itself and marks `aria-busy` while set. `asChild`
swaps the `<button>` for the child element; native button semantics (and
the accessibility contract) then depend on the child.

## labels & i18n

Content is `children` — apps render translated strings:

```tsx
<Button>{t('settings.save')}</Button>
```

## examples

minimal:

```tsx
<Button onClick={save}>Save</Button>
```

realistic (from study-assistant `ProvidersTab.tsx`):

```tsx
<Button size="sm" onClick={() => setForm({ provider: null })}>
  <Plus aria-hidden />
  {t('settings.addProvider')}
</Button>
<Button
  variant="ghost"
  size="icon"
  title={t('settings.editProvider')}
  onClick={() => setForm({ provider })}
>
  <Pencil className="size-4" aria-hidden />
</Button>
```

## accessibility

See [accessibility.md](../accessibility.md#actions): native `<button>`,
Enter activates, `loading` disables + `aria-busy`, disabled never fires
`onClick`. Icon-only buttons need `title`/`aria-label` from the app.

## related

[`Badge`](./badge.md), [`Modal`](./modal.md),
[`Button` styling via `buttonVariants`](../guides/import-and-theming.md).
