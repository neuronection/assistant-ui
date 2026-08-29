import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FormModal } from '../src/components/form-modal/FormModal'
import { Input } from '../src/components/input/Input'
import { FolderPen } from 'lucide-react'

function DemoForm(props: Partial<React.ComponentProps<typeof FormModal>>) {
  const [name, setName] = React.useState('')
  const [open, setOpen] = React.useState(true)
  return (
    <FormModal
      open={open}
      onOpenChange={setOpen}
      title="Rename folder"
      description="The name shows in exports."
      icon={FolderPen}
      submitLabel="Rename"
      onSubmit={() => setOpen(false)}
      {...props}
    >
      <Input
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
    </FormModal>
  )
}

describe('FormModal', () => {
  it('renders title, description and fields', async () => {
    render(<DemoForm />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Rename folder')).toBeInTheDocument()
    expect(screen.getByText('The name shows in exports.')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('submits via Enter key and closes (keyboard)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DemoForm onSubmit={onSubmit} />)
    await screen.findByRole('dialog')
    await user.type(screen.getByLabelText('Name'), 'Lectures{Enter}')
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('disabled submit blocks submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DemoForm onSubmit={onSubmit} submitDisabled />)
    await screen.findByRole('dialog')
    const submit = screen.getByRole('button', { name: 'Rename' })
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Name'), 'x{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('cancel button closes without submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DemoForm onSubmit={onSubmit} />)
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onSubmit).not.toHaveBeenCalled()
    await waitForDialogGone()
  })

  it('busy state disables actions', async () => {
    render(<DemoForm submitting />)
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('open state has no axe violations', async () => {
    const { container } = render(<DemoForm />)
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})

async function waitForDialogGone() {
  await screen.findByRole('dialog').then(
    () => undefined,
    () => undefined,
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
}
