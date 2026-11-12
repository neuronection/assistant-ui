import { useState } from 'react'
import {
  ImportReviewCard,
  type ImportReviewReport,
} from '../src/components/import-review-card/ImportReviewCard'

const REPORT: ImportReviewReport = {
  groups: [
    { label: 'Basics', count: 4 },
    { label: 'Work', count: 2 },
    { label: 'Education', count: 1 },
  ],
  dropped: ['meta', 'projects[0].keywords'],
  warnings: ['studyType was not mapped; stored as high school'],
  conflicts: [{ field: 'headline', current: 'Analyst', incoming: 'Data Analyst' }],
  applied: false,
  created: 0,
}

export const Preview = () => {
  const [status, setStatus] = useState<'idle' | 'preview' | 'applied'>('preview')
  return (
    <div style={{ maxWidth: 560 }}>
      <ImportReviewCard
        title="JSON Resume"
        description="Export the profile in the community shape or import a file."
        accept="application/json,.json"
        fileName="resume.json"
        status={status}
        report={status === 'applied' ? { ...REPORT, applied: true, created: 7 } : REPORT}
        onFileSelected={() => {}}
        onApply={() => setStatus('applied')}
        onReset={() => setStatus('idle')}
      />
    </div>
  )
}

export const Idle = () => (
  <div style={{ maxWidth: 560 }}>
    <ImportReviewCard
      title="Calendar import"
      description="Choose an .ics export. Nothing is written until you apply."
      accept="text/calendar,.ics"
      onFileSelected={() => {}}
    />
  </div>
)
