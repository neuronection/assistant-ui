# Badge

Small status pill. One CVA variant set (`badgeVariants` exported for reuse),
7 colorways incl. the family `ai` tone.

## import

```ts
import { Badge, badgeVariants } from '@neuronection/assistant-ui/badge'
```

## props

Extends `React.ComponentProps<'span'>`.

| prop | type | default | notes |
|---|---|---|---|
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'success' \| 'warning' \| 'danger' \| 'ai'` | `'default'` | semantic token colorways |
| `className` | `string` | — | merges |

## controlled contract

None — presentational span. Nested icons get sized by the badge (`[&_svg]:size-3`).

## labels & i18n

Children are app content.

## examples

minimal:

```tsx
<Badge variant="ai">AI</Badge>
```

realistic (version chip, library pattern):

```tsx
<Badge variant="outline">v{version}</Badge>
<Badge variant={enabled ? 'success' : 'warning'}>{enabled ? t('common.on') : t('common.off')}</Badge>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure):
presentational.

## related

[`Button`](./button.md), [`Card`](./card.md), [`ChipList`](./chip-list.md).
