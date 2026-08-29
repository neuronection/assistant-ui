import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/popover/Popover'
import { Button } from '../src/components/button/Button'

describe('Popover', () => {
  function DemoPopover() {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">More</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover body</p>
        </PopoverContent>
      </Popover>
    )
  }

  it('opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<DemoPopover />)
    await user.click(screen.getByRole('button', { name: 'More' }))
    expect(await screen.findByText('Popover body')).toBeInTheDocument()
  })

  it('closes on Escape and restores focus to the trigger (keyboard)', async () => {
    const user = userEvent.setup()
    render(<DemoPopover />)
    const trigger = screen.getByRole('button', { name: 'More' })
    await user.click(trigger)
    expect(await screen.findByText('Popover body')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('open state has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(<DemoPopover />)
    await user.click(screen.getByRole('button', { name: 'More' }))
    await screen.findByText('Popover body')
    expect(await axe(container)).toHaveNoViolations()
  })
})
