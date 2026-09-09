import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import {
  MarkdownDiffView,
  splitMarkdownBlocks,
} from '../src/components/markdown-diff-view'

describe('splitMarkdownBlocks', () => {
  test('splits paragraphs on blank lines', () => {
    expect(splitMarkdownBlocks('one\ntwo\n\nthree')).toEqual(['one\ntwo', 'three'])
  })

  test('keeps fenced code with blank lines as one block', () => {
    const source = 'before\n\n```py\na = 1\n\nb = 2\n```\n\nafter'
    expect(splitMarkdownBlocks(source)).toEqual([
      'before',
      '```py\na = 1\n\nb = 2\n```',
      'after',
    ])
  })

  test('keeps $$ display math with blank lines as one block', () => {
    const source = 'intro\n\n$$\nx = \\tan u\n\ny = 1\n$$\n\noutro'
    expect(splitMarkdownBlocks(source)).toEqual([
      'intro',
      '$$\nx = \\tan u\n\ny = 1\n$$',
      'outro',
    ])
  })

  test('a single-line $$...$$ stays self-contained', () => {
    expect(splitMarkdownBlocks('a\n\n$$x^2$$\n\nb')).toEqual(['a', '$$x^2$$', 'b'])
  })

  test('an unclosed fence runs to the end', () => {
    expect(splitMarkdownBlocks('a\n\n```\nunfinished\n\nstill')).toEqual([
      'a',
      '```\nunfinished\n\nstill',
    ])
  })
})

describe('MarkdownDiffView', () => {
  test('renders changed blocks side-by-side with stats and shared context', () => {
    const { container } = render(
      <MarkdownDiffView
        original={'Old heading\n\nShared paragraph'}
        suggested={'New heading\n\nShared paragraph'}
      />,
    )
    const view = container.querySelector('[data-as="markdown-diff-view"]') as HTMLElement
    expect(container.querySelectorAll('[data-changed="true"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-context]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-kind="del"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-kind="add"]')).toHaveLength(1)
    expect(within(container.querySelector('[data-kind="del"]')!).getByText(/Old heading/)).not.toBeNull()
    expect(within(container.querySelector('[data-kind="add"]')!).getByText(/New heading/)).not.toBeNull()
    expect(view.textContent).toContain('Shared paragraph')
    expect(view.textContent).toContain('+1')
    expect(view.textContent).toContain('−1')
  })

  test('renders math through KaTeX in formatted blocks', async () => {
    const { container } = render(
      <MarkdownDiffView original="$$a_1$$" suggested="$$a_2$$" />,
    )
    await waitFor(() =>
      expect(container.querySelectorAll('.katex').length).toBeGreaterThan(0),
    )
  })

  test('shows the no-changes state for identical texts', () => {
    render(<MarkdownDiffView original="same" suggested="same" />)
    expect(screen.getByText('No changes')).not.toBeNull()
  })

  test('folds unchanged middles and expands them on click', () => {
    const base = Array.from({ length: 8 }, (_, i) => `keep ${i}`)
    const { container } = render(
      <MarkdownDiffView
        original={base.join('\n\n')}
        suggested={base.join('\n\n').replace('keep 4', 'changed 4')}
        contextBlocks={1}
      />,
    )
    const foldButtons = screen.getAllByRole('button', { name: /unchanged blocks/ })
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
      <MarkdownDiffView
        original={base.join('\n\n')}
        suggested={base.join('\n\n').replace('keep 4', 'changed 4')}
        contextBlocks={1}
      />,
    )
    for (const foldButton of screen.getAllByRole('button', { name: /unchanged blocks/ })) {
      fireEvent.click(foldButton)
    }
    expect(screen.getAllByRole('button', { name: 'Show less' })).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Show less' })[0]!)
    expect(screen.getAllByRole('button', { name: 'Show less' })).toHaveLength(1)
    fireEvent.click(screen.getAllByRole('button', { name: 'Show less' })[0]!)
    expect(screen.queryAllByRole('button', { name: 'Show less' })).toHaveLength(0)
    expect(container.textContent).toContain('3 unchanged blocks')
    expect(container.textContent).not.toContain('keep 0')
  })

  test('navigates between change groups with the header controls', () => {
    const blocks = ['a1', 'c1', 'c2', 'c3', 'c4', 'a2', 'c5', 'c6', 'c7', 'c8', 'a3']
    const suggested = blocks
      .map((block) => (block.startsWith('a') ? `${block}!` : block))
      .join('\n\n')
    render(
      <MarkdownDiffView original={blocks.join('\n\n')} suggested={suggested} contextBlocks={0} />,
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
      <MarkdownDiffView
        original={'a\n\nb'}
        suggested={'c\n\nb'}
        showHeader={false}
        labels={{ unchangedBlocks: (count) => `${count} hidden` }}
      />,
    )
    expect(screen.queryByText('Original')).toBeNull()
    expect(screen.queryByText('Suggested')).toBeNull()
    expect(container.textContent).not.toContain('hidden')
  })

  test('has no axe violations', async () => {
    const { container } = render(
      <MarkdownDiffView original={'Old\n\nkeep'} suggested={'New\n\nkeep'} />,
    )
    await waitFor(() =>
      expect(container.querySelector('[data-as="markdown-diff-view"]')).not.toBeNull(),
    )
    const results = await import('jest-axe').then(({ axe }) => axe(container))
    expect(results.violations).toEqual([])
  })
})
