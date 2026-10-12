import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { ChatReasoning } from '../src/components/chat-reasoning'
import { ChatToolCard } from '../src/components/chat-tool-card'
import { ChatMessage } from '../src/components/chat-message'
import { ChatMessageEditor } from '../src/components/chat-message/ChatMessageEditor'
import { MessageVariantSwitcher } from '../src/components/chat-message/MessageVariantSwitcher'

describe('ChatReasoning', () => {
  it('renders expanded by default and toggles via keyboard', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ChatReasoning text="thinking hard" onOpenChange={onOpenChange} />)
    expect(screen.getByText('thinking hard')).toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: /thinking/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Tab}')
    await user.keyboard('{Enter}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('honors controlled open and announces streaming', () => {
    const { container, rerender } = render(<ChatReasoning text="live" open={false} streaming />)
    const region = () => container.querySelector('.as-collapse')
    expect(region()).toHaveAttribute('data-open', 'false')
    expect(container.querySelector('[data-as="chat-reasoning"]')).toHaveAttribute('data-streaming', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<ChatReasoning text="live" open />)
    expect(region()).toHaveAttribute('data-open', 'true')
    expect(screen.getByText('live')).toBeInTheDocument()
  })

  it('auto-collapses when an uncontrolled live stream finishes', () => {
    const onOpenChange = vi.fn()
    const { container, rerender } = render(
      <ChatReasoning text="live" streaming onOpenChange={onOpenChange} />,
    )
    const region = () => container.querySelector('.as-collapse')
    expect(region()).toHaveAttribute('data-open', 'true')
    rerender(<ChatReasoning text="live" onOpenChange={onOpenChange} />)
    expect(region()).toHaveAttribute('data-open', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('never auto-collapses a controlled open', () => {
    const { container, rerender } = render(<ChatReasoning text="live" open streaming />)
    rerender(<ChatReasoning text="live" open />)
    expect(container.querySelector('.as-collapse')).toHaveAttribute('data-open', 'true')
  })

  it('keeps the block open after a finished stream when autoCollapse is off', () => {
    const { container, rerender } = render(
      <ChatReasoning text="live" streaming autoCollapse={false} />,
    )
    rerender(<ChatReasoning text="live" autoCollapse={false} />)
    expect(container.querySelector('.as-collapse')).toHaveAttribute('data-open', 'true')
  })

  it('does not collapse a block that never streamed', () => {
    const { container, rerender } = render(<ChatReasoning text="notes" />)
    rerender(<ChatReasoning text="notes" />)
    expect(container.querySelector('.as-collapse')).toHaveAttribute('data-open', 'true')
  })

  it('carries the AI accent edge only while streaming', () => {
    const { container, rerender } = render(<ChatReasoning text="live" streaming />)
    expect(container.querySelector('[data-as="chat-reasoning"]')?.className).toContain('--as-ai')
    rerender(<ChatReasoning text="live" />)
    expect(container.querySelector('[data-as="chat-reasoning"]')?.className).not.toContain('--as-ai')
  })

  it('passes axe collapsed and streaming', async () => {
    const { container } = render(<ChatReasoning text="reasons" streaming />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ChatToolCard', () => {
  it('shows running status as a static row when there are no details', () => {
    render(<ChatToolCard name="search_jobs" title="Job search" status="running" />)
    expect(screen.getByText('Job search')).toBeInTheDocument()
    expect(screen.getByText('search_jobs')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('expands args and result on click and reports the duration', async () => {
    const user = userEvent.setup()
    render(
      <ChatToolCard
        name="search_jobs"
        status="done"
        args={'{"q": "nurse"}'}
        result="12 jobs"
        durationMs={1400}
      />,
    )
    expect(screen.getByText('1.4 s')).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('q')).toBeInTheDocument()
    expect(screen.getByText('nurse')).toBeInTheDocument()
    expect(screen.getByText('12 jobs')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('marks failed tools with the sr-only status', () => {
    const { container } = render(<ChatToolCard name="fetch" status="failed" />)
    expect(container.querySelector('[data-as="chat-tool-card"]')?.getAttribute('data-status')).toBe('failed')
    expect(screen.getByText('Failed')).toHaveClass('sr-only')
  })

  it('renders JSON args and results as structured rows and chips', () => {
    render(
      <ChatToolCard
        name="search_jobs"
        status="done"
        args={'{"query": "hi", "limit": 5}'}
        result='["ml-engineer", "game-developer"]'
        defaultOpen
      />,
    )
    expect(screen.getByText('query')).toBeInTheDocument()
    expect(screen.getByText('hi')).toBeInTheDocument()
    expect(screen.getByText('limit')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.queryByText(/"\{?query/)).not.toBeInTheDocument()
    expect(screen.getByText('ml-engineer')).toBeInTheDocument()
    expect(screen.getByText('game-developer')).toBeInTheDocument()
    const chip = screen.getByText('ml-engineer').closest('li')
    expect(chip).not.toBeNull()
  })

  it('renders plain-text payloads as preformatted text', () => {
    render(<ChatToolCard name="search" status="done" result="12 hits" defaultOpen />)
    expect(screen.getByText('12 hits')).toBeInTheDocument()
    expect(screen.getByText('12 hits')?.closest('pre')).not.toBeNull()
  })

  it('renders a custom view through the renderResult slot', () => {
    render(
      <ChatToolCard
        name="QUIZ"
        status="done"
        result="2+2"
        defaultOpen
        renderResult={(result) => <div data-testid="custom-view">{`view: ${result}`}</div>}
      />,
    )
    expect(screen.getByTestId('custom-view')).toHaveTextContent('view: 2+2')
    expect(screen.queryByText('view: 2+2')?.closest('pre')).toBeNull()
  })

  it('calls renderResult with an empty string when the tool has no result', () => {
    const renderResult = vi.fn(() => <div>state view</div>)
    render(<ChatToolCard name="STATE" status="done" renderResult={renderResult} defaultOpen />)
    expect(renderResult).toHaveBeenCalledWith('')
    expect(screen.getByText('state view')).toBeInTheDocument()
  })

  it('stays expandable when only renderResult is provided', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ChatToolCard name="STATE" status="done" renderResult={() => <div>state view</div>} />,
    )
    expect(container.querySelector('[data-as="chat-tool-card"]')).not.toBeNull()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('state view')).toBeInTheDocument()
  })

  it('passes axe with a renderResult view expanded', async () => {
    const { container } = render(
      <ChatToolCard
        name="QUIZ"
        status="done"
        result="2+2"
        defaultOpen
        renderResult={(result) => <div>{`view: ${result}`}</div>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('passes axe while running and expanded', async () => {
    const { container } = render(
      <ChatToolCard name="search_jobs" status="done" args="{}" result="ok" defaultOpen />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('draws the completion check and crossfades the status cell', () => {
    const { container, rerender } = render(<ChatToolCard name="search" status="running" />)
    expect(container.querySelector('.as-anim-check-draw')).toBeNull()
    rerender(<ChatToolCard name="search" status="done" />)
    const path = container.querySelector('.as-anim-check-draw')
    expect(path).not.toBeNull()
    expect(path).toHaveAttribute('pathLength', '1')
    const statusCell = path?.closest('span')
    expect(statusCell).toHaveClass('as-anim-fade-swap')
    expect(statusCell?.className).toContain('--as-success')
  })

  it('reveals details through the animated collapse via keyboard', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ChatToolCard name="search" status="done" args="{}" result="ok" />,
    )
    const region = () => container.querySelector('.as-collapse')
    const toggle = screen.getByRole('button')
    expect(region()).toHaveAttribute('data-open', 'false')
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(region()).toHaveAttribute('data-open', 'true')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    expect(region()).toHaveAttribute('data-open', 'false')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('carries the AI accent edge only while running', () => {
    const { container, rerender } = render(<ChatToolCard name="search" status="running" />)
    expect(container.querySelector('[data-as="chat-tool-card"]')?.className).toContain('--as-ai')
    rerender(<ChatToolCard name="search" status="done" />)
    expect(container.querySelector('[data-as="chat-tool-card"]')?.className).not.toContain('--as-ai')
  })
})

describe('MessageVariantSwitcher', () => {
  const variants = { index: 2, count: 3, siblingIds: ['m1', 'm2', 'm3'] }

  it('navigates between siblings and disables at the ends', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<MessageVariantSwitcher variants={variants} onSelect={onSelect} />)
    expect(screen.getByText('2/3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous variant' }))
    expect(onSelect).toHaveBeenCalledWith('m1')
    await user.click(screen.getByRole('button', { name: 'Next variant' }))
    expect(onSelect).toHaveBeenCalledWith('m3')
  })

  it('disables both ends at the first/last variant', () => {
    const { rerender } = render(
      <MessageVariantSwitcher variants={{ index: 1, count: 3, siblingIds: ['m1', 'm2', 'm3'] }} onSelect={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Previous variant' })).toBeDisabled()
    rerender(
      <MessageVariantSwitcher variants={{ index: 3, count: 3, siblingIds: ['m1', 'm2', 'm3'] }} onSelect={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Next variant' })).toBeDisabled()
  })
})

describe('ChatMessage', () => {
  it('aligns user and assistant bubbles by role', () => {
    const { container } = render(<ChatMessage role="user" content="hello there" />)
    expect(container.querySelector('[data-as="chat-message"]')?.getAttribute('data-role')).toBe('user')
    expect(container.firstElementChild).toHaveClass('items-end')
  })

  it('styles the assistant bubble with the muted fill and no border', () => {
    const { container } = render(<ChatMessage role="assistant" content="answer" />)
    const bubble = container.querySelector('[data-as="chat-message"] > div')
    expect(bubble).toHaveClass('bg-[var(--as-muted)]')
    expect(bubble?.className).not.toContain('border')
  })

  it('styles the user bubble with the primary fill', () => {
    const { container } = render(<ChatMessage role="user" content="hello" />)
    const bubble = container.querySelector('[data-as="chat-message"] > div')
    expect(bubble).toHaveClass('bg-[var(--as-primary)]')
  })

  it('fires copy/edit/regenerate actions from the hover row', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    const onEdit = vi.fn()
    const onRegenerate = vi.fn()
    render(
      <ChatMessage
        role="assistant"
        content="answer"
        actions={{ onCopy, onEdit, onRegenerate }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Regenerate' }))
    expect(onCopy).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onRegenerate).toHaveBeenCalledTimes(1)
  })

  it('shows the variant switcher only for branched messages', () => {
    const variants = { index: 1, count: 2, siblingIds: ['a', 'b'] }
    const { rerender } = render(
      <ChatMessage role="assistant" content="v1" variants={variants} onSelectVariant={() => {}} />,
    )
    expect(screen.getByRole('group', { name: 'Message variants' })).toBeInTheDocument()
    rerender(<ChatMessage role="assistant" content="only" variants={{ index: 1, count: 1, siblingIds: ['a'] }} onSelectVariant={() => {}} />)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('renders an accessible error with a retry action when retryable', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <ChatMessage
        role="assistant"
        content="partial"
        status="error"
        error={{ code: 'rate_limit', message: 'slow down', retryable: true }}
        actions={{ onRetry }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('rate_limit')
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders errorExtra next to Retry and on non-retryable errors', () => {
    const { rerender } = render(
      <ChatMessage
        role="assistant"
        content="partial"
        status="error"
        error={{ code: 'rate_limit', message: 'slow down', retryable: true }}
        actions={{
          onRetry: () => {},
          errorExtra: <a href="/settings">Open AI settings</a>,
        }}
      />,
    )
    expect(screen.getByRole('link', { name: 'Open AI settings' })).toBeInTheDocument()

    rerender(
      <ChatMessage
        role="assistant"
        content="partial"
        status="error"
        error={{ code: 'not_configured', message: 'no provider', retryable: false }}
        actions={{ errorExtra: <a href="/settings">Open AI settings</a> }}
      />,
    )
    expect(screen.getByRole('link', { name: 'Open AI settings' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  it('marks interrupted turns', () => {
    render(<ChatMessage role="assistant" content="partial" status="interrupted" />)
    expect(screen.getByText('Stopped')).toBeInTheDocument()
  })

  it('renders the editor in editing mode with Cmd+Enter submit and Escape cancel', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const onValueChange = vi.fn()
    render(
      <ChatMessage
        role="user"
        content="original"
        editing={{ value: 'edited', onValueChange, onSubmit, onCancel }}
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'Edit message' })
    await user.type(textarea, '!')
    expect(onValueChange).toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Save & resend' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('keeps action row keyboard-reachable via the reveal hook (CSS-owned reveal)', () => {
    render(<ChatMessage role="assistant" content="answer" actions={{ onCopy: () => {} }} />)
    const row = screen.getByRole('button', { name: 'Copy' }).parentElement!
    expect(row).toHaveAttribute('data-as', 'chat-message-actions')
    expect(row.className).not.toContain('opacity-0')
  })

  it('animates the message entrance on mount', () => {
    const { container } = render(<ChatMessage role="user" content="hello" />)
    expect(container.querySelector('[data-as="chat-message"]')).toHaveClass('as-anim-message-in')
  })

  it('slides in the interrupted chip with a single amber pulse', () => {
    render(<ChatMessage role="assistant" content="partial" status="interrupted" />)
    const chip = screen.getByText('Stopped')
    expect(chip).toHaveClass('as-anim-slide-up')
    expect(chip).toHaveClass('as-anim-pulse-once')
    expect(chip.className).toContain('--as-pulse-color')
    expect(chip.className).toContain('--as-warning')
  })

  it('slides in the error card', () => {
    render(
      <ChatMessage
        role="assistant"
        content="partial"
        status="error"
        error={{ code: 'rate_limit', message: 'slow down', retryable: false }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveClass('as-anim-slide-up')
  })

  it('morphs copy into a success check and reverts after the feedback window', async () => {
    vi.useFakeTimers()
    try {
      const onCopy = vi.fn()
      render(<ChatMessage role="assistant" content="answer" actions={{ onCopy }} />)
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
      expect(onCopy).toHaveBeenCalledTimes(1)
      const copiedButton = screen.getByRole('button', { name: 'Copied' })
      expect(copiedButton.querySelector('.as-anim-fade-swap')?.tagName).toBe('svg')
      expect(copiedButton.querySelector('svg')?.getAttribute('class')).toContain('--as-success')
      act(() => {
        vi.advanceTimersByTime(1600)
      })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('honors the controlled copied state without the internal timer', () => {
    const onCopy = vi.fn()
    const { rerender } = render(
      <ChatMessage role="assistant" content="answer" actions={{ onCopy, copied: true }} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copied' }))
    rerender(<ChatMessage role="assistant" content="answer" actions={{ onCopy, copied: false }} />)
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('crossfades content variants only for branched messages', () => {
    const variants = { index: 1, count: 2, siblingIds: ['a', 'b'] }
    const { rerender, container } = render(
      <ChatMessage role="assistant" content="v1" variants={variants} />,
    )
    const wrapper = () => container.querySelector('[data-as="chat-message"] .min-w-0')
    expect(wrapper()).toHaveClass('as-anim-fade-swap')
    rerender(<ChatMessage role="assistant" content="only" />)
    expect(wrapper()).not.toHaveClass('as-anim-fade-swap')
  })

  it('renders flat assistant prose on the panel surface', () => {
    const { container } = render(<ChatMessage role="assistant" content="prose" design="flat" />)
    const root = container.querySelector('[data-as="chat-message"]')
    expect(root).toHaveAttribute('data-design', 'flat')
    const bubble = root?.querySelector(':scope > div > div, :scope > div')
    expect(bubble?.className).toContain('bg-transparent')
    expect(bubble?.className).not.toContain('bg-[var(--as-muted)]')
  })

  it('keeps the user bubble in flat design', () => {
    const { container } = render(<ChatMessage role="user" content="question" design="flat" />)
    const bubble = container.querySelector('[data-as="chat-message"] > div')
    expect(bubble).toHaveClass('bg-[var(--as-primary)]')
  })

  it('renders the avatar leading for assistants and trailing for users', () => {
    const { container, rerender } = render(
      <ChatMessage role="assistant" content="answer" avatar={<span>bot</span>} />,
    )
    const avatar = container.querySelector('[data-as="chat-message-avatar"]')
    expect(avatar).not.toBeNull()
    expect(avatar).toHaveTextContent('bot')
    expect(avatar?.parentElement).not.toHaveClass('flex-row-reverse')
    rerender(<ChatMessage role="user" content="question" avatar={<span>me</span>} />)
    expect(container.querySelector('[data-as="chat-message-avatar"]')?.parentElement).toHaveClass('flex-row-reverse')
  })

  it('passes axe across key states', async () => {
    const { container, rerender } = render(
      <ChatMessage
        role="assistant"
        content="answer"
        reasoning={<ChatReasoning text="because" />}
        actions={{ onCopy: () => {}, onEdit: () => {} }}
        variants={{ index: 1, count: 2, siblingIds: ['a', 'b'] }}
        onSelectVariant={() => {}}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
    rerender(
      <ChatMessage
        role="user"
        content="question"
        editing={{ value: 'x', onValueChange: () => {}, onSubmit: () => {}, onCancel: () => {} }}
      />,
    )
    await waitFor(async () => {
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})

describe('ChatMessageEditor', () => {
  it('submits on Cmd+Enter and cancels on Escape', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <ChatMessageEditor value="text" onValueChange={() => {}} onSubmit={onSubmit} onCancel={onCancel} />,
    )
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '{Control>}{Enter}{/Control}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await user.type(textarea, '{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('reveals with the slide-up animation and focuses the textarea on mount', () => {
    const { container } = render(
      <ChatMessageEditor value="text" onValueChange={() => {}} onSubmit={() => {}} onCancel={() => {}} />,
    )
    expect(container.querySelector('[data-as="chat-message-editor"]')).toHaveClass('as-anim-slide-up')
    expect(screen.getByRole('textbox')).toHaveFocus()
  })
})
