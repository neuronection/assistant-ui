import * as React from 'react'
import { action } from '@ladle/react'

import { DocsDialog } from '../src/components/integration-docs-dialog/DocsDialog'

const DOCS = [
  {
    id: 'guide',
    title: 'Guide',
    children: [
      { id: 'guide/setup', title: 'Setup' },
      { id: 'guide/usage', title: 'Usage' },
    ],
  },
  { id: 'reference', title: 'Schema reference' },
]

function Harness(props: Record<string, unknown>) {
  const [open, setOpen] = React.useState(true)
  const [selectedId, setSelectedId] = React.useState<string | null>('guide')
  return (
    <DocsDialog
      open={open}
      onOpenChange={(next) => {
        action('onOpenChange')(String(next))
        setOpen(next)
      }}
      docs={DOCS}
      selectedId={selectedId}
      onSelect={(id) => {
        action('onSelect')(id)
        setSelectedId(id)
      }}
      renderContent={(node) => (
        <div className="space-y-2 text-sm text-[var(--as-fg)]">
          <p className="font-medium">{node.title}</p>
          <p className="text-[var(--as-muted-fg)]">
            App-owned content for {node.id} — fetched and rendered host-side.
          </p>
        </div>
      )}
      {...props}
    />
  )
}

export const Default = () => <Harness />

export const Loading = () => <Harness status="loading" />

export const Failed = () => <Harness status="error" errorDetail="docs bundle missing from the pack" />

export const NoDocs = () => <Harness docs={[]} selectedId={null} />
