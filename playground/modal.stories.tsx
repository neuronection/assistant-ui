import { useState } from 'react'
import { Button } from '../src/components/button/Button'
import { ConfirmationModal } from '../src/components/confirmation-modal/ConfirmationModal'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '../src/components/modal/Modal'
import { Input } from '../src/components/input/Input'

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
      <Modal key={size}>
        <ModalTrigger asChild>
          <Button variant="outline">{size}</Button>
        </ModalTrigger>
        <ModalContent size={size}>
          <ModalHeader>
            <ModalTitle>Size: {size}</ModalTitle>
            <ModalDescription>Radii, surfaces and shadows come from tokens.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Input label="Project name" hint="Shown in exports" />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    ))}
  </div>
)

export const PaddingNone = () => (
  <Modal>
    <ModalTrigger asChild>
      <Button variant="outline">Full-bleed</Button>
    </ModalTrigger>
    <ModalContent padding="none">
      <div className="overflow-hidden rounded-[var(--as-radius-lg)]">
        <div className="bg-[var(--as-accent)] px-4 py-3 text-white">
          padding="none" — the dialog owns every pixel (command palettes,
          media, editors with their own chrome).
        </div>
        <div className="p-4">
          <Input label="Still a dialog" hint="Close button stays top-right" />
        </div>
      </div>
    </ModalContent>
  </Modal>
)

export const Confirmation = () => {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete provider
      </Button>
      <ConfirmationModal
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          setBusy(true)
          setTimeout(() => {
            setBusy(false)
            setOpen(false)
          }, 1200)
        }}
        title="Delete provider?"
        description="Models served by this provider will become unavailable."
        confirmLabel="Delete"
        destructive
        busy={busy}
      />
    </>
  )
}
