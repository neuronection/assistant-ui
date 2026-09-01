# ThemeScope

Subtree-scoped token overrides via inline CSS variables — local flavor
without touching global `theme.css`. Accepts any `ThemeTokens` subset.

## import

```ts
import { ThemeScope, type ThemeTokens } from '@neuronection/assistant-ui/theme-scope'
```

## props

Extends `React.ComponentProps<'div'>`.

| prop | type | default | notes |
|---|---|---|---|
| `tokens` | `ThemeTokens` | — | `{ '--as-primary': '#f00', … }` — token names are typed |
| `className` / …div props | — | — | `style` merges after the token style |

## controlled contract

None — applies `tokens` as inline style on the wrapper `div`; nested scopes
override outer ones by CSS specificity order.

## labels & i18n

n/a.

## examples

minimal:

```tsx
<ThemeScope tokens={{ '--as-primary': '#ff0000' }}>
  <Button>Red only in here</Button>
</ThemeScope>
```

realistic (typed tokens, preview pane):

```tsx
<ThemeScope tokens={{ '--as-primary': seasonal, '--as-radius': '0.25rem' }}>
  <Card>
    <CardContent>{preview}</CardContent>
  </Card>
</ThemeScope>
```

## accessibility

See [accessibility.md](../accessibility.md#utilities-no-aria-contract):
rendering/theming primitive; the subtree is axe-checked in the library
tests.

## related

[tokens entry point](../guides/utilities.md#tokens-entry-point),
[theming doc](../theming.md).
