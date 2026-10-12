import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  MarkdownCodeBlock,
  MarkdownSurface,
  MermaidDiagram,
} from '../src/components/chat-markdown'

const mermaidRender = vi.fn(async () => ({ svg: '<svg role="img" aria-label="diagram"></svg>' }))
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: (...args: unknown[]) => mermaidRender(...(args as [])),
  },
}))

describe('MarkdownSurface', () => {
  beforeEach(() => {
    mermaidRender.mockClear()
    mermaidRender.mockImplementation(async () => ({ svg: '<svg role="img" aria-label="diagram"></svg>' }))
  })

  it('renders headings, emphasis and lists with the surface scope', () => {
    render(<MarkdownSurface value={'# Title\n\n**bold** and *italic*\n\n- one\n- two'} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('keys the streaming caret off the streaming flag', () => {
    const { container, rerender } = render(<MarkdownSurface value="warming up" streaming />)
    const root = container.querySelector('[data-as="chat-markdown"]')
    expect(root).toHaveAttribute('data-streaming', 'true')
    rerender(<MarkdownSurface value="settled" />)
    expect(root).not.toHaveAttribute('data-streaming')
  })

  it('wraps case-insensitive search matches in marks', () => {
    const { container } = render(
      <MarkdownSurface value={'A **limit** is the value a function approaches. The LIMIT exists.'} query="limit" />,
    )
    const marks = container.querySelectorAll('mark[data-as="chat-search-match"]')
    expect(marks).toHaveLength(2)
    expect(marks[0]).toHaveTextContent('limit')
    expect(marks[1]).toHaveTextContent('LIMIT')
  })

  it('skips highlighting for blank queries', () => {
    const { container, rerender } = render(<MarkdownSurface value="limit text" query="  " />)
    expect(container.querySelectorAll('mark')).toHaveLength(0)
    rerender(<MarkdownSurface value="limit text" />)
    expect(container.querySelectorAll('mark')).toHaveLength(0)
  })

  it('zooms images in a modal when lightbox is on', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MarkdownSurface value={'![x-ray](https://example.com/x-ray.png)'} lightbox />,
    )
    const zoomButton = screen.getByRole('button', { name: 'Zoom image: x-ray' })
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/x-ray.png')
    await user.click(zoomButton)
    const dialog = await screen.findByRole('dialog')
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/x-ray.png')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps images inert without lightbox', () => {
    render(<MarkdownSurface value={'![x-ray](https://example.com/x-ray.png)'} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders code blocks with a language tag and a copy control', async () => {
    render(<MarkdownSurface value={'```python\nprint("hi")\n```'} />)
    expect(screen.getByText('python')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    expect(screen.getByText(/print/)).toBeInTheDocument()
  })

  it('renders untagged code blocks without a language label', () => {
    render(<MarkdownSurface value={'```\nplain fence\n```'} />)
    expect(screen.queryByText('mermaid')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('renders inline code as a chip, not a block', () => {
    render(<MarkdownSurface value={'use `npm run dev` here'} />)
    const code = screen.getByText('npm run dev')
    expect(code.tagName).toBe('CODE')
    expect(code.closest('[data-as="markdown-code-block"]')).toBeNull()
  })

  it('renders inline and display math through katex', () => {
    render(<MarkdownSurface value={'$E=mc^2$\n\n$$\n\\lim_{x \\to 0} x = 0\n$$'} />)
    expect(document.querySelector('.katex')).not.toBeNull()
    expect(document.querySelector('.katex-display')).not.toBeNull()
  })

  it('can disable math entirely', () => {
    render(<MarkdownSurface value={'$E=mc^2$'} math={false} />)
    expect(document.querySelector('.katex')).toBeNull()
    expect(screen.getByText(/E=mc/)).toBeInTheDocument()
  })

  it('renders gfm tables inside a scroll wrapper', () => {
    render(<MarkdownSurface value={'| a | b |\n| --- | --- |\n| 1 | 2 |'} />)
    const table = screen.getByRole('table')
    expect(table.closest('div')?.className).toContain('overflow-x-auto')
    expect(screen.getByRole('columnheader', { name: 'a' })).toBeInTheDocument()
  })

  it('opens external links in a new tab and keeps app-links inline', () => {
    render(
      <MarkdownSurface value={'[site](https://example.com) and [ref](citation://obs-1)'} />,
    )
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('ref').closest('a')).not.toHaveAttribute('target')
  })

  it('never renders raw html from the model', () => {
    render(<MarkdownSurface value={'hello <script>window.pwned=1</script> world'} />)
    expect(document.querySelector('script')).toBeNull()
    expect((window as unknown as Record<string, unknown>).pwned).toBeUndefined()
  })

  it('lets apps override renderers per key (mention chips)', () => {
    render(
      <MarkdownSurface
        value="[M12](mention:material-12)"
        components={{
          a: ({ children }) => <span data-mention>{children}</span>,
        }}
      />,
    )
    expect(screen.getByText('M12').closest('[data-mention]')).not.toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders mermaid fences as lazy diagrams once streaming is over', async () => {
    render(<MarkdownSurface value={'```mermaid\ngraph TD; A-->B;\n```'} />)
    await waitFor(() => {
      expect(screen.getByLabelText('diagram')).toBeInTheDocument()
    })
    expect(mermaidRender).toHaveBeenCalled()
  })

  it('defers mermaid while streaming (renders the code instead)', () => {
    render(<MarkdownSurface value={'```mermaid\ngraph TD; A-->B;\n```'} streaming />)
    expect(screen.getByText('mermaid')).toBeInTheDocument()
    expect(mermaidRender).not.toHaveBeenCalled()
  })
})

describe('MermaidDiagram fallback', () => {
  beforeEach(() => {
    mermaidRender.mockReset()
  })

  it('falls back to the code block when rendering fails', async () => {
    mermaidRender.mockImplementation(async () => {
      throw new Error('bad syntax')
    })
    render(<MermaidDiagram code="graph TD; A-->B" />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    })
  })
})

describe('MarkdownCodeBlock', () => {
  it('copies its code to the clipboard', async () => {
    const user = userEvent.setup()
    render(<MarkdownCodeBlock code="console.log(1)" language="ts" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    await waitFor(() => expect(navigator.clipboard.readText()).resolves.toBe('console.log(1)'))
  })

  it('can hide the language tag', () => {
    render(<MarkdownCodeBlock code="x" language="ts" showLanguage={false} />)
    expect(screen.queryByText('ts')).toBeNull()
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })
})
