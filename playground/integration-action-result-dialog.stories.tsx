import * as React from 'react'
import { action } from '@ladle/react'

import { ActionResultDialog } from '../src/components/integration-action-result-dialog/ActionResultDialog'
import type { SurfaceView } from '../src/components/surface-renderer/SurfaceRenderer'

const RESULT_SURFACE: SurfaceView = {
  nodes: [
    { id: 'found', type: 'stat', bind: 'matched' },
    { id: 'verdict', type: 'badge', bind: 'verdict' },
    {
      id: 'rows',
      type: 'table',
      columns: ['title', 'company'],
    },
  ],
  values: { matched: 3, verdict: 'healthy' },
  rows: [
    {
      id: 'r1',
      values: { title: 'Frontend engineer', company: 'Example GmbH' },
      title: 'Frontend engineer',
    },
    {
      id: 'r2',
      values: { title: 'Platform engineer', company: 'Sample AG' },
      title: 'Platform engineer',
    },
  ],
}

function Harness(
  props: Omit<Partial<React.ComponentProps<typeof ActionResultDialog>>, 'status'> & {
    status: React.ComponentProps<typeof ActionResultDialog>['status']
  },
) {
  const [open, setOpen] = React.useState(true)
  return (
    <ActionResultDialog
      open={open}
      onOpenChange={(next) => {
        action('onOpenChange')(String(next))
        setOpen(next)
      }}
      onSurfaceAction={(a) => action('onSurfaceAction')(`${a.id}${a.rowId ? ` on ${a.rowId}` : ''}`)}
      {...props}
    />
  )
}

export const Ready = () => (
  <Harness
    status="ready"
    result={{
      title: 'cv-gallery',
      surface: RESULT_SURFACE,
    }}
  />
)

export const Loading = () => <Harness status="loading" />

export const Failed = () => (
  <Harness status="error" errorDetail="rate-limited: retry in 30s" onRetry={() => action('onRetry')()} />
)
