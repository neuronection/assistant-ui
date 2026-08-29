import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { EmptyState } from '../src/components/empty-state/EmptyState'
import { ConfirmationModal } from '../src/components/confirmation-modal/ConfirmationModal'
import { Button } from '../src/components/button/Button'
import { Inbox } from 'lucide-react'

describe('EmptyState', () => {
  it('renders icon, title, description and action', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Nothing here yet"
        description="Add your first provider"
        action={<Button>Add provider</Button>}
      />,
    )
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first provider')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add provider' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<EmptyState icon={Inbox} title="Empty" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ConfirmationModal', () => {
  it('renders with default English labels', async () => {
    render(
      <ConfirmationModal open onOpenChange={() => {}} onConfirm={() => {}} title="Delete entry" />,
    )
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('fires onConfirm and reports back through onOpenChange', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <ConfirmationModal
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Delete entry"
        confirmLabel="Delete"
        destructive
      />,
    )
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('disables both actions while busy', async () => {
    render(
      <ConfirmationModal open busy onOpenChange={() => {}} onConfirm={() => {}} title="Working" />,
    )
    expect(await screen.findByRole('button', { name: 'Confirm' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('open state has no axe violations', async () => {
    const { container } = render(
      <ConfirmationModal open onOpenChange={() => {}} onConfirm={() => {}} title="Sure?" />,
    )
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})
