import * as React from 'react'
import { action } from '@ladle/react'

import { ConsentDialog } from '../src/components/consent-dialog/ConsentDialog'
import { consent } from './integration-fixtures'

function Harness(props: Record<string, unknown>) {
  const [open, setOpen] = React.useState(true)
  return (
    <ConsentDialog
      open={open}
      onOpenChange={(next) => {
        action('onOpenChange')(String(next))
        setOpen(next)
      }}
      payload={consent()}
      onConsent={(payload) => action('onConsent')(payload.extensionId ?? '')}
      onDecline={(payload) => action('onDecline')(payload.extensionId ?? '')}
      {...props}
    />
  )
}

export const Install = () => <Harness />

export const CapabilityGrowthReconsent = () => (
  <Harness
    payload={consent({
      variant: 're-consent',
      capabilities: [
        { id: 'sync' },
        { id: 'secrets' },
        { id: 'chat-tools', riskClass: 'state-changing' },
      ],
      changeSummary: {
        addedCapabilities: ['secrets', 'chat-tools'],
        versionChange: { from: '1.0.0', to: '1.1.0' },
        digestChange: {
          from: '3af53a1ef0ece88bdce9469f83db5f584d17fc18b56634578688a9a8794ec75e',
          to: 'b71c9e0d4a7f2c8e5d3b6a9f0c4e7d2b8a5f1c3e6d9b2a4f7c0e3d6a9b2f4c7e',
        },
      },
    })}
  />
)

export const UpdateConsent = () => (
  <Harness
    payload={consent({
      variant: 'update',
      version: '1.1.0',
      changeSummary: {
        removedCapabilities: ['notify'],
        versionChange: { from: '1.0.0', to: '1.1.0' },
      },
    })}
  />
)

export const DeclarativeT0 = () => (
  <Harness
    payload={consent({
      extensionId: 'cv-gallery',
      tier: 'T0',
      importClass: 'imported',
      capabilities: [{ id: 'ui:page' }, { id: 'report' }],
      disclosure:
        'This extension is declarative data only: it carries no code, and the app renders exactly what it declares — validated against a closed UI vocabulary and schema at import. Content stays inside the app\'s rendering and theming; nothing from this extension executes or reaches the network on its own.',
    })}
  />
)

export const Busy = () => <Harness busy />

export const HostContext = () => (
  <Harness context="Imported from github.com/example/fork — this consent covers code not authored by the app." />
)
