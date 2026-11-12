# provider-card

Provider summary card for settings lists: provider mark + name + identity
badges, a muted subtitle line for discrete always-on context (e.g. the
endpoint URL, full text on the tooltip), and the connection result as the
status line. Management actions live in the `⋯` overflow menu; the test
road itself is display-only inside the card.

## Import

```ts
import { ProviderCard } from '@neuronection/assistant-ui/provider-card'
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | provider name (the card's visible heading) |
| `logoPreset` | `string` | — | preset key for the `ProviderLogo` mark; unknown keys fall back to the monogram |
| `nameTitle` | `string` | — | tooltip on the name |
| `subtitle` | `string` | — | muted truncated context line under the name (e.g. the endpoint URL) |
| `badges` | `ProviderCardBadge[]` | — | identity badges (`key`/`label` + optional `title` tooltip, `danger` tone, `testId`) |
| `status` | `ConnectionTestStatus` | — | connection display status (see `connection-test-row`) |
| `connectionLabel` / `okLabel` / `failLabel` / `idleLabel` / `latencyLabel` / `latencyMs` / `errorMessage` | — | — | forwarded to the inline `ConnectionTestRow` |
| `meta` | `React.ReactNode` | — | status-adjacent context (e.g. model count) |
| `actions` | `ActionMenuItem[]` | — | overflow-menu items (`⋯` menu) |
| `actionsLabel` | `string` | — | accessible name for the menu trigger |
| `className` | extras | — | merges onto the root |

## Controlled contract

Data in, events out: the card displays the current status and dispatches
the menu actions it was handed. The actual test action is a menu item
(`ConnectionTestRow` is display-only here — it surfaces the last result
and the meta slot carries model context).

## Accessibility

See [accessibility.md](../accessibility.md#provider-card). Name and
subtitle are text; the connection row carries its own labelled
states (`connectionLabel`); the overflow menu is a labelled trigger.

## Example

```tsx
<ProviderCard
  name="OpenAI compatible"
  logoPreset="openai_compatible"
  subtitle="https://api.example.com/v1"
  badges={[{ key: 'de', label: '🇩🇪', title: 'Germany' }]}
  status="ok"
  connectionLabel="Test connection: OpenAI compatible"
  okLabel="Connected"
  latencyLabel="1.2 s"
  actions={[{ key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }]}
  actionsLabel="Manage provider"
/>
```

## Related

- [`connection-test-row`](./connection-test-row.md) — the status row the card renders
- [`provider-logo`](./provider-logo.md) — the mark
- [`model-registry`](./model-registry.md) — the settings assembly the card appears in
