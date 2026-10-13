import * as React from 'react'
import { Check, Settings2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { CapabilityChips } from '../capability-chips/CapabilityChips'
import { ProviderLogo } from '../provider-logo/ProviderLogo'

/** A capability chip rendered on the tile (plan 26 follow-up): the app
 * derives chips from its preset data (wire type → chat/vision/stt,
 * decision models → decision, keyless-local → local) and supplies the
 * translated label — the library never guesses copy (ADR-006). */
export interface ProviderSetupTileChip {
  key: string
  label: string
}

/** One preset entry (ADR-006: the catalog is app data — the tiles only
 * render it, in the order given, with equal weight). */
export interface ProviderSetupTileData {
  key: string
  name: string
  /** Keyless local preset (e.g. Ollama) — renders the `localLabel` caption. */
  local?: boolean
  /** Capability chips (e.g. chat / vision / decision / local) — rendered
   * with the capability-chips badge pattern, neutral (equal weight). */
  chips?: ProviderSetupTileChip[]
  /** Disabled tiles render inert with their reason (health's overlay). */
  disabled?: boolean
  disabledReason?: string
  /** The preset ships a key-prefix hint (informational for the app). */
  hasKeyPrefixHint?: boolean
}

export interface ProviderSetupTilesProps
  extends Omit<React.ComponentProps<'div'>, 'onSelect' | 'children'> {
  /** Presets in the app's family order — the grid keeps it verbatim. */
  presets: ProviderSetupTileData[]
  /** Preset keys already configured (renders the `configuredLabel` badge). */
  configured?: string[]
  /** Key of a tile the app's paste-prefix match suggests (highlight only —
   * never a "recommended" ranking; all tiles stay equal weight). */
  suggestedKey?: string
  /** Fires with the preset key of the activated tile. */
  onSelect: (key: string) => void
  /** Extra grid cell (e.g. the "Manual / custom" tile) — app-composed. */
  children?: React.ReactNode
  label?: string
  localLabel?: string
  configuredLabel?: string
  /** Visually-hidden text marking the suggested tile. */
  suggestedLabel?: string
}

/** Neutral, equal-weight provider picker grid — step one of the family's
 * one-click setup (plan 26 §6): tiles in family order, no "recommended"
 * anywhere, local presets visible, disabled presets explain themselves. */
export const ProviderSetupTiles = React.forwardRef<
  HTMLDivElement,
  ProviderSetupTilesProps
>(function ProviderSetupTiles(
  {
    presets,
    configured,
    suggestedKey,
    onSelect,
    children,
    label = 'Choose a provider',
    localLabel = 'Local',
    configuredLabel = 'Set up',
    suggestedLabel = 'Suggested for your pasted key',
    className,
    ...props
  },
  ref,
) {
  const configuredSet = new Set(configured)
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-as="provider-setup-tiles"
      className={cn(
        'grid grid-cols-2 gap-2 sm:grid-cols-3',
        className,
      )}
      {...props}
    >
      {presets.map((preset) => {
        const isConfigured = configuredSet.has(preset.key)
        const isSuggested = suggestedKey === preset.key
        return (
          <button
            key={preset.key}
            type="button"
            data-preset={preset.key}
            data-suggested={isSuggested || undefined}
            aria-disabled={preset.disabled || undefined}
            disabled={preset.disabled}
            onClick={() => {
              if (!preset.disabled) onSelect(preset.key)
            }}
            className={cn(
              'flex h-auto cursor-pointer flex-col items-center gap-2 rounded-[var(--as-radius)] border px-3 py-4 text-sm font-medium text-[var(--as-fg)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
              isSuggested
                ? 'border-[var(--as-focus-ring)] bg-[var(--as-muted)]'
                : 'border-[var(--as-border)] bg-[var(--as-surface)] hover:bg-[var(--as-muted)]',
            )}
          >
            <ProviderLogo preset={preset.key} />
            <span className="w-full truncate text-center">{preset.name}</span>
            {preset.chips && preset.chips.length > 0 ? (
              <CapabilityChips
                variant="badge"
                className="justify-center"
                caps={preset.chips.map((chip) => ({ value: chip.key, label: chip.label }))}
                selected={[]}
              />
            ) : null}
            {preset.local ? (
              <span className="text-xs font-normal text-[var(--as-muted-fg)]">
                {localLabel}
              </span>
            ) : null}
            {preset.disabled && preset.disabledReason ? (
              <span className="text-xs font-normal text-[var(--as-muted-fg)]">
                {preset.disabledReason}
              </span>
            ) : null}
            {isConfigured ? (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-[var(--as-success)]">
                <Check className="size-3" aria-hidden />
                {configuredLabel}
              </span>
            ) : null}
            {isSuggested ? (
              <span className="sr-only">{suggestedLabel}</span>
            ) : null}
          </button>
        )
      })}
      {children ? <div className="contents">{children}</div> : null}
    </div>
  )
})

/** The "manual / custom" tile apps append as `children` of the grid. */
export const ProviderSetupManualTile = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(function ProviderSetupManualTile(
  { children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      data-as="provider-setup-manual-tile"
      className={cn(
        'flex h-auto cursor-pointer flex-col items-center gap-2 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-4 text-sm font-medium text-[var(--as-fg)] transition-colors hover:bg-[var(--as-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-5 shrink-0 items-center justify-center text-[var(--as-muted-fg)]">
        <Settings2 className="size-5" aria-hidden />
      </span>
      {children}
    </button>
  )
})
