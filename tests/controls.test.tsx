import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { CheckIndicator } from '../src/components/check-indicator/CheckIndicator'
import { SelectionBar } from '../src/components/selection-bar/SelectionBar'
import { ViewToggle } from '../src/components/view-toggle/ViewToggle'
import { ErrorBanner } from '../src/components/error-banner/ErrorBanner'
import { UndoNotice } from '../src/components/undo-notice/UndoNotice'

describe('CheckIndicator', () => {
  it('reflects checked and mixed states in aria-checked', () => {
    const { rerender } = render(<CheckIndicator checked label="Select item" onToggle={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Select item' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    rerender(
      <CheckIndicator checked={false} mixed label="Select all" onToggle={() => {}} />,
    )
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    )
  })

  it('toggles via keyboard (Enter and Space)', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<CheckIndicator checked={false} label="Select item" onToggle={onToggle} />)
    const checkbox = screen.getByRole('checkbox', { name: 'Select item' })
    checkbox.focus()
    await user.keyboard('{Enter}')
    expect(onToggle).toHaveBeenCalledTimes(1)
    await user.keyboard(' ')
    expect(onToggle).toHaveBeenCalledTimes(2)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <CheckIndicator checked={false} label="Select item" onToggle={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SelectionBar', () => {
  it('renders nothing when count is zero', () => {
    const { container } = render(
      <SelectionBar count={0} onClear={() => {}}>
        <span>extra</span>
      </SelectionBar>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows count and clears via button (keyboard)', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <SelectionBar count={4} onClear={onClear}>
        <button type="button">Move</button>
      </SelectionBar>,
    )
    expect(screen.getByText('4 selected')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Move' }))
    const clear = screen.getByRole('button', { name: 'Clear selection' })
    clear.focus()
    await user.keyboard('{Enter}')
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('has no axe violations', async () => {
    const { container } = render(<SelectionBar count={2} onClear={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ViewToggle', () => {
  it('switches views by click and keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle view="grid" onChange={onChange} />)
    const grid = screen.getByRole('button', { name: 'Grid view' })
    const list = screen.getByRole('button', { name: 'List view' })
    expect(grid).toHaveAttribute('aria-pressed', 'true')
    expect(list).toHaveAttribute('aria-pressed', 'false')
    await user.click(list)
    expect(onChange).toHaveBeenCalledWith('list')
    list.focus()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('has no axe violations', async () => {
    const { container } = render(<ViewToggle view="grid" onChange={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ErrorBanner', () => {
  it('renders nothing without a message', () => {
    const { container } = render(<ErrorBanner message={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('announces the message and renders an action slot', () => {
    render(
      <ErrorBanner
        message="Provider not configured"
        action={<button type="button">Open settings</button>}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Provider not configured')
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<ErrorBanner message="Something broke" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('UndoNotice', () => {
  it('fires onUndo from the button', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    render(<UndoNotice onUndo={onUndo} onDismiss={() => {}} duration={0} />)
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalledOnce()
  })

  it('fires onUndo via keyboard (Enter)', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    render(<UndoNotice onUndo={onUndo} onDismiss={() => {}} duration={0} />)
    const button = screen.getByRole('button', { name: 'Undo' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(onUndo).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after the duration', async () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<UndoNotice onUndo={() => {}} onDismiss={onDismiss} duration={8000} />)
    expect(onDismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(8000)
    expect(onDismiss).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <UndoNotice onUndo={() => {}} onDismiss={() => {}} duration={0} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
