import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { ChatComposer, type ChatComposerProps } from '../src/components/chat-composer'

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

  it('enables send for blank values when canSubmit allows attachment-only turns', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup({ value: '', canSubmit: true })
    const send = screen.getByRole('button', { name: 'Send message' })
    expect(send).toBeEnabled()
    await user.click(send)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('force-disables send when canSubmit is false, even with text', () => {
    setup({ value: 'hello', canSubmit: false })
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
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

  it('slides in the attachment and suggestion rails on mount', () => {
    const { container } = render(
      <ChatComposer
        value=""
        onValueChange={() => {}}
        onSubmit={() => {}}
        attachments={<div>file chips</div>}
        suggestions={<div>suggestion chips</div>}
      />,
    )
    const wrappers = container.querySelectorAll('.as-anim-slide-up')
    expect(wrappers).toHaveLength(2)
  })

  it('morphs the send/stop swap only on state change, never on mount', () => {
    const { rerender } = render(
      <ChatComposer value="hi" onValueChange={() => {}} onSubmit={() => {}} sending={false} onStop={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Send message' }).className).not.toContain('as-anim-morph-in')
    rerender(<ChatComposer value="hi" onValueChange={() => {}} onSubmit={() => {}} sending onStop={() => {}} />)
    expect(screen.getByRole('button', { name: 'Stop generating' })).toHaveClass('as-anim-morph-in')
    rerender(<ChatComposer value="hi" onValueChange={() => {}} onSubmit={() => {}} sending={false} onStop={() => {}} />)
    expect(screen.getByRole('button', { name: 'Send message' })).toHaveClass('as-anim-morph-in')
  })

  const commands = {
    items: [
      { id: 'plan', label: 'Plan my revision' },
      { id: 'quiz', label: 'Quiz me' },
      { id: 'summarize', label: 'Summarize notes' },
    ],
  }

  function Harness(props: Partial<ChatComposerProps>) {
    const [value, setValue] = React.useState('')
    return (
      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSubmit={() => {}}
        {...props}
      />
    )
  }

  it('opens the command palette on the trigger and fuzzy-filters by query', async () => {
    const user = userEvent.setup()
    render(<Harness commands={{ ...commands, trigger: '/', onSelect: () => {} }} />)
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await user.type(textarea, '/')
    const listbox = screen.getByRole('listbox', { name: 'Commands' })
    expect(listbox).toBeInTheDocument()
    expect(within(listbox).getAllByRole('option')).toHaveLength(3)
    expect(textarea).toHaveAttribute('aria-controls', listbox.id)
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list')
    await user.type(textarea, 'qz')
    expect(within(listbox).getAllByRole('option')).toHaveLength(1)
    expect(within(listbox).getByRole('option', { name: /Quiz me/ })).toBeInTheDocument()
  })

  it('keeps the palette shut mid-sentence and reopens on a fresh trigger word', async () => {
    const user = userEvent.setup()
    render(<Harness commands={{ ...commands, onSelect: () => {} }} />)
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    await user.type(textarea, 'hello /')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.type(textarea, ' ')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects with Enter or Tab without submitting, reporting the token', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onSubmit = vi.fn()
    function CommandHarness() {
      const [value, setValue] = React.useState('')
      return (
        <ChatComposer
          value={value}
          onValueChange={setValue}
          onSubmit={onSubmit}
          commands={{
            ...commands,
            onSelect: (id, token) => {
              onSelect(id, token)
              setValue((draft) => `${draft.slice(0, token.start)}/${id} `)
            },
          }}
        />
      )
    }
    render(<CommandHarness />)
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    await user.type(textarea, '/pl')
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('plan', { start: 0, end: 3, query: 'pl' })
    expect(onSubmit).not.toHaveBeenCalled()
    await user.type(textarea, '/')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Tab}')
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('dismisses the palette on Escape and stops the turn on the next Escape', async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    render(
      <Harness commands={{ ...commands, onSelect: () => {} }} sending onStop={onStop} />,
    )
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    await user.type(textarea, '/')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onStop).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('recalls sent prompts with ArrowUp and walks back with ArrowDown', async () => {
    const user = userEvent.setup()
    render(<Harness history={['first prompt', 'second prompt']} />)
    const textarea = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement
    await user.click(textarea)
    await user.keyboard('{ArrowUp}')
    expect(textarea.value).toBe('second prompt')
    await user.keyboard('{ArrowUp}')
    expect(textarea.value).toBe('first prompt')
    await user.keyboard('{ArrowDown}')
    expect(textarea.value).toBe('second prompt')
    await user.keyboard('{ArrowDown}')
    expect(textarea.value).toBe('')
  })

  it('never recalls history over a non-empty draft', async () => {
    const user = userEvent.setup()
    function DraftHarness() {
      const [value, setValue] = React.useState('draft')
      return <ChatComposer value={value} onValueChange={setValue} onSubmit={() => {}} history={['sent']} />
    }
    render(<DraftHarness />)
    const textarea = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement
    await user.click(textarea)
    await user.keyboard('{ArrowUp}')
    expect(textarea.value).toBe('draft')
  })

  it('passes axe with the palette open (combobox pattern)', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness commands={{ ...commands, onSelect: () => {} }} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), '/')
    expect(await axe(container)).toHaveNoViolations()
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

  it('stays multiline until the draft clears even when the widened row fits one line', () => {
    let scrollHeightValue = 60
    const scrollHeight = vi
      .spyOn(Element.prototype, 'scrollHeight', 'get')
      .mockImplementation(() => scrollHeightValue)
    try {
      const { container, rerender } = render(
        <ChatComposer value={'squeezed pill wraps this'} onValueChange={() => {}} onSubmit={() => {}} />,
      )
      const row = container.querySelector('[data-as="chat-composer-row"]')
      expect(row).toHaveAttribute('data-multiline')
      scrollHeightValue = 10
      rerender(
        <ChatComposer value={'squeezed pill wraps this!'} onValueChange={() => {}} onSubmit={() => {}} />,
      )
      expect(row).toHaveAttribute('data-multiline')
      rerender(
        <ChatComposer value={'squeezed pill wraps this?'} onValueChange={() => {}} onSubmit={() => {}} />,
      )
      expect(row).toHaveAttribute('data-multiline')
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
