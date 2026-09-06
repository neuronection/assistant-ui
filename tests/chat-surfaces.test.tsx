import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'

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

import { ChatTranscript } from '../src/components/chat-transcript'
import { ChatBranchTree } from '../src/components/chat-branch-tree'
import { ChatSessionList } from '../src/components/chat-session-list'
import { buildBranchTree } from '../src/components/chat-core'
import type { ChatMessageView } from '../src/components/chat-core'

const messages: ChatMessageView[] = [
  { id: 'u1', role: 'user', content: 'what is a limit?', status: 'done' },
  { id: 'a1', role: 'assistant', content: 'a limit is…', status: 'done' },
]

function virtualizedTexts(rows: NodeListOf<Element>): string[] {
  return Array.from(rows).map((row) => row.textContent?.trim() ?? '')
}

describe('ChatTranscript', () => {
  it('renders items through the default renderer and marks the log role', () => {
    render(<ChatTranscript items={messages} />)
    const log = screen.getByRole('log', { name: 'Conversation' })
    expect(log).toBeInTheDocument()
    expect(screen.getByText('what is a limit?')).toBeInTheDocument()
    expect(screen.getByText('a limit is…')).toBeInTheDocument()
  })

  it('shows the empty state when there is nothing live', () => {
    render(<ChatTranscript items={[]} emptyState="Ask anything about your courses" />)
    expect(screen.getByText('Ask anything about your courses')).toBeInTheDocument()
  })

  it('renders the live tail and sets aria-busy', () => {
    render(<ChatTranscript items={messages} live={<div>streaming bubble</div>} />)
    expect(screen.getByText('streaming bubble')).toBeInTheDocument()
    expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'true')
  })

  it('announces assistant replies politely (never per token)', () => {
    const { rerender } = render(<ChatTranscript items={messages.slice(0, 1)} />)
    expect(screen.getByRole('log')).toBeInTheDocument()
    rerender(<ChatTranscript items={messages} />)
    const live = screen.getByText('Assistant replied')
    expect(live).toHaveClass('sr-only')
    expect(live).toHaveAttribute('aria-live', 'polite')
  })

  it('renders through a custom renderItem', () => {
    render(<ChatTranscript items={messages} renderItem={(message) => <p key={message.id}>custom:{message.id}</p>} />)
    expect(screen.getByText('custom:u1')).toBeInTheDocument()
    expect(screen.getByText('custom:a1')).toBeInTheDocument()
  })

  it('virtualizes long transcripts without losing messages', () => {
    const many: ChatMessageView[] = Array.from({ length: 50 }, (_, i) => ({
      id: `m${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `message ${i}`,
      status: 'done',
    }))
    const { container } = render(<ChatTranscript items={many} virtualized />)
    expect(screen.getByRole('log')).toBeInTheDocument()
    const rows = container.querySelectorAll('[data-index]')
    expect(rows.length).toBeGreaterThan(0)
    expect(virtualizedTexts(rows)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^message \d+$/)]),
    )
  })

  it('passes axe with items and live tail', async () => {
    const { container } = render(
      <ChatTranscript items={messages} live={<div>typing…</div>} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

const tree = buildBranchTree({
  activeRootId: 'u1',
  nodes: [
    { id: 'u1', role: 'user', excerpt: 'explain limits', parentId: null, activeChildId: 'a1' },
    { id: 'a1', role: 'assistant', excerpt: 'a limit is…', parentId: 'u1', activeChildId: 'u2a' },
    { id: 'u2a', role: 'user', excerpt: 'v1 follow-up', parentId: 'a1', activeChildId: null },
    { id: 'u2b', role: 'user', excerpt: 'v2 follow-up (edited)', parentId: 'a1', activeChildId: null },
  ],
})

describe('ChatBranchTree', () => {
  it('renders the tree with active-path selection and fork badges', () => {
    render(<ChatBranchTree tree={tree} />)
    const treeEl = screen.getByRole('tree', { name: 'Conversation branches' })
    expect(treeEl).toBeInTheDocument()
    const onPath = screen.getByText('v1 follow-up').closest('[role="treeitem"]')
    const offPath = screen.getByText('v2 follow-up (edited)').closest('[role="treeitem"]')
    expect(onPath).toHaveAttribute('aria-selected', 'true')
    expect(offPath).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('selects nodes by click and keyboard', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ChatBranchTree tree={tree} onSelect={onSelect} />)
    await user.click(screen.getByText('v2 follow-up (edited)'))
    expect(onSelect).toHaveBeenCalledWith('u2b')
    ;(screen.getByText('explain limits').closest('[role="treeitem"]') as HTMLElement).focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('u1')
  })

  it('navigates with arrow keys via roving tabindex', async () => {
    const user = userEvent.setup()
    render(<ChatBranchTree tree={tree} />)
    const items = screen.getAllByRole('treeitem')
    expect(items[0]).toHaveAttribute('tabindex', '0')
    items[0]!.focus()
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(items[1])
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(items[0])
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(items[items.length - 1])
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(items[0])
  })

  it('passes axe', async () => {
    const { container } = render(<ChatBranchTree tree={tree} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

const now = Date.now()
const sessions = [
  { id: 's1', title: 'Limits tutoring', updatedAt: new Date(now) },
  { id: 's2', title: 'Derivatives practice', updatedAt: new Date(now - 26 * 3600_000) },
  { id: 's3', title: 'Old integrals chat', updatedAt: new Date(now - 8 * 24 * 3600_000) },
]

describe('ChatSessionList', () => {
  it('groups sessions by date and marks the active one', () => {
    render(<ChatSessionList sessions={sessions} activeId="s1" onSelect={() => {}} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('Earlier')).toBeInTheDocument()
    expect(screen.getByText('Limits tutoring').closest('[role="listitem"]')).toHaveAttribute('aria-current', 'true')
  })

  it('filters sessions by fuzzy search', async () => {
    const user = userEvent.setup()
    render(<ChatSessionList sessions={sessions} onSelect={() => {}} />)
    await user.type(screen.getByRole('searchbox'), 'derivatives')
    expect(screen.getByText('Derivatives practice')).toBeInTheDocument()
    expect(screen.queryByText('Limits tutoring')).not.toBeInTheDocument()
  })

  it('selects via click and keyboard, fires row actions', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onDelete = vi.fn()
    const onRename = vi.fn()
    render(
      <ChatSessionList sessions={sessions} onSelect={onSelect} onDelete={onDelete} onRename={onRename} onNew={() => {}} />,
    )
    await user.click(screen.getByText('Limits tutoring'))
    expect(onSelect).toHaveBeenCalledWith('s1')
    fireEvent.keyDown(screen.getByText('Derivatives practice'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('s2')
    const row = screen.getByText('Limits tutoring').closest('[role="listitem"]') as HTMLElement
    await user.hover(row)
    await user.click(within(row).getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('s1')
    await user.click(within(row).getByRole('button', { name: 'Rename' }))
    expect(onRename).toHaveBeenCalledWith('s1')
    await user.click(screen.getByRole('button', { name: 'New conversation' }))
  })

  it('passes axe with search and actions', async () => {
    const { container } = render(
      <ChatSessionList sessions={sessions} onSelect={() => {}} onDelete={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
