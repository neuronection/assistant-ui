import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import type { Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'

import {
  RichTextEditor,
  type RichTextEditorProps,
} from '../src/components/rich-text-editor/RichTextEditor'

const clientRects = () => [new DOMRect(0, 0, 100, 20)] as unknown as DOMRectList
Element.prototype.getClientRects =
  Element.prototype.getClientRects ?? clientRects
Element.prototype.getBoundingClientRect =
  Element.prototype.getBoundingClientRect ?? (() => new DOMRect(0, 0, 100, 20))
;(Text.prototype as unknown as { getClientRects: () => DOMRectList }).getClientRects =
  clientRects
;(Range.prototype as unknown as { getClientRects: () => DOMRectList }).getClientRects =
  clientRects
;(Range.prototype as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect =
  () => new DOMRect(0, 0, 100, 20)
if (typeof document.elementFromPoint !== 'function') {
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => document.querySelector('.ProseMirror') ?? document.body,
  })
}

function Editor(props: Partial<RichTextEditorProps>) {
  return (
    <RichTextEditor
      value={props.value ?? ''}
      onValueChange={props.onValueChange ?? (() => {})}
      ariaLabel={props.ariaLabel ?? 'Note body'}
      {...props}
    />
  )
}

async function getEditable() {
  const editable = await screen.findByLabelText('Note body')
  expect(editable.tagName).toBe('DIV')
  return editable
}

function paste(element: HTMLElement, text: string): void {
  fireEvent.paste(element, {
    clipboardData: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    },
  })
}

function emittedMarkdown(onValueChange: { mock: { calls: unknown[][] } }): string[] {
  return onValueChange.mock.calls.map(([markdown]) => markdown as string)
}

describe('RichTextEditor', () => {
  it('renders markdown value as document content', async () => {
    render(<Editor value={'# Title\n\nHello **world**'} />)
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('Hello world'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title')
  })

  it('emits markdown when content is inserted', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Editor value="" onValueChange={onValueChange} />)
    const editable = await getEditable()
    await user.click(editable)
    paste(editable, 'Hello')
    await waitFor(() => {
      expect(emittedMarkdown(onValueChange).some((m) => m.includes('Hello'))).toBe(true)
    })
  })

  it('converts a paragraph via the toolbar (keyboard) and emits markdown', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Editor value="" onValueChange={onValueChange} />)
    const editable = await getEditable()
    await user.click(editable)
    paste(editable, 'emphasized')
    await waitFor(() => {
      expect(emittedMarkdown(onValueChange).some((m) => m.includes('emphasized'))).toBe(true)
    })
    const heading = screen.getByRole('button', { name: 'Heading 2' })
    heading.focus()
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(
        emittedMarkdown(onValueChange).some((m) => m.includes('## emphasized')),
      ).toBe(true)
    })
  })

  it('reflects the active mark in toolbar aria-pressed', async () => {
    const user = userEvent.setup()
    render(<Editor value="text" />)
    const bold = await screen.findByRole('button', { name: 'Bold' })
    expect(bold).toHaveAttribute('aria-pressed', 'false')
    const editable = await getEditable()
    await user.click(editable)
    await user.keyboard('{Control>}b')
    await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'))
  })

  it('applies external value changes while preserving focus (controlled)', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Editor value="first draft" />)
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('first draft'))
    await user.click(editable)
    rerender(<Editor value="second draft" />)
    await waitFor(() => expect(editable.textContent).toContain('second draft'))
    expect(editable).toHaveFocus()
  })

  it('does not loop when the parent echoes the emitted value back', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<Editor value="same" onValueChange={onValueChange} />)
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('same'))
    rerender(<Editor value="same" onValueChange={onValueChange} />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(editable.textContent).toContain('same')
  })

  it('never emits on mount or when only the editable state changes', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<Editor value="quiet" onValueChange={onValueChange} />)
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('quiet'))
    rerender(<Editor value="quiet" onValueChange={onValueChange} disabled />)
    await new Promise((resolve) => setTimeout(resolve, 30))
    rerender(<Editor value="quiet" onValueChange={onValueChange} />)
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('toolbar={false} renders no toolbar', async () => {
    render(<Editor value="plain" toolbar={false} />)
    await getEditable()
    expect(screen.queryByRole('toolbar')).toBeNull()
  })

  it('toolbarExtra renders inside the toolbar', async () => {
    render(<Editor value="" toolbarExtra={<button type="button">Extra</button>} />)
    expect(await screen.findByRole('button', { name: 'Extra' })).toBeInTheDocument()
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeInTheDocument()
  })

  it('disabled disables the editor and the toolbar buttons', async () => {
    render(<Editor value="text" disabled />)
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('text'))
    expect(editable.getAttribute('contenteditable')).toBe('false')
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Editor
        value={'# Title\n\nHello **world**'}
        toolbarExtra={<button type="button">Extra</button>}
      />,
    )
    await screen.findByLabelText('Note body')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('RichTextEditor app extensions', () => {
  it('accepts extra extensions and survives rerenders with fresh arrays', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <Editor value="stable" extensions={[StarterKit, Link]} />,
    )
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('stable'))
    await user.click(editable)
    rerender(<Editor value="stable" extensions={[StarterKit, Link]} />)
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(editable.textContent).toContain('stable')
    expect(editable).toHaveFocus()
  })
})

