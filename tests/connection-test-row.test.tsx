import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ConnectionTestRow } from '../src/components/connection-test-row/ConnectionTestRow'

describe('ConnectionTestRow', () => {
  it('renders the label when given', () => {
    render(<ConnectionTestRow status="idle" label="Connection" />)
    expect(screen.getByText('Connection')).toBeInTheDocument()
  })

  it('renders no filler label when unset — the status speaks', async () => {
    const user = userEvent.setup()
    const onTest = vi.fn()
    const { container } = render(
      <ConnectionTestRow
        status="idle"
        idleLabel="Not tested"
        meta="2 models"
        testLabel="Test"
        onTest={onTest}
      />,
    )
    expect(screen.queryByText('Connection')).toBeNull()
    expect(screen.getByText('Not tested')).toBeInTheDocument()
    expect(screen.getByText('2 models')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Test' }))
    expect(onTest).toHaveBeenCalledTimes(1)
    expect(await axe(container)).toHaveNoViolations()
  })
})
