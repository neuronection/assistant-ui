import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { AiMagicFill } from '../src/components/ai-magic-fill/AiMagicFill'

function Demo(props: Partial<React.ComponentProps<typeof AiMagicFill>>) {
  const [open, setOpen] = React.useState(true)
  return (
    <AiMagicFill open={open} onOpenChange={setOpen} onSubmit={() => setOpen(false)} {...props} />
  )
}

describe('AiMagicFill', () => {
  it('renders title, subtitle, prompt and description', async () => {
    render(
      <Demo
        title="Magic Fill"
        subtitle="AI-powered data extraction"
        description="Describe the visit; the AI fills the form."
      />,
    )
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Magic Fill')).toBeInTheDocument()
    expect(screen.getByText('AI-powered data extraction')).toBeInTheDocument()
    expect(screen.getByLabelText('Describe details')).toBeInTheDocument()
    expect(screen.getByText('Describe the visit; the AI fills the form.')).toBeInTheDocument()
  })

  it('disables submit until there is a prompt, then submits and clears', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Demo onSubmit={onSubmit} />)
    await screen.findByRole('dialog')
    const apply = screen.getByRole('button', { name: 'Apply Magic Fill' })
    expect(apply).toBeDisabled()
    await user.type(screen.getByLabelText('Describe details'), 'Metformin 500mg')
    await user.click(apply)
    expect(onSubmit).toHaveBeenCalledWith('Metformin 500mg')
  })

  it('shows the error state', async () => {
    render(<Demo error="Assistant unavailable" />)
    await screen.findByRole('dialog')
    expect(screen.getByRole('alert')).toHaveTextContent('Assistant unavailable')
  })

  it('busy state disables actions', async () => {
    render(<Demo busy />)
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Apply Magic Fill' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('has no axe violations open', async () => {
    render(<Demo description="Describe the visit." />)
    await screen.findByRole('dialog')
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
