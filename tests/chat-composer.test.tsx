import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { ChatComposer } from '../src/components/chat-composer'

function setup(overrides: Partial<React.ComponentProps<typeof ChatComposer>> = {}) {
  const onValueChange = vi.fn()
  const onSubmit = vi.fn()
  const utils = render(
    <ChatComposer value="hello" onValueChange={onValueChange} onSubmit={onSubmit} {...overrides} />,
  )
  return { onValueChange, onSubmit, ...utils }
}

describe('ChatComposer', () => {
  it('submits on Enter and inserts a newline on Shift+Enter', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    await user.type(textarea, '{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await user.type(textarea, '{Shift>}{Enter}{/Shift}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument()
  })

  it('ignores Enter during IME composition', () => {
    const { onSubmit } = setup()
    const textarea = screen.getByRole('textbox')
    fireEvent.keyDown(textarea, { key: 'Enter', keyCode: 229 })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('sends via the submit button and form submit', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('swaps send for stop while a turn is in flight', async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    const { onSubmit } = setup({ sending: true, onStop })
    const stop = screen.getByRole('button', { name: 'Stop generating' })
    await user.click(stop)
    expect(onStop).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('disables send for blank values and when disabled', () => {
    const { rerender } = setup({ value: '   ' })
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    rerender(
      <ChatComposer value="hello" onValueChange={() => {}} onSubmit={() => {}} disabled />,
    )
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('routes dropped files to onAttachFiles', () => {
    const onAttachFiles = vi.fn()
    const file = new File(['x'], 'shot.png', { type: 'image/png' })
    setup({ onAttachFiles })
    const form = screen.getByRole('textbox').closest('form')!
    fireEvent.dragEnter(form, { dataTransfer: { types: ['Files'] } })
    fireEvent.drop(form, { dataTransfer: { files: [file] } })
    expect(onAttachFiles).toHaveBeenCalledWith([file])
  })

  it('routes pasted files to onAttachFiles', () => {
    const onAttachFiles = vi.fn()
    const file = new File(['y'], 'paste.jpg', { type: 'image/jpeg' })
    setup({ onAttachFiles })
    fireEvent.paste(screen.getByRole('textbox'), { clipboardData: { files: [file] } })
    expect(onAttachFiles).toHaveBeenCalledWith([file])
  })

  it('renders toolbar, attachment and suggestion slots', () => {
    setup({
      toolbarStart: <button type="button">plus</button>,
      toolbarEnd: <button type="button">mic</button>,
      attachments: <div>file chips</div>,
      suggestions: <div>suggestion chips</div>,
    })
    expect(screen.getByText('plus')).toBeInTheDocument()
    expect(screen.getByText('mic')).toBeInTheDocument()
    expect(screen.getByText('file chips')).toBeInTheDocument()
    expect(screen.getByText('suggestion chips')).toBeInTheDocument()
  })

  it('exposes the data-multiline row hook once content exceeds one row', () => {
    const scrollHeight = vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(60)
    try {
      const { container, rerender } = render(
        <ChatComposer value={'one\ntwo'} onValueChange={() => {}} onSubmit={() => {}} />,
      )
      const row = container.querySelector('[data-as="chat-composer-row"]')
      expect(row).toHaveAttribute('data-multiline')
      scrollHeight.mockReturnValue(10)
      rerender(<ChatComposer value="" onValueChange={() => {}} onSubmit={() => {}} />)
      expect(row).not.toHaveAttribute('data-multiline')
    } finally {
      scrollHeight.mockRestore()
    }
  })

  it('keeps a fitting draft fully visible despite fractional line-height rounding', () => {
    const scrollHeight = vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(54)
    const clientHeight = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(60)
    try {
      const { rerender } = render(
        <ChatComposer value={'one\ntwo'} onValueChange={() => {}} onSubmit={() => {}} />,
      )
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      // +1 slack over the rounded-down scrollHeight: fractional
      // line-heights (text-sm/leading-relaxed = 22.75px) otherwise leave
      // the box short and the caret scrolls the first line out.
      expect(textarea).toHaveStyle({ height: '55px' })
      expect(textarea).toHaveStyle({ overflowY: 'hidden' })
      ;(textarea as unknown as { scrollTop: number }).scrollTop = 12
      rerender(<ChatComposer value={'one\ntwo '} onValueChange={() => {}} onSubmit={() => {}} />)
      expect(textarea.scrollTop).toBe(0)
    } finally {
      scrollHeight.mockRestore()
      clientHeight.mockRestore()
    }
  })

  it('makes a draft past the cap scrollable and stops pinning the top', () => {
    const scrollHeight = vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(200)
    const clientHeight = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(60)
    try {
      render(<ChatComposer value={'line\n'.repeat(20)} onValueChange={() => {}} onSubmit={() => {}} />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea).toHaveStyle({ height: '176px' }) // maxRows * 22 fallback cap
      expect(textarea).toHaveStyle({ overflowY: 'auto' })
      ;(textarea as unknown as { scrollTop: number }).scrollTop = 7
      expect(textarea.scrollTop).toBe(7)
    } finally {
      scrollHeight.mockRestore()
      clientHeight.mockRestore()
    }
  })

  it('passes axe idle and sending', async () => {
    const { container, rerender } = render(
      <ChatComposer value="hi" onValueChange={() => {}} onSubmit={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
    rerender(
      <ChatComposer value="hi" onValueChange={() => {}} onSubmit={() => {}} sending onStop={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
