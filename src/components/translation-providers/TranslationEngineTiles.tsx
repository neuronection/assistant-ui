import * as React from 'react'
import {
  ProviderSetupTiles,
  type ProviderSetupTileChip,
} from '../provider-setup-tiles/ProviderSetupTiles'
import type { TranslationEngineCatalog } from './types'

export interface TranslationEngineTilesProps
  extends Omit<React.ComponentProps<typeof ProviderSetupTiles>, 'presets' | 'onSelect'> {
  catalog: TranslationEngineCatalog
  onSelect: (type: string) => void
  /** Chip marking key-requiring engines (catalog `requiresKey`). */
  keyChipLabel?: string
  /** Chip marking keyless engines. */
  keylessChipLabel?: string
  /** Chip for catalog `hosting: 'cloud'`. */
  cloudChipLabel?: string
  /** Chip for catalog `hosting: 'self-hosted'`. */
  selfHostedChipLabel?: string
}

/** The "choose an engine" step of the translation setup flow — the family
 * provider tiles fed from the catalog: one tile per engine in catalog
 * order, a key chip derived from `requiresKey` and a hosting chip derived
 * from `hosting` (equal weight, no ranking). */
export const TranslationEngineTiles = React.forwardRef<
  HTMLDivElement,
  TranslationEngineTilesProps
>(function TranslationEngineTiles(
  {
    catalog,
    onSelect,
    keyChipLabel = 'API key',
    keylessChipLabel = 'No API key',
    cloudChipLabel = 'Cloud',
    selfHostedChipLabel = 'Self-hosted',
    ...props
  },
  ref,
) {
  const presets = catalog.order.map((type) => {
    const entry = catalog.entries[type]
    const chips: ProviderSetupTileChip[] = [
      entry?.requiresKey
        ? { key: 'key', label: keyChipLabel }
        : { key: 'keyless', label: keylessChipLabel },
    ]
    if (entry?.hosting === 'cloud') chips.push({ key: 'cloud', label: cloudChipLabel })
    if (entry?.hosting === 'self-hosted') chips.push({ key: 'self-hosted', label: selfHostedChipLabel })
    return { key: type, name: entry?.label ?? type, chips }
  })
  return (
    <ProviderSetupTiles
      ref={ref}
      presets={presets}
      onSelect={onSelect}
      {...props}
    />
  )
})
