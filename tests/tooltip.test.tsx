import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  InfoTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/tooltip'

describe('Tooltip', () => {
  it('shows content when the trigger is focused (keyboard)', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Helpful text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
    expect(screen.getByText('Helpful text')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('InfoTooltip', () => {
  it('renders an accessible trigger with default label', () => {
    render(
      <TooltipProvider>
        <InfoTooltip content="Details" />
      </TooltipProvider>,
    )
    expect(screen.getByRole('button', { name: 'Information' })).toBeInTheDocument()
  })

  it('click mode opens a popover with content', async () => {
    const user = userEvent.setup()
    render(<InfoTooltip content="Rich help" title="About" trigger="click" />)
    await user.click(screen.getByRole('button', { name: 'Information' }))
    expect(await screen.findByText('Rich help')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})
