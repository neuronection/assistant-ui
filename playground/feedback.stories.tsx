import { useState } from 'react'
import { ErrorBanner } from '../src/components/error-banner/ErrorBanner'
import { UndoNotice } from '../src/components/undo-notice/UndoNotice'
import { Button } from '../src/components/button/Button'

export const Errors = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
    <ErrorBanner message="Provider not configured" />
    <ErrorBanner
      message="Model list failed to load"
      action={
        <Button variant="outline" size="sm">
          Open settings
        </Button>
      }
    />
    <ErrorBanner message={null} />
  </div>
)

export const Undo = () => {
  const [notice, setNotice] = useState<'gone' | 'shown' | 'busy'>('gone')
  if (notice === 'gone') {
    return (
      <div style={{ maxWidth: 480 }}>
        <Button
          variant="outline"
          onClick={() => setNotice('shown')}
        >
          Delete something
        </Button>
      </div>
    )
  }
  return (
    <div style={{ maxWidth: 480 }}>
      <UndoNotice
        undoing={notice === 'busy'}
        duration={0}
        onUndo={() => setNotice('busy')}
        onDismiss={() => setNotice('gone')}
      />
    </div>
  )
}
