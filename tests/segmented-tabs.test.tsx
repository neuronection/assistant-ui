import { describe, expect, it, vi, afterEach } from 'vitest'
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
    expect(list).not.toHaveAttribute('data-wrap')
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

describe('SegmentedTabs wrap', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const longItems = [
    { value: 'overview', label: 'Overview' },
    { value: 'ai', label: 'AI activity' },
    { value: 'usage', label: 'Usage & throughput' },
    { value: 'security', label: 'Security & access' },
    { value: 'jobs', label: 'Jobs & runs' },
    { value: 'failures', label: 'Failures' },
    { value: 'changes', label: 'Data changes' },
    { value: 'retrieval', label: 'Retrieval' },
  ]

  function rect(left: number, top: number, width: number, height: number): DOMRect {
    return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top } as unknown as DOMRect
  }
  function stubRects(selected: { left: number; top: number; width: number; height: number }) {
    return vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: Element) {
        if (this.getAttribute('role') === 'tab' && this.getAttribute('aria-selected') === 'true') {
          return rect(selected.left, selected.top, selected.width, selected.height)
        }
        return rect(0, 0, 500, 64)
      })
  }

  function renderWrapped(value = 'overview', onValueChange = vi.fn()) {
    return render(
      <SegmentedTabs items={longItems} value={value} onValueChange={onValueChange} ariaLabel="Audit views" wrap />,
    )
  }

  it('marks the wrapping tablist and keeps tab semantics', () => {
    renderWrapped()
    const list = screen.getByRole('tablist', { name: 'Audit views' })
    expect(list).toHaveAttribute('data-as', 'segmented-tabs')
    expect(list).toHaveAttribute('data-wrap')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Retrieval' })).toHaveAttribute('aria-selected', 'false')
  })

  it('keeps arrow-key navigation working when wrapped', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWrapped('retrieval', onValueChange)
    screen.getByRole('tab', { name: 'Retrieval' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('overview')
  })

  it('has no axe violations when wrapped', async () => {
    const { container } = renderWrapped()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('measures the thumb from the selected tab geometry', () => {
    const rectSpy = stubRects({ left: 12, top: 22, width: 80, height: 28 })
    const { container } = renderWrapped()
    expect(container.querySelector('[data-thumb]')).toHaveStyle({
      width: '80px',
      height: '28px',
      transform: 'translate(12px, 22px)',
    })
    rectSpy.mockRestore()
  })

  it('re-measures the thumb when the selection changes', () => {
    const selected = { left: 2, top: 2, width: 80, height: 28 }
    const rectSpy = stubRects(selected)
    const { rerender, container } = renderWrapped()
    expect(container.querySelector('[data-thumb]')).toHaveStyle({ transform: 'translate(2px, 2px)' })
    selected.left = 300
    selected.top = 34
    selected.width = 90
    rerender(
      <SegmentedTabs items={longItems} value="retrieval" onValueChange={() => {}} ariaLabel="Audit views" wrap />,
    )
    expect(container.querySelector('[data-thumb]')).toHaveStyle({
      width: '90px',
      transform: 'translate(300px, 34px)',
    })
    rectSpy.mockRestore()
  })

  it('re-measures through the ResizeObserver when the layout reflows', () => {
    const callbacks: ResizeObserverCallback[] = []
    class FakeResizeObserver {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
      constructor(cb: ResizeObserverCallback) {
        callbacks.push(cb)
      }
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    const selected = { left: 2, top: 2, width: 80, height: 28 }
    const rectSpy = stubRects(selected)
    try {
      const { container } = renderWrapped()
      expect(container.querySelector('[data-thumb]')).toHaveStyle({ transform: 'translate(2px, 2px)' })
      selected.left = 120
      callbacks[0]?.([], undefined as unknown as ResizeObserver)
      expect(container.querySelector('[data-thumb]')).toHaveStyle({ transform: 'translate(120px, 2px)' })
    } finally {
      rectSpy.mockRestore()
      vi.unstubAllGlobals()
    }
  })
})