describe('RichTextEditor extensions full override', () => {
  it('replaces the built-in extension set entirely when provided', async () => {
    render(
      <Editor
        value={'# Title\n\nBody'}
        extensions={[StarterKit.configure({ heading: false }), Markdown]}
      />,
    )
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('Body'))
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('keeps the starter defaults when extensions is omitted', async () => {
    render(<Editor value={'# Title\n\nBody'} />)
    await getEditable()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title')
  })
})

describe('RichTextEditor heading levels', () => {
  it('renders one toggle per headingLevels entry with per-level active state', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Editor
        value={'## Titled'}
        onValueChange={onValueChange}
        headingLevels={[2, 3]}
      />,
    )
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('Titled'))
    const h2 = screen.getByRole('button', { name: 'Heading 2' })
    const h3 = screen.getByRole('button', { name: 'Heading 3' })
    expect(h2).toHaveAttribute('aria-pressed', 'true')
    expect(h3).toHaveAttribute('aria-pressed', 'false')
    h3.focus()
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(
        emittedMarkdown(onValueChange).some((m) => m.includes('### Titled')),
      ).toBe(true),
    )
    await waitFor(() => expect(h3).toHaveAttribute('aria-pressed', 'true'))
    expect(h2).toHaveAttribute('aria-pressed', 'false')
  })

  it('names heading buttons via the heading label function', async () => {
    render(
      <Editor
        value="text"
        headingLevels={[1, 2]}
        labels={{ heading: (level) => `H${level}` }}
      />,
    )
    await getEditable()
    expect(screen.getByRole('button', { name: 'H1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'H2' })).toBeInTheDocument()
  })

  it('defaults to a single level-2 toggle named Heading 2', async () => {
    render(<Editor value="text" />)
    await getEditable()
    expect(screen.getByRole('button', { name: 'Heading 2' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Heading 3' })).toBeNull()
  })
})

describe('RichTextEditor onReady', () => {
  it('fires once with the editor instance and again with null on unmount', async () => {
    const onReady = vi.fn()
    const { unmount } = render(<Editor value="ready" onReady={onReady} />)
    await getEditable()
    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1))
    const instance = onReady.mock.calls[0]?.[0] as unknown
    expect(instance).not.toBeNull()
    expect((instance as { isDestroyed?: boolean }).isDestroyed).toBe(false)
    unmount()
    expect(onReady).toHaveBeenLastCalledWith(null)
    expect(onReady).toHaveBeenCalledTimes(2)
  })

  it('keeps a stable identity across rerenders (never called per render)', async () => {
    const onReady = vi.fn()
    const { rerender, unmount } = render(
      <Editor value="stable" onReady={onReady} />,
    )
    await getEditable()
    rerender(<Editor value="stable" onReady={onReady} labels={{ bold: 'B' }} />)
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(onReady).toHaveBeenCalledTimes(1)
    unmount()
    expect(onReady).toHaveBeenCalledTimes(2)
  })

  it('lets the consumer run a command on the ready editor from outside', async () => {
    const onValueChange = vi.fn()
    const captured: { current: TiptapEditor | null } = { current: null }
    render(
      <Editor value="hello" onValueChange={onValueChange} onReady={(e) => { captured.current = e }} />,
    )
    await waitFor(() => expect(captured.current).not.toBeNull())
    const instance = captured.current as TiptapEditor
    instance.chain().focus().insertContent('!').run()
    await waitFor(() =>
      expect(
        emittedMarkdown(onValueChange).some((m) => m.includes('!') && m.includes('hello')),
      ).toBe(true),
    )
  })
})

describe('RichTextEditor contentClassName', () => {
  it('appends the classes to the editable region', async () => {
    render(<Editor value="styled" contentClassName="prose-notes trailing-class" />)
    const editable = await getEditable()
    expect(editable.className).toContain('prose-notes')
    expect(editable.className).toContain('trailing-class')
  })

  it('keeps the built-in content classes alongside the app classes', async () => {
    render(<Editor value="styled" contentClassName="min-h-56" />)
    const editable = await getEditable()
    expect(editable.className).toContain('min-h-56')
    expect(editable.className).toContain('as-rich-text-editor__content')
  })
})

describe('RichTextEditor history buttons', () => {
  it('disables undo/redo until history exists and re-enables after an edit', async () => {
    const user = userEvent.setup()
    render(<Editor value="start" />)
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('start'))
    const undo = screen.getByRole('button', { name: 'Undo' })
    const redo = screen.getByRole('button', { name: 'Redo' })
    expect(undo).toBeDisabled()
    expect(redo).toBeDisabled()
    await user.click(editable)
    paste(editable, ' more')
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(editable.textContent).not.toContain('more'))
    await waitFor(() => expect(redo).not.toBeDisabled())
  })
})
