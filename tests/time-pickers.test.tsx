import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { TimePicker } from '../src/components/time-picker/TimePicker'
import { TimeList } from '../src/components/time-list/TimeList'

function PickerDemo(props: Partial<React.ComponentProps<typeof TimePicker>>) {
  const [value, setValue] = React.useState<string | null>('14:30')
  return <TimePicker value={value} onChange={setValue} {...props} />
}

describe('TimePicker', () => {
  it('shows the 12-hour readout for a 24-hour value', () => {
    render(<PickerDemo />)
    expect(screen.getByRole('button', { name: 'Choose time' })).toHaveTextContent(
      '2:30 PM',
    )
  })

  it('shows the placeholder when empty', () => {
    render(<PickerDemo value={null} placeholder="Pick a time…" />)
    expect(screen.getByRole('button', { name: 'Choose time' })).toHaveTextContent(
      'Pick a time…',
    )
  })

  it('opens the clock, edits the hour field, and commits a 24-hour value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker value="09:00" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    const hourInput = await screen.findByRole('slider', { name: 'Hour' })
    expect(hourInput).toBeInTheDocument()
    const field = screen.getByRole('textbox', { name: 'Hour' }) as HTMLInputElement
    await user.clear(field)
    await user.type(field, '11')
    await user.tab()
    expect(onChange).toHaveBeenCalledWith('11:00')
  })

  it('keyboard-navigates the clock face with arrows (keyboard)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker value="10:00" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    const clock = await screen.findByRole('slider', { name: 'Hour' })
    clock.focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('11:00')
  })

  it('toggles AM/PM from the segmented control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker value="09:15" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    await screen.findByRole('slider', { name: 'Hour' })
    await user.click(screen.getByRole('button', { name: 'PM' }))
    expect(onChange).toHaveBeenCalledWith('21:15')
  })

  it('Done closes the popover (keyboard: Escape closes too)', async () => {
    const user = userEvent.setup()
    render(<PickerDemo />)
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    await screen.findByRole('slider', { name: 'Hour' })
    await user.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() =>
      expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    await screen.findByRole('slider', { name: 'Hour' })
    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
    )
  })

  it('typing 24h hours normalizes AM/PM (type 14 → 2 PM)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker value="09:00" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    await screen.findByRole('slider', { name: 'Hour' })
    const field = screen.getByRole('textbox', { name: 'Hour' }) as HTMLInputElement
    await user.clear(field)
    await user.type(field, '14')
    await user.tab()
    expect(onChange).toHaveBeenCalledWith('14:00')
  })

  it('has no axe violations open', async () => {
    const user = userEvent.setup()
    render(<PickerDemo />)
    await user.click(screen.getByRole('button', { name: 'Choose time' }))
    await screen.findByRole('slider', { name: 'Hour' })
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

function ListDemo(props: Partial<React.ComponentProps<typeof TimeList>>) {
  const [value, setValue] = React.useState<string[]>(['08:00', '21:30'])
  return <TimeList value={value} onChange={setValue} {...props} />
}

describe('TimeList', () => {
  it('renders chips with 12-hour readouts', () => {
    render(<ListDemo />)
    expect(screen.getByRole('button', { name: 'Edit 08:00' })).toHaveTextContent('8:00')
    expect(screen.getByRole('button', { name: 'Edit 21:30' })).toHaveTextContent('9:30')
  })

  it('adds a default 09:00 chip via the add pill', async () => {
    const user = userEvent.setup()
    render(<ListDemo />)
    await user.click(screen.getByRole('button', { name: 'Add time' }))
    expect(screen.getByRole('button', { name: 'Edit 09:00' })).toBeInTheDocument()
  })

  it('removes a chip via its hover X', async () => {
    const user = userEvent.setup()
    render(<ListDemo />)
    await user.click(screen.getAllByRole('button', { name: 'Remove time' })[0]!)
    expect(screen.queryByRole('button', { name: 'Edit 08:00' })).not.toBeInTheDocument()
  })

  it('edits a chip through the clock popover', async () => {
    const user = userEvent.setup()
    render(<ListDemo />)
    await user.click(screen.getByRole('button', { name: 'Edit 08:00' }))
    const clock = await screen.findByRole('slider', { name: 'Hour' })
    expect(clock).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() =>
      expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
    )
  })

  it('caps chips at maxItems and notes it', () => {
    render(<ListDemo maxItems={2} />)
    expect(screen.queryByRole('button', { name: 'Add time' })).not.toBeInTheDocument()
    expect(screen.getByText('Maximum of 2 items.')).toBeInTheDocument()
  })

  it('shows the empty label when the list is empty', () => {
    render(<ListDemo value={[]} emptyLabel="No times yet" />)
    expect(screen.getByText('No times yet')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<ListDemo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
