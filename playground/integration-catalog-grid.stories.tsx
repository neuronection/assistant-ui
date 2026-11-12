import * as React from 'react'
import { action } from '@ladle/react'

import { IntegrationCatalogGrid } from '../src/components/integration-catalog-grid/IntegrationCatalogGrid'
import { entry } from './integration-fixtures'

const ENTRIES = [
  entry({ id: 'greenhouse', name: 'Greenhouse jobs', categories: ['search'] }),
  entry({ id: 'rss-feeds', name: 'RSS feeds', categories: ['search', 'data'], originClass: 'listed' }),
  entry({ id: 'fs-organizer', name: 'FS organizer', categories: ['files'], tier: 'T1', originClass: 'bundled' }),
  entry({ id: 'no-category', name: 'Uncategorized tool', categories: [] }),
  entry({
    id: 'unhosted',
    name: 'Desktop-only pack',
    categories: ['productivity'],
    hostCompat: { compatible: false, reason: "kind 'mini-app' refinement >= 2 required" },
  }),
]

export const Default = () => (
  <Harness />
)

function Harness() {
  const [query, setQuery] = React.useState('')
  return (
    <div className="max-w-3xl">
      <IntegrationCatalogGrid
        entries={ENTRIES}
        query={query}
        onQueryChange={setQuery}
        installingId={null}
        onInstall={(e) => action('onInstall')(e.id)}
      />
    </div>
  )
}

export const Loading = () => (
  <div className="max-w-3xl">
    <IntegrationCatalogGrid entries={[]} query="" onQueryChange={() => {}} loading />
  </div>
)

export const Error = () => (
  <div className="max-w-3xl">
    <IntegrationCatalogGrid
      entries={[]}
      query=""
      onQueryChange={() => {}}
      error="Registry unreachable (unreachable — retryable)"
    />
  </div>
)

export const Empty = () => (
  <div className="max-w-3xl">
    <IntegrationCatalogGrid entries={[]} query="" onQueryChange={() => {}} />
  </div>
)
