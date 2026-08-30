import { describe, expect, it, vi } from 'vitest'
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
import { PanelModal } from '../src/components/modal/PanelModal'
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

describe('PanelModal', () => {
  it('renders title, body and footer with a close button', async () => {
    render(
      <PanelModal open onOpenChange={() => {}} title="Details" footer={<button>Save</button>}>
        <p>Panel body</p>
      </PanelModal>,
    )
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('hideHeader keeps a floating close button', async () => {
    render(
      <PanelModal open onOpenChange={() => {}} title="Hidden" hideHeader>
        <p>Body</p>
      </PanelModal>,
    )
    await screen.findByRole('dialog')
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('Escape closes via onOpenChange (keyboard)', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <PanelModal open onOpenChange={onOpenChange} title="Esc">
        <button>Focusable</button>
      </PanelModal>,
    )
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('headerActions render in the header', async () => {
    render(
      <PanelModal
        open
        onOpenChange={() => {}}
        title="T"
        headerActions={<button type="button">Act</button>}
      >
        <p>b</p>
      </PanelModal>,
    )
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument()
  })

  it('size applies the desktop max-width', async () => {
    render(
      <PanelModal open onOpenChange={() => {}} title="Wide" size="lg">
        <p>b</p>
      </PanelModal>,
    )
    await screen.findByRole('dialog')
    expect(document.body.querySelector('[data-as="panel-modal"]')).toHaveClass('sm:max-w-4xl')
  })

  it('open state has no axe violations', async () => {
    render(
      <PanelModal open onOpenChange={() => {}} title="A11y" footer={<button>Ok</button>}>
        <p>body</p>
      </PanelModal>,
    )
    await screen.findByRole('dialog')
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('overlay positioning (TW3 collision guard)', () => {
  it('ModalContent centers via inset + auto margins, not translate utilities', async () => {
    render(
      <Modal open onOpenChange={() => {}}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>T</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    )
    await screen.findByRole('dialog')
    const dialog = document.body.querySelector('[data-as="modal"]')!
    expect(dialog).toHaveClass('inset-0')
    expect(dialog).toHaveClass('m-auto')
    expect(dialog.className).not.toMatch(/translate/)
  })

  it('PanelModal centers via inset + auto margins on desktop, not translate utilities', async () => {
    render(<PanelModal open onOpenChange={() => {}} title="T"><p>b</p></PanelModal>)
    await screen.findByRole('dialog')
    const panel = document.body.querySelector('[data-as="panel-modal"]')!
    expect(panel.className).not.toMatch(/translate/)
    expect(panel.className).toMatch(/sm:m[xy]-auto/)
  })
})
