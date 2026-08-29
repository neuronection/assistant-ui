import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '../src/components/modal/Modal'
import { Button } from '../src/components/button/Button'

function DemoModal() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Dialog title</ModalTitle>
          <ModalDescription>Dialog description</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="outline">Dismiss</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

describe('Modal', () => {
  it('opens on trigger click and renders title, description and close button', async () => {
    const user = userEvent.setup()
    render(<DemoModal />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dialog title' })).toBeInTheDocument()
    expect(screen.getByText('Dialog description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger (keyboard)', async () => {
    const user = userEvent.setup()
    render(<DemoModal />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes via the built-in close button', async () => {
    const user = userEvent.setup()
    render(<DemoModal />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(await screen.findByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opened dialog has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(<DemoModal />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})
