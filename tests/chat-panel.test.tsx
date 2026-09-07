import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { ChatPanel } from '../src/components/chat-panel'
import { ChatDrawer } from '../src/components/chat-drawer'
import { ChatLauncher } from '../src/components/chat-launcher'
import { ChatTranscript } from '../src/components/chat-transcript'
import { ChatComposer } from '../src/components/chat-composer'

const transcript = <ChatTranscript items={[{ id: 'u1', role: 'user', content: 'hi', status: 'done' }]} />

describe('ChatPanel', () => {
  it('composes header, transcript, composer and footer slots', () => {
    render(
      <ChatPanel
        variant="page"
        title="Tutor"
        actions={<button type="button">expand</button>}
        banner="Course: Calculus"
        transcript={transcript}
        composer={<ChatComposer value="" onValueChange={() => {}} onSubmit={() => {}} />}
        footer="AI can make mistakes"
      />,
    )
    expect(screen.getByText('Tutor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'expand' })).toBeInTheDocument()
    expect(screen.getByText('Course: Calculus')).toBeInTheDocument()
    expect(screen.getByRole('log')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument()
    expect(screen.getByText('AI can make mistakes')).toBeInTheDocument()
  })

  it('marks the variant for surface styling', () => {
    const { container, rerender } = render(<ChatPanel variant="bubble" transcript={transcript} />)
    expect(container.querySelector('[data-as="chat-panel"]')?.getAttribute('data-variant')).toBe('bubble')
    rerender(<ChatPanel variant="sidebar" transcript={transcript} />)
    expect(container.querySelector('[data-as="chat-panel"]')?.getAttribute('data-variant')).toBe('sidebar')
  })
})

describe('ChatDrawer', () => {
  it('renders the panel content through a portal when open', () => {
    render(
      <ChatDrawer open onOpenChange={() => {}} panel={<div>drawer body</div>} title="Study chat" />,
    )
    expect(screen.getByText('drawer body')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Study chat' })).toBeInTheDocument()
  })

  it('closes via Escape and the close button', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ChatDrawer open onOpenChange={onOpenChange} panel={<div>body</div>} />,
    )
    await user.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    render(
      <ChatDrawer open onOpenChange={onOpenChange} panel={<div>body2</div>} />,
    )
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('resizes with the keyboard handle and clamps to bounds', async () => {
    const user = userEvent.setup()
    const onWidthChange = vi.fn()
    render(
      <ChatDrawer
        open
        onOpenChange={() => {}}
        panel={<div>body</div>}
        width={480}
        onWidthChange={onWidthChange}
      />,
    )
    const handle = screen.getByRole('separator', { name: 'Resize chat panel' })
    handle.focus()
    await user.keyboard('{ArrowLeft}')
    expect(onWidthChange).toHaveBeenLastCalledWith(496)
    await user.keyboard('{ArrowRight}')
    expect(onWidthChange).toHaveBeenLastCalledWith(464)
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(onWidthChange).toHaveBeenLastCalledWith(528)
  })

  it('clamps resize requests to the min and max bounds', async () => {
    const user = userEvent.setup()
    const onWidthChange = vi.fn()
    render(
      <ChatDrawer open onOpenChange={() => {}} panel={<div>body</div>} width={850} onWidthChange={onWidthChange} />,
    )
    const handle = screen.getByRole('separator')
    handle.focus()
    await user.keyboard('{ArrowLeft}')
    expect(onWidthChange).toHaveBeenLastCalledWith(860)
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(onWidthChange).toHaveBeenLastCalledWith(834)
  })

  it('drags the resize handle with pointer capture', () => {
    const onWidthChange = vi.fn()
    render(
      <ChatDrawer
        open
        onOpenChange={() => {}}
        panel={<div>body</div>}
        width={480}
        onWidthChange={onWidthChange}
      />,
    )
    const handle = screen.getByRole('separator')
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 800 })
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 600 })
    fireEvent.pointerUp(handle, { pointerId: 1 })
    expect(onWidthChange).toHaveBeenCalled()
  })

  it('forwards the ref to the drawer content element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<ChatDrawer ref={ref} open onOpenChange={() => {}} panel={<div>body</div>} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.getAttribute('data-as')).toBe('chat-drawer')
  })

  it('passes axe while open', async () => {
    const { container } = render(
      <ChatDrawer open onOpenChange={() => {}} panel={<div>content</div>} title="Chat" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ChatLauncher', () => {
  it('toggles the anchored panel with aria-expanded', async () => {
    const user = userEvent.setup()
    render(<ChatLauncher panel={<div>bubble body</div>} />)
    const trigger = screen.getByRole('button', { name: 'Chat' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(screen.getByRole('complementary', { name: 'Chat' })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes from the panel close button and calls onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ChatLauncher panel={<div>body</div>} onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Chat' }))
    const panel = screen.getByRole('complementary', { name: 'Chat' })
    await user.click(within(panel).getByRole('button', { name: 'Close chat' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows a badge when provided', () => {
    render(<ChatLauncher panel={<div>body</div>} badge={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('passes axe open and closed', async () => {
    const { container, rerender } = render(<ChatLauncher panel={<div>body</div>} />)
    expect(await axe(container)).toHaveNoViolations()
    rerender(<ChatLauncher panel={<div>body</div>} defaultOpen />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
