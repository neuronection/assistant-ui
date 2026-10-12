# ProviderSetupTiles

Neutral, equal-weight provider picker grid — step one of the family's
one-click setup (plan 26 §6). Tiles render **in the order given** (the app's
family preset order), with no "recommended" anywhere: same size, same
weight, local presets visible with their `Local` caption, disabled presets
render inert with their reason (health's overlay disablement). The catalog
is app data (ADR-006) — the tiles only render it and report the picked key.

## import

```ts
import {
  ProviderSetupTiles,
  ProviderSetupManualTile,
} from '@neuronection/assistant-ui/provider-setup-tiles'
```

## props

Extends `React.ComponentProps<'div'>` (spread onto the group).

| prop | type | default | notes |
|---|---|---|---|
| `presets` | `ProviderSetupTileData[]` | — | `{ key, name, local?, disabled?, disabledReason?, hasKeyPrefixHint? }` — rendered verbatim in order |
| `configured` | `string[]` | — | preset keys already set up (badge on the tile) |
| `suggestedKey` | `string` | — | paste-prefix match highlight (`data-suggested` + sr-only note) — never a ranking |
| `onSelect` | `(key: string) => void` | — | fires with the preset key of the activated tile |
| `children` | `ReactNode` | — | extra grid cell (the "Manual setup" tile — use `ProviderSetupManualTile`) |
| `label` | `string` | `'Choose a provider'` | group `aria-label` |
| `localLabel` | `string` | `'Local'` | caption on `local` tiles |
| `configuredLabel` | `string` | `'Set up'` | badge text on configured tiles |
| `suggestedLabel` | `string` | `'Suggested for your pasted key'` | visually-hidden marker |

`ProviderSetupManualTile` extends `React.ComponentProps<'button'>` — a
matching grid cell for the app's manual/custom entry.

## controlled contract

Stateless: tiles in, `onSelect(key)` out. No selection state lives here
(the app switches to its form step on select).

## labels & i18n

All visible strings are props with English defaults; preset names come from
the app's synced catalog.

## examples

```tsx
<ProviderSetupTiles
  presets={PROVIDER_PRESET_ORDER.map((key) => ({
    key,
    name: PRESETS[key].name,
    local: PRESETS[key].local,
  }))}
  configured={configuredPresetKeys}
  onSelect={openForm}
  label={TEXT.SETUP_TILES_ARIA}
>
  <ProviderSetupManualTile onClick={openManualForm}>
    {TEXT.SETUP_MANUAL_CARD}
  </ProviderSetupManualTile>
</ProviderSetupTiles>
```

## accessibility

`role="group"` with `aria-label`; tiles are native buttons (Tab/Enter
asserted); disabled tiles carry `disabled` and stay reachable to axe;
`suggestedKey` is exposed to screen readers via an sr-only label, not color
alone. Asserted in `tests/provider-setup-tiles.test.tsx`.

## related

[`ProviderSetupForm`](./provider-setup-form.md) (step two),
[`ProviderLogo`](./provider-logo.md),
[ai-settings guide](../guides/ai-settings.md).
