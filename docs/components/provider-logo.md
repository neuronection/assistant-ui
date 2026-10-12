# ProviderLogo

Provider mark for setup tiles and provider rows: **simple-icons path data
keyed by preset key**, inline in the module (no runtime dependency), filled
with `currentColor` so it inherits app identity. Unknown keys — and the
`openai`/`groq` keys, whose marks were removed upstream by their brands —
fall back to a **monogram** of the key's first letter. Decorative by default
(`aria-hidden`): name the tile/button it lives in.

## import

```ts
import { ProviderLogo } from '@neuronection/assistant-ui/provider-logo'
```

## props

Extends `React.ComponentProps<'span'>` (spread onto the root span).

| prop | type | default | notes |
|---|---|---|---|
| `preset` | `string` | — | preset key (`'openai'`, `'gemini'`, …) |
| `size` | `number` | `20` | square size in px |

## controlled contract

Stateless display component.

## labels & i18n

No strings. Icons shipped: `gemini`, `openrouter`, `anthropic`, `mistral`,
`deepseek`, `ollama`. Everything else renders the monogram.

## examples

```tsx
<ProviderLogo preset={presetKey} />

<ProviderLogo preset="openai" size={24} /> // monogram "O" — mark gone upstream
```

## accessibility

`aria-hidden` decorative root; the accessible name comes from the
interactive parent (tile button, row label).

## related

[`ProviderSetupTiles`](./provider-setup-tiles.md),
[`ProviderForm`](./provider-form.md).
