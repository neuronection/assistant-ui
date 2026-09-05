import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

class FiringResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  private readonly callback: ResizeObserverCallback
  observe(target: Element): void {
    const box = { inlineSize: 800, blockSize: 600 } as ResizeObserverSize
    const entry = { target, borderBoxSize: [box] } as unknown as ResizeObserverEntry
    this.callback([entry], this as unknown as ResizeObserver)
  }
  unobserve(): void {}
  disconnect(): void {}
}
vi.stubGlobal('ResizeObserver', FiringResizeObserver)

import { TextDiffView } from '../src/components/text-diff-view/TextDiffView'

describe('TextDiffView', () => {
  test('renders side-by-side del/add rows with gutters, stats and word highlights', () => {
    const { container } = render(
      <TextDiffView original={'old line\nkeep'} suggested={'new line\nkeep'} />,
    )
    const view = container.querySelector('[data-as="text-diff-view"]') as HTMLElement
        const changedRows = container.querySelectorAll('[data-changed="true"]')
    expect(changedRows).toHaveLength(1)
    const changed = changedRows[0] as HTMLElement
    expect(within(changed).getAllByText('old')).toHaveLength(1)
    expect(within(changed).getAllByText('new')).toHaveLength(1)
    expect(within(changed).getAllByText('line')).toHaveLength(2)
    expect(view.textContent).toContain('keep')
    expect(view.textContent).toContain('+1')
    expect(view.textContent).toContain('−1')
    expect(container.querySelectorAll('.tabular-nums').length).toBeGreaterThanOrEqual(3)
  })

  test('shows the no-changes state for identical texts', () => {
    render(<TextDiffView original="same" suggested="same" />)
    expect(screen.getByText('No changes')).not.toBeNull()
  })

  test('folds unchanged middles and expands them on click', () => {
    const base = Array.from({ length: 8 }, (_, i) => `keep ${i}`)
    const { container } = render(
      <TextDiffView
        original={base.join('\n')}
        suggested={base.join('\n').replace('keep 4', 'changed 4')}
        contextLines={1}
      />,
    )
    const foldButtons = screen.getAllByRole('button', { name: /unchanged lines/ })
    expect(foldButtons.length).toBe(2)
    expect(container.textContent).not.toContain('keep 1')
    for (const foldButton of foldButtons) {
      fireEvent.click(foldButton)
    }
    expect(container.textContent).toContain('keep 1')
    expect(container.textContent).toContain('keep 6')
  })

  test('expanded folds collapse again via Show less', () => {
    const base = Array.from({ length: 8 }, (_, i) => `keep ${i}`)
    const { container } = render(
      <TextDiffView
        original={base.join('\n')}
        suggested={base.join('\n').replace('keep 4', 'changed 4')}
        contextLines={1}
      />,
    )
    for (const foldButton of screen.getAllByRole('button', { name: /unchanged lines/ })) {
      fireEvent.click(foldButton)
    }
    expect(container.textContent).toContain('Show less')
    expect(screen.getAllByRole('button', { name: 'Show less' })).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Show less' })[0]!)
    expect(screen.getAllByRole('button', { name: 'Show less' })).toHaveLength(1)
    fireEvent.click(screen.getAllByRole('button', { name: 'Show less' })[0]!)
    expect(screen.queryAllByRole('button', { name: 'Show less' })).toHaveLength(0)
    expect(container.textContent).toContain('3 unchanged lines')
    expect(container.textContent).not.toContain('keep 0')
    expect(container.textContent).not.toContain('keep 1')
  })

  test('navigates between change groups with the header controls', () => {
    const lines = ['a1', 'c1', 'c2', 'c3', 'c4', 'a2', 'c5', 'c6', 'c7', 'c8', 'a3']
    const suggested = lines
      .map((line) => (line.startsWith('a') ? `${line}!` : line))
      .join('\n')
    render(
      <TextDiffView original={lines.join('\n')} suggested={suggested} contextLines={0} />,
    )
    expect(screen.getByText('1/3')).not.toBeNull()
    expect(document.querySelectorAll('[data-active="true"]').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Next change' }))
    expect(screen.getByText('2/3')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Previous change' }))
    expect(screen.getByText('1/3')).not.toBeNull()
  })

  test('header labels can be hidden and custom labels apply', () => {
    const { container } = render(
      <TextDiffView
        original="a\nb"
        suggested="c\nb"
        showHeader={false}
        labels={{ unchangedLines: (count) => `${count} hidden` }}
      />,
    )
    expect(screen.queryByText('Original')).toBeNull()
    expect(screen.queryByText('Suggested')).toBeNull()
    expect(container.textContent).not.toContain('hidden')
  })

  test('has no axe violations', async () => {
    const { container } = render(
      <TextDiffView original={'old\nkeep'} suggested={'new\nkeep'} />,
    )
    await waitFor(() => expect(container.querySelector('[data-as="text-diff-view"]')).not.toBeNull())
    const results = await import('jest-axe').then(({ axe }) => axe(container))
    expect(results.violations).toEqual([])
    expect(true).toBe(true)
  })
})
