import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { HitlProposalCard } from '../src/components/chat-hitl'
import { FieldDiff } from '../src/components/chat-hitl/FieldDiff'
import { FieldSummary } from '../src/components/chat-hitl/FieldSummary'

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

  it('renders the preview slot on pending and approved cards', async () => {
    const onPreview = vi.fn()
    const { unmount } = render(
      <HitlProposalCard
        title="Update experience · X"
        status="pending"
        diff={DIFF}
        onApprove={() => {}}
        onReject={() => {}}
        onPreview={onPreview}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(onPreview).toHaveBeenCalledTimes(1)
    unmount()

    render(
      <HitlProposalCard
        title="Update experience · X"
        status="approved"
        diff={DIFF}
        onPreview={onPreview}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(onPreview).toHaveBeenCalledTimes(2)
  })

  it('renders the reverted terminal status without actions', () => {
    const { container } = render(
      <HitlProposalCard
        title="Update experience · X"
        status="reverted"
        diff={DIFF}
      />,
    )
    expect(screen.getByText('Reverted')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container.querySelector('[data-status="reverted"]')).not.toBeNull()
  })

  it('hides the preview button when no slot is given', () => {
    render(
      <HitlProposalCard
        title="Update experience · X"
        status="approved"
        diff={DIFF}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Preview' })).not.toBeInTheDocument()
  })

  it('runs axe with the preview slot and a reverted card', async () => {
    const onPreview = vi.fn()
    const { container } = render(
      <div>
        <HitlProposalCard
          title="Update experience · X"
          status="pending"
          diff={DIFF}
          onPreview={onPreview}
          onApprove={() => {}}
          onReject={() => {}}
        />
        <HitlProposalCard
          title="Update experience · X"
          status="reverted"
          diff={DIFF}
          onPreview={onPreview}
        />
      </div>,
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

  it('renders structured collection entries as chips, not raw JSON', () => {
    const { container } = render(
      <FieldDiff
        row={{
          field: 'skills',
          before: [
            {
              id: 's1',
              skill_key: 'python',
              skill_label: 'Python',
              role_in_item: 'primary',
              level_claim: null,
            },
          ],
          after: [
            {
              id: 's1',
              skill_key: 'python',
              skill_label: 'Python',
              role_in_item: 'primary',
              level_claim: null,
            },
            {
              id: 's2',
              skill_key: 'docker',
              skill_label: 'Docker',
              role_in_item: 'secondary',
              level_claim: 4,
            },
          ],
        }}
      />,
    )
    expect(container.querySelectorAll('[data-as="hitl-field-chips"]').length).toBe(2)
    expect(screen.getAllByText('Python (primary)')).toHaveLength(2)
    expect(screen.getByText('Docker (secondary · lvl 4)')).toBeInTheDocument()
    expect(screen.queryByText(/skill_key/)).not.toBeInTheDocument()
  })

  it('renders scalar string arrays as plain text (back-compat)', () => {
    render(
      <FieldDiff row={{ field: 'links', before: null, after: [{ url: 'https://x' }] }} />,
    )
    expect(screen.getByText('https://x')).toBeInTheDocument()
    expect(screen.queryByText('[{"url":"https://x"}]')).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-as="hitl-field-chips"]'),
    ).not.toBeNull()
  })

  it('keeps stringifiying non-collection object values', () => {
    render(
      <FieldDiff
        row={{ field: 'metric', before: null, after: { within: 'P90', value: 12 } }}
      />,
    )
    expect(screen.getByText('{"within":"P90","value":12}')).toBeInTheDocument()
  })
})

describe('HitlProposalCard create summary', () => {
  it('renders create ops as field summaries without the diff grid', () => {
    const { container } = render(
      <HitlProposalCard
        title="Add experience · Desktop Assistant"
        status="pending"
        action="create"
        diff={[
          { field: 'title', label: 'Title', after: 'Desktop Assistant' },
          { field: 'kind', label: 'Type', after: 'project' },
          { field: 'org_name', label: 'Organization', after: '' },
          { field: 'end', label: 'End date', after: null },
          { field: 'open_ended', label: 'Open-ended', after: true },
        ]}
        onApprove={() => {}}
      />,
    )
    expect(
      container.querySelectorAll('[data-as="hitl-field-summary"]').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Desktop Assistant')).toBeInTheDocument()
    expect(screen.getByText('project')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.queryByText('—')).not.toBeInTheDocument()
    expect(screen.queryByText('Organization')).not.toBeInTheDocument()
    expect(screen.queryByText('End date')).not.toBeInTheDocument()
    expect(document.querySelectorAll('[data-as="text-diff-view"]')).toHaveLength(0)
  })

  it('keeps the classic diff grid for update and delete ops', () => {
    for (const action of ['update', 'delete', undefined] as const) {
      const { container, unmount } = render(
        <HitlProposalCard
          title="Update experience · X"
          status="pending"
          action={action}
          diff={DIFF}
        />,
      )
      expect(
        screen.getByText('—'),
        `action ${String(action)} should stay a diff`,
      ).toBeInTheDocument()
      expect(
        container.querySelectorAll('[data-as="hitl-field-summary"]'),
      ).toHaveLength(0)
      unmount()
    }
  })

  it('runs axe on a create card', async () => {
    const { container } = render(
      <HitlProposalCard
        title="Add experience · Desktop Assistant"
        status="pending"
        action="create"
        diff={[{ field: 'title', label: 'Title', after: 'X' }]}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FieldSummary', () => {
  it('renders long text as a prose block without diff colors', () => {
    const { container } = render(
      <FieldSummary
        rows={[
          {
            field: 'description',
            label: 'Description',
            after: 'a'.repeat(120),
          },
        ]}
      />,
    )
    expect(
      container.querySelector('[data-as="hitl-field-summary"][data-field="description"]'),
    ).not.toBeNull()
    expect(container.querySelector('[data-as="text-diff-view"]')).toBeNull()
    expect(screen.getByText('a'.repeat(120))).toBeInTheDocument()
  })

  it('renders collections as parsed chips, not raw JSON', () => {
    const { container } = render(
      <FieldSummary
        rows={[
          { field: 'skills', label: 'Skills', after: ['python', 'timescaledb'] },
          {
            field: 'links',
            label: 'Links',
            after: '["https://neuronection.com"]',
          },
        ]}
      />,
    )
    const chips = container.querySelectorAll('ul li')
    expect(chips.length).toBe(3)
    expect(screen.getByText('python')).toBeInTheDocument()
    expect(screen.getByText('timescaledb')).toBeInTheDocument()
    expect(screen.getByText('https://neuronection.com')).toBeInTheDocument()
    expect(screen.queryByText(/skill_key/)).not.toBeInTheDocument()
  })

  it('renders nothing when every row is empty', () => {
    const { container } = render(
      <FieldSummary
        rows={[{ field: 'org_name', label: 'Organization', after: '' }]}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders structured collections as chips in the create summary', () => {
    const { container } = render(
      <FieldSummary
        rows={[
          {
            field: 'skills',
            label: 'Skills',
            after: [
              { skill_key: 'python', role_in_item: 'primary', level_claim: 5 },
              { skill_key: 'docker', role_in_item: 'secondary' },
            ],
          },
        ]}
      />,
    )
    expect(container.querySelector('[data-as="hitl-field-chips"]')).not.toBeNull()
    expect(screen.getByText('python (primary · lvl 5)')).toBeInTheDocument()
    expect(screen.getByText('docker (secondary)')).toBeInTheDocument()
    expect(screen.queryByText(/skill_key/)).not.toBeInTheDocument()
  })

  it('runs axe with structured chip rows', async () => {
    const { container } = render(
      <FieldSummary
        rows={[
          {
            field: 'skills',
            label: 'Skills',
            after: [{ skill_key: 'python', role_in_item: 'primary' }],
          },
        ]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
