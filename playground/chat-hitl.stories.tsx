import { HitlProposalCard } from '../src/components/chat-hitl'

const DIFF = [
  { field: 'end', label: 'End date', before: null, after: '2026-06-30' },
  { field: 'open_ended', label: 'Open-ended', before: true, after: false },
  { field: 'hours_per_week', label: 'Hours per week', before: 35, after: 20 },
]

const LONG = {
  field: 'description',
  label: 'Description',
  before:
    'Supported the data team with dashboard maintenance and weekly reporting for three product areas.',
  after:
    'Supported the data team with dashboard maintenance, weekly reporting for three product areas and shipped a self-serve metrics explorer used by 40 people.',
}

export const Pending = () => (
  <div style={{ maxWidth: 420 }}>
    <HitlProposalCard
      title="Update experience · Siemens internship"
      status="pending"
      diff={DIFF}
      onApprove={() => {}}
      onReject={() => {}}
    />
  </div>
)

export const PendingLongText = () => (
  <div style={{ maxWidth: 420 }}>
    <HitlProposalCard
      title="Update experience · Siemens internship"
      status="pending"
      diff={[...DIFF, LONG]}
      onApprove={() => {}}
      onReject={() => {}}
    />
  </div>
)

export const Destructive = () => (
  <div style={{ maxWidth: 420 }}>
    <HitlProposalCard
      title="Delete experience · Siemens internship"
      status="pending"
      destructive
      diff={DIFF.slice(0, 1)}
      onApprove={() => {}}
      onReject={() => {}}
    />
  </div>
)

export const Conflict = () => (
  <div style={{ maxWidth: 420 }}>
    <HitlProposalCard
      title="Update education · TU Munich"
      status="conflict"
      diff={[{ field: 'program', before: 'BSc Informatics', after: 'BSc CS' }]}
    />
  </div>
)

export const Resolved = () => (
  <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <HitlProposalCard
      title="Add skill · docker"
      status="approved"
      diff={[{ field: 'level', label: 'Level (1–10)', before: null, after: 4 }]}
    />
    <HitlProposalCard title="Delete certification · AWS CCP" status="rejected" />
    <HitlProposalCard title="Update profile section · academics" status="expired" />
  </div>
)
