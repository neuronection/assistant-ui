# Portal

React portal to `document.body` (or a custom container). SSR-safe (renders
nothing without `document`). The base primitive all library overlays assume;
use it for app-side floating content that must escape stacking contexts.

## import

```ts
import { Portal, type PortalProps } from '@neuronection/assistant-ui/portal'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `children` | `ReactNode` | — | |
| `container` | `HTMLElement \| null` | `document.body` | render target |

## controlled contract

None — mounting sugar. Children render into the container, outside the
React tree root.

## labels & i18n

n/a.

## examples

minimal:

```tsx
<Portal>
  <div className="fixed bottom-4 right-4 z-[var(--as-z-popover)]">{toast}</div>
</Portal>
```

realistic (custom container for a widget host):

```tsx
<Portal container={widgetRoot}>{<ToastStack notices={notices} />}</Portal>
```

## accessibility

See [accessibility.md](../accessibility.md#utilities-no-aria-contract):
rendering primitive, no ARIA contract of its own. For overlays prefer the
library's Radix-based components (focus management included).

## related

[`Modal`](./modal.md), [`Popover`](./popover.md), [`ThemeScope`](./theme-scope.md).
