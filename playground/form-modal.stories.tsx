import { useState } from 'react'
import { FolderPen } from 'lucide-react'
import { FormModal } from '../src/components/form-modal/FormModal'
import { Input } from '../src/components/input/Input'
import { Button } from '../src/components/button/Button'

function Demo(props: Partial<React.ComponentProps<typeof FormModal>>) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const trimmed = name.trim()
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Rename folder
      </Button>
      <FormModal
        open={open}
        onOpenChange={setOpen}
        title="Rename folder"
        description="The name is used in exports."
        icon={FolderPen}
        submitLabel="Rename"
        submitDisabled={!trimmed}
        onSubmit={() => setOpen(false)}
        {...props}
      >
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={300}
        />
      </FormModal>
    </>
  )
}

export const Default = () => <Demo />

export const Busy = () => <Demo submitting />
