import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Link from '@tiptap/extension-link'

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
    const heading = screen.getByRole('button', { name: 'Heading' })
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
    const extension = Link
    const { rerender } = render(
      <Editor value="stable" extensions={[extension]} />,
    )
    const editable = await getEditable()
    await waitFor(() => expect(editable.textContent).toContain('stable'))
    await user.click(editable)
    rerender(<Editor value="stable" extensions={[Link]} />)
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(editable.textContent).toContain('stable')
    expect(editable).toHaveFocus()
  })
})
