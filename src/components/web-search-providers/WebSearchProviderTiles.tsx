import * as React from 'react'
import {
  ProviderSetupTiles,
  type ProviderSetupTileChip,
} from '../provider-setup-tiles/ProviderSetupTiles'
import type { WebSearchProviderCatalog, WebSearchProviderCatalogEntry } from './types'

export interface WebSearchProviderTilesProps
  extends Omit<React.ComponentProps<typeof ProviderSetupTiles>, 'presets' | 'onSelect'> {
  catalog: WebSearchProviderCatalog
  onSelect: (type: string) => void
  /** Chip marking key-requiring types (catalog `requiresKey`). */
  keyChipLabel?: string
  /** Chip marking keyless types. */
  keylessChipLabel?: string
  /** Chip for catalog `hosting: 'cloud'`. */
  cloudChipLabel?: string
  /** Chip for catalog `hosting: 'self-hosted'`. */
  selfHostedChipLabel?: string
}

/** The "choose a provider" step of the web-search setup flow — the family
 * provider tiles fed from the catalog: one tile per type in catalog order,
 * a key chip derived from `requiresKey` and a hosting chip derived from
 * `hosting` (equal weight, no ranking — the ProviderSetupTiles contract). */
export const WebSearchProviderTiles = React.forwardRef<
  HTMLDivElement,
  WebSearchProviderTilesProps
>(function WebSearchProviderTiles(
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
  const hostingChip = (hosting: WebSearchProviderCatalogEntry['hosting']): ProviderSetupTileChip | null => {
    if (hosting === 'cloud') return { key: 'cloud', label: cloudChipLabel }
    if (hosting === 'self-hosted') return { key: 'self-hosted', label: selfHostedChipLabel }
    return null
  }
  const presets = catalog.order.map((type) => {
    const entry = catalog.entries[type]
    const chips: ProviderSetupTileChip[] = [
      entry?.requiresKey
        ? { key: 'key', label: keyChipLabel }
        : { key: 'keyless', label: keylessChipLabel },
    ]
    const hosting = entry ? hostingChip(entry.hosting) : null
    if (hosting) chips.push(hosting)
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
