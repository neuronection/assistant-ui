import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    const { rerender } = render(<ChatReasoning text="live" open={false} streaming />)
    expect(screen.queryByText('live')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<ChatReasoning text="live" open />)
    expect(screen.getByText('live')).toBeInTheDocument()
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
    expect(screen.getByText(/"q": "nurse"/)).toBeInTheDocument()
    expect(screen.getByText('12 jobs')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('marks failed tools with the sr-only status', () => {
    const { container } = render(<ChatToolCard name="fetch" status="failed" />)
    expect(container.querySelector('[data-as="chat-tool-card"]')?.getAttribute('data-status')).toBe('failed')
    expect(screen.getByText('Failed')).toHaveClass('sr-only')
  })

  it('renders the default serialized result in a pre pane', () => {
    render(<ChatToolCard name="search" status="done" result="12 hits" defaultOpen />)
    expect(screen.getByText('12 hits').closest('pre')).not.toBeNull()
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

  it('keeps action row keyboard-reachable (focus-within reveals it)', () => {
    render(<ChatMessage role="assistant" content="answer" actions={{ onCopy: () => {} }} />)
    const row = screen.getByRole('button', { name: 'Copy' }).parentElement!
    expect(row).toHaveClass('opacity-0')
    fireEvent.focus(screen.getByRole('button', { name: 'Copy' }))
    expect(row).toHaveClass('focus-within:opacity-100')
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
})
