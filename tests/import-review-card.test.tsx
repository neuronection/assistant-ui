import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ImportReviewCard } from '../src/components/import-review-card/ImportReviewCard'

const REPORT = {
  groups: [{ label: 'Work', count: 2 }],
  dropped: ['unknownField'],
  warnings: ['Study type was not mapped'],
  conflicts: [{ field: 'full_name', current: 'Old', incoming: 'Ada' }],
  applied: false,
  created: 0,
}

describe('ImportReviewCard', () => {
  it('renders the report, conflicts and dropped keys', () => {
    render(
      <ImportReviewCard
        title="JSON Resume"
        status="preview"
        report={REPORT}
        onFileSelected={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { name: 'JSON Resume' })).toBeInTheDocument()
    expect(screen.getByTestId('import-review-report')).toHaveTextContent('Work')
    expect(screen.getByTestId('import-review-conflicts')).toHaveTextContent('full_name')
    expect(screen.getByTestId('import-review-dropped')).toHaveTextContent('unknownField')
    expect(screen.getByTestId('import-review-warnings')).toHaveTextContent('Study type')
  })

  it('emits the selected file and never applies while busy', async () => {
    const user = userEvent.setup()
    const onFileSelected = vi.fn()
    const onApply = vi.fn()
    render(
      <ImportReviewCard
        title="Import"
        status="preview"
        report={REPORT}
        busy
        onFileSelected={onFileSelected}
        onApply={onApply}
      />,
    )
    const file = new File(['{}'], 'resume.json', { type: 'application/json' })
    fireEvent.change(screen.getByTestId('import-review-file-input'), {
      target: { files: [file] },
    })
    expect(onFileSelected).toHaveBeenCalledWith(file)
    const apply = screen.getByTestId('import-review-apply')
    expect(apply).toBeDisabled()
    await user.click(apply)
    expect(onApply).not.toHaveBeenCalled()
  })

  it('applies from the keyboard and announces success', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const { rerender } = render(
      <ImportReviewCard
        title="Import"
        status="preview"
        report={REPORT}
        onFileSelected={vi.fn()}
        onApply={onApply}
      />,
    )
    const apply = screen.getByTestId('import-review-apply')
    apply.focus()
    await user.keyboard('{Enter}')
    expect(onApply).toHaveBeenCalled()
    rerender(
      <ImportReviewCard
        title="Import"
        status="applied"
        report={{ ...REPORT, applied: true, created: 2 }}
        onFileSelected={vi.fn()}
      />,
    )
    expect(screen.getByTestId('import-review-applied')).toHaveTextContent('Import applied')
    expect(screen.getByTestId('import-review-applied')).toHaveTextContent('2')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ImportReviewCard
        title="Import"
        status="preview"
        report={REPORT}
        onFileSelected={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
