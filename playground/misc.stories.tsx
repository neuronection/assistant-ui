import { Inbox } from 'lucide-react'
import { Button } from '../src/components/button/Button'
import { EmptyState } from '../src/components/empty-state/EmptyState'
import { Input } from '../src/components/input/Input'
import { Spinner } from '../src/components/spinner/Spinner'
import { PanelModal } from '../src/components/modal/PanelModal'
import { useState } from 'react'

function PanelModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open panel modal</Button>
      <PanelModal
        open={open}
        onOpenChange={setOpen}
        title="Medication details"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </div>
        }
      >
        <p style={{ fontSize: 14 }}>
          Full-screen on mobile, centered card on desktop. The body scrolls; the
          footer stays pinned.
        </p>
      </PanelModal>
    </>
  )
}

export const PanelModalStory = () => <PanelModalDemo />


export const Inputs = () => (
  <div style={{ display: 'grid', gap: 20, maxWidth: 360 }}>
    <Input label="API key" hint="Write-only; stored in the system keyring." />
    <Input label="Model name" error="This field is required." />
    <Input placeholder="No label variant" />
  </div>
)

export const Empty = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
    <EmptyState icon={Inbox} title="No documents yet" description="Upload a file to get started." />
    <EmptyState icon={Inbox} title="Compact variant" compact action={<Button size="sm">Upload</Button>} />
  </div>
)

export const Spinners = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Spinner size="sm" />
    <Spinner />
    <Spinner size="lg" />
    <Button loading>Saving</Button>
  </div>
)