# SetupFirstRunCard

Empty-state CTA for the AI-settings surface when **no provider is
configured** (plan 26 §6) — the entry point of the setup flow. Title, body,
an optional local-engine probe status, and Set up / Dismiss actions; apps
pass a detected-local banner as `children`. Chat empty states deep-link to
the settings surface that renders this card.

## import

```ts
import { SetupFirstRunCard } from '@neuronection/assistant-ui/setup-first-run-card'
```

## props

Extends `React.ComponentProps<'section'>` (spread onto the root section).

| prop | type | default | notes |
|---|---|---|---|
| `title` | `ReactNode` | — | heading (the card is `aria-labelledby` it) |
| `body` | `ReactNode` | — | supporting line |
| `localProbing` | `boolean` | `false` | renders the `probingLabel` `role="status"` line while the app probes for a local engine |
| `onSetup` | `() => void` | — | primary action — opens the setup flow |
| `onDismiss` | `() => void` | — | optional — omit to hide the dismiss action |
| `children` | `ReactNode` | — | app content between body and actions (e.g. the Ollama-detected banner) |
| `setupLabel` | `string` | `'Set up a provider'` | |
| `dismissLabel` | `string` | `'Dismiss'` | |
| `probingLabel` | `string` | `'Checking for a local engine…'` | |

## controlled contract

Stateless: events out only. The probe itself is the app's (IPC/REST) —
the card only renders its pending state.

## labels & i18n

All strings are props with English defaults.

## examples

```tsx
<SetupFirstRunCard
  title={TEXT.SETUP_CARD_TITLE}
  body={TEXT.SETUP_CARD_SUBTITLE}
  onSetup={() => onOpenWizard()}
>
  {ollamaDetected ? (
    <div role="status" className="…">
      {TEXT.SETUP_OLLAMA_DETECTED}
      <Button size="sm" variant="outline" onClick={() => onOpenWizard('ollama')}>
        {TEXT.SETUP_OLLAMA_CONNECT}
      </Button>
    </div>
  ) : null}
</SetupFirstRunCard>
```

## accessibility

Section labelled by its heading; actions are native buttons (Tab/Enter
asserted); the probe line is a `role="status"` live region. Asserted in
`tests/setup-first-run-card.test.tsx`.

## related

[`ProviderSetupTiles`](./provider-setup-tiles.md) (the flow this card opens),
[ai-settings guide](../guides/ai-settings.md).
