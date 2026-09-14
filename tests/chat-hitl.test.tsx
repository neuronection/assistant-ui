import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { HitlProposalCard } from '../src/components/chat-hitl'
import { FieldDiff } from '../src/components/chat-hitl/FieldDiff'

const DIFF = [
  { field: 'end', label: 'End date', before: null, after: '2026-06-30' },
  { field: 'hours_per_week', label: 'Hours per week', before: 35, after: 20 },
]

describe('HitlProposalCard', () => {
  it('renders a pending card with diff rows and resolve actions', async () => {
    const onApprove = vi.fn()
    const onReject = vi.fn()
    render(
      <HitlProposalCard
        title="Update experience · Siemens internship"
        status="pending"
        diff={DIFF}
        onApprove={onApprove}
        onReject={onReject}
      />,
    )
    expect(
      screen.getByText('Update experience · Siemens internship'),
    ).toBeInTheDocument()
    expect(screen.getByText('End date')).toBeInTheDocument()
    expect(screen.getByText('2026-06-30')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Reject' }))
    expect(onReject).toHaveBeenCalledTimes(1)
    expect(onApprove).not.toHaveBeenCalled()
  })

  it('fires approve from the keyboard', async () => {
    const onApprove = vi.fn()
    render(
      <HitlProposalCard
        title="Add skill · docker"
        status="pending"
        onApprove={onApprove}
      />,
    )
    const user = userEvent.setup()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Approve' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('arms a destructive confirm before firing approve', async () => {
    const onApprove = vi.fn()
    render(
      <HitlProposalCard
        title="Delete experience · Siemens internship"
        status="pending"
        destructive
        onApprove={onApprove}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onApprove).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Approve' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('disables actions while busy and surfaces resolve errors', () => {
    render(
      <HitlProposalCard
        title="Add skill · docker"
        status="pending"
        busy
        error="Apply failed: level must be 1–10"
        onApprove={() => {}}
      />,
    )
    const approve = screen.getByRole('button', { name: /approve/i }) as HTMLButtonElement
    expect(approve).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Apply failed: level must be 1–10',
    )
  })

  it.each([
    ['approved', 'Approved'],
    ['rejected', 'Rejected'],
    ['expired', 'Expired'],
  ] as const)('terminal status %s renders no actions', (status, label) => {
    const { rerender } = render(
      <HitlProposalCard title="T" status={status} onApprove={() => {}} />,
    )
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<HitlProposalCard title="T" status="pending" onApprove={() => {}} />)
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })

  it('shows the conflict hint and warning status', () => {
    render(
      <HitlProposalCard title="Update education · TU Munich" status="conflict" />,
    )
    expect(screen.getByText('Changed since proposed')).toBeInTheDocument()
    expect(
      screen.getByText(/The data changed — review the diff and ask again/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('passes axe in pending and conflict states', async () => {
    const { container } = render(
      <HitlProposalCard
        title="Update experience · Siemens internship"
        status="pending"
        diff={DIFF}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FieldDiff', () => {
  it('renders long text pairs through TextDiffView', () => {
    const { container } = render(
      <FieldDiff
        row={{
          field: 'description',
          label: 'Description',
          before: 'a'.repeat(120),
          after: 'b'.repeat(120),
        }}
      />,
    )
    expect(container.querySelector('[data-as="text-diff-view"]')).not.toBeNull()
  })

  it('renders inline for scalars', () => {
    const { container } = render(
      <FieldDiff row={{ field: 'level', before: 4, after: 7 }} />,
    )
    expect(container.querySelector('[data-as="hitl-field-diff"]')).not.toBeNull()
    expect(container.querySelector('[data-as="text-diff-view"]')).toBeNull()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('stringifies object values', () => {
    render(
      <FieldDiff
        row={{ field: 'links', before: null, after: [{ url: 'https://x' }] }}
      />,
    )
    expect(screen.getByText('[{"url":"https://x"}]')).toBeInTheDocument()
  })
})
