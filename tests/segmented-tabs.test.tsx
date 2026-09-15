import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Layers, Palette } from 'lucide-react'
import { SegmentedTabs } from '../src/components/segmented-tabs/SegmentedTabs'

const items = [
  { value: 'context', label: 'Context', icon: Layers },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'sections', label: 'Sections' },
]

function renderTabs(overrides?: { value?: string; onValueChange?: (value: string) => void }) {
  const onValueChange = overrides?.onValueChange ?? vi.fn()
  const utils = render(
    <SegmentedTabs
      items={items}
      value={overrides?.value ?? 'context'}
      onValueChange={onValueChange}
      ariaLabel="Inspector panels"
    />,
  )
  return { onValueChange, view: utils }
}

describe('SegmentedTabs', () => {
  it('renders a tablist with tabs reflecting aria-selected', () => {
    renderTabs()
    const list = screen.getByRole('tablist', { name: 'Inspector panels' })
    expect(list).toHaveAttribute('data-as', 'segmented-tabs')
    expect(screen.getByRole('tab', { name: 'Context' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'false')
  })

  it('clicks activate a tab via onValueChange', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderTabs()
    await user.click(screen.getByRole('tab', { name: 'Design' }))
    expect(onValueChange).toHaveBeenCalledWith('design')
  })

  it('moves selection and focus with arrow keys and wraps', async () => {
    const user = userEvent.setup()
    const { view, onValueChange } = renderTabs()
    const contextTab = screen.getByRole('tab', { name: 'Context' })
    contextTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('design')
    view.rerender(
      <SegmentedTabs items={items} value="design" onValueChange={onValueChange} ariaLabel="Inspector panels" />,
    )
    expect(screen.getByRole('tab', { name: 'Design' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('sections')
    view.rerender(
      <SegmentedTabs items={items} value="sections" onValueChange={onValueChange} ariaLabel="Inspector panels" />,
    )
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('context')
    expect(screen.getByRole('tab', { name: 'Context' })).toHaveFocus()
  })

  it('supports Home, End and vertical arrows', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <SegmentedTabs items={items} value="sections" onValueChange={onValueChange} ariaLabel="Inspector panels" />,
    )
    screen.getByRole('tab', { name: 'Sections' }).focus()
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith('context')
    rerender(
      <SegmentedTabs items={items} value="context" onValueChange={onValueChange} ariaLabel="Inspector panels" />,
    )
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith('sections')
    rerender(
      <SegmentedTabs items={items} value="sections" onValueChange={onValueChange} ariaLabel="Inspector panels" />,
    )
    await user.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('design')
  })

  it('skips disabled tabs when moving', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <SegmentedTabs
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta', disabled: true },
          { value: 'c', label: 'Gamma' },
        ]}
        value="a"
        onValueChange={onValueChange}
        ariaLabel="Panels"
      />,
    )
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('c')
    expect(screen.getByRole('tab', { name: 'Beta' })).toBeDisabled()
  })

  it('renders the sliding thumb for the active segment', () => {
    const { container } = render(<SegmentedTabs items={items} value="design" onValueChange={() => {}} ariaLabel="Inspector panels" />)
    const thumb = container.querySelector('[data-thumb]')
    expect(thumb).toHaveAttribute('aria-hidden')
    expect(thumb).toHaveStyle({ transform: 'translateX(100%)' })
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SegmentedTabs items={items} value="design" onValueChange={() => {}} ariaLabel="Inspector panels" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
