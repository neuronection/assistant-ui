# EmptyState

Centered empty placeholder: icon, title, description and an app-owned action
slot. `compact` for inline/panel use.

## import

```ts
import { EmptyState } from '@neuronection/assistant-ui/empty-state'
```

## props

Extends `React.ComponentProps<'div'>`.

| prop | type | default | notes |
|---|---|---|---|
| `icon` | `LucideIcon` | — | rendered muted, aria-hidden |
| `title` | `string` | — | required heading text |
| `description` | `string` | — | muted, max-width constrained |
| `action` | `ReactNode` | — | app-owned control (e.g. a `Button`) |
| `compact` | `boolean` | `false` | smaller paddings/sizes |
| `className` | `string` | — | merges |

## controlled contract

None — presentational. The action slot is a real control the app renders.

## labels & i18n

`title`/`description` are app strings.

## examples

minimal:

```tsx
<EmptyState icon={Inbox} title="Nothing here yet" />
```

realistic (with action, study pattern):

```tsx
<EmptyState
  icon={FolderOpen}
  title={t('notes.emptyTitle')}
  description={t('notes.emptyHint')}
  action={
    <Button size="sm" onClick={create}>
      <Plus aria-hidden />
      {t('notes.create')}
    </Button>
  }
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure):
presentational; the action slot is app-owned — use an accessible control.

## related

[`Table`](./table.md) (`emptyText` row), [`ErrorBanner`](./error-banner.md).
