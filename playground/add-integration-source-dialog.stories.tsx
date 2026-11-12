import * as React from 'react'
import { action } from '@ladle/react'

import { AddIntegrationSourceDialog } from '../src/components/add-integration-source-dialog/AddIntegrationSourceDialog'

function Harness(props: Record<string, unknown>) {
  const [open, setOpen] = React.useState(true)
  return (
    <AddIntegrationSourceDialog
      open={open}
      onOpenChange={(next) => {
        action('onOpenChange')(String(next))
        setOpen(next)
      }}
      onSubmit={(draft) => action('onSubmit')(JSON.stringify(draft))}
      {...props}
    />
  )
}

export const Default = () => <Harness />

export const WithSealedCredential = () => <Harness secretSlot="repo-token" />

export const Fetching = () => <Harness busy />

export const Failed = () => <Harness error="sync failed: unreachable (retryable)" />
