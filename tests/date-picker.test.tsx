import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DatePicker } from '../src/components/date-picker/DatePicker'

function DatePickerDemo(props: Partial<React.ComponentProps<typeof DatePicker>>) {
  const [value, setValue] = React.useState<string | null>(null)
  return (
    <DatePicker value={value} onChange={setValue} {...props} />
  )
}

async function openCalendar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Choose date' }))
  await screen.findByRole('grid')
}

const dayButton = (iso: string) =>
  document.querySelector<HTMLButtonElement>(`[data-day="${iso}"]`)

const isoOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const now = new Date()
const currentMonth = (day: number) => new Date(now.getFullYear(), now.getMonth(), day)

describe('DatePicker', () => {
  it('opens the calendar and selects a day', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const selected = currentMonth(15)
    render(<DatePicker value="" onChange={onChange} />)
    await openCalendar(user)
    await user.click(dayButton(isoOf(selected))!)
    expect(onChange).toHaveBeenCalledWith(isoOf(selected))
    await waitFor(() =>
      expect(screen.queryByRole('grid')).not.toBeInTheDocument(),
    )
  })

  it('shows the formatted value in the trigger', () => {
    render(<DatePickerDemo value="2026-08-15" />)
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveTextContent(
      '15/08/2026',
    )
  })

  it('supports a custom display format and placeholder', () => {
    render(
      <DatePickerDemo displayFormat="yyyy-MM-dd" placeholder="Pick a date…" />,
    )
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveTextContent(
      'Pick a date…',
    )
  })

  it('navigates the day grid with arrow keys and selects with Enter (keyboard)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePickerDemo value="2026-08-10" onChange={onChange} />)
    await openCalendar(user)
    await user.keyboard('{ArrowRight}')
    expect(dayButton('2026-08-11')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(dayButton('2026-08-18')).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('2026-08-18')
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  it('marks today and keeps roving tabindex', async () => {
    const user = userEvent.setup()
    const today = new Date()
    render(<DatePickerDemo />)
    await openCalendar(user)
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(dayButton(todayIso)).toHaveAttribute('aria-current', 'date')
    expect(dayButton(todayIso)).toHaveAttribute('tabindex', '0')
  })

  it('disables days outside min/max', async () => {
    const user = userEvent.setup()
    render(
      <DatePickerDemo minDate={currentMonth(10)} maxDate={currentMonth(20)} />,
    )
    await openCalendar(user)
    expect(dayButton(isoOf(currentMonth(5)))).toBeDisabled()
    expect(dayButton(isoOf(currentMonth(25)))).toBeDisabled()
    expect(dayButton(isoOf(currentMonth(15)))).toBeEnabled()
  })

  it('switches to years and months views via the header', async () => {
    const user = userEvent.setup()
    render(<DatePickerDemo value="2026-08-10" />)
    await openCalendar(user)
    await user.click(screen.getByRole('button', { name: /August 2026/ }))
    await user.click(screen.getByRole('button', { name: '2026' }))
    await user.click(screen.getByRole('button', { name: 'Jan' }))
    expect(dayButton('2026-01-01')).toBeInTheDocument()
  })

  it('clears via the clear button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onClear = vi.fn()
    render(
      <DatePickerDemo
        value="2026-08-15"
        onChange={onChange}
        allowClear
        onClear={onClear}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onChange).toHaveBeenCalledWith('')
    expect(onClear).toHaveBeenCalled()
  })

  it('Escape closes the calendar (keyboard)', async () => {
    const user = userEvent.setup()
    render(<DatePickerDemo />)
    await openCalendar(user)
    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('grid')).not.toBeInTheDocument(),
    )
  })

  it('does not open when disabled', () => {
    render(<DatePickerDemo disabled />)
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled()
  })

  it('renders the hidden form input', () => {
    const { container } = render(
      <DatePickerDemo value="2026-08-15" id="deadline" required />,
    )
    const hidden = container.querySelector('input[type="hidden"]')
    expect(hidden).toHaveAttribute('id', 'deadline')
    expect(hidden).toHaveAttribute('name', 'deadline')
    expect(hidden).toHaveAttribute('value', '2026-08-15')
  })

  it('has no axe violations closed and open', async () => {
    const user = userEvent.setup()
    const { container } = render(<DatePickerDemo value="2026-08-15" allowClear />)
    expect(await axe(container)).toHaveNoViolations()
    await openCalendar(user)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('DatePicker (unstyled variant)', () => {
  it('omits trigger chrome and keeps the value text', async () => {
    const user = userEvent.setup()
    const picked = currentMonth(5)
    render(<DatePickerDemo variant="unstyled" className="w-28 text-xs" />)
    const trigger = screen.getByRole('button', { name: 'Choose date' })
    expect(trigger).not.toHaveClass('border')
    await user.click(trigger)
    expect(await screen.findByRole('grid')).toBeInTheDocument()
    await user.click(dayButton(isoOf(picked))!)
    const dd = String(picked.getDate()).padStart(2, '0')
    const mm = String(picked.getMonth() + 1).padStart(2, '0')
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveTextContent(
      `${dd}/${mm}/${picked.getFullYear()}`,
    )
  })
})
