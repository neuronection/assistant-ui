# Card

Surface container compound: `Card`, `CardHeader`, `CardTitle`,
`CardDescription`, `CardContent`, `CardFooter`. All are thin styled
elements forwarding native props — compose freely, nest anything.

## import

```ts
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@neuronection/assistant-ui/card'
```

## props

Each part forwards its native element props:

| part | element | props | styling |
|---|---|---|---|
| `Card` | `div` | `React.ComponentProps<'div'>` | radius-lg, border, surface bg, shadow-1 |
| `CardHeader` | `div` | `React.ComponentProps<'div'>` | `p-5` column stack |
| `CardTitle` | `h3` | `React.ComponentProps<'h3'>` | semibold, tracking-tight |
| `CardDescription` | `p` | `React.ComponentProps<'p'>` | muted `text-sm` |
| `CardContent` | `div` | `React.ComponentProps<'div'>` | `p-5 pt-0` |
| `CardFooter` | `div` | `React.ComponentProps<'div'>` | flex row, `p-5 pt-0` |

All parts accept `className` (merges) and carry `data-as` attributes
(`card`, `card-header`, `card-title`, …).

## controlled contract

None — presentational. Layout (`flex-col`, grids, spacing between parts)
stays app-owned via `className`.

## labels & i18n

No strings of its own; children are app content.

## examples

minimal:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Providers</CardTitle>
    <CardDescription>Connect AI backends.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

realistic (from study-assistant `ProvidersTab.tsx` — horizontal card row):

```tsx
<Card key={provider.id}>
  <CardContent className="flex items-center gap-3 p-4">
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{provider.name}</p>
      <ConnectionTestRow variant="inline" … />
    </div>
    <Button variant="ghost" size="icon" title={t('settings.editProvider')} onClick={edit}>
      <Pencil className="size-4" aria-hidden />
    </Button>
  </CardContent>
</Card>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure):
presentational; action slots inside cards are app-owned controls.

## related

[`AboutCard`](./about.md), [`Modal`](./modal.md), [`Button`](./button.md).
