import { describe, expect, it } from 'vitest'
import React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
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

  it('passes axe with items and live tail', async () => {
    const { container } = render(
      <ChatTranscript items={messages} live={<div>typing…</div>} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('counts unread replies while scrolled away and resets on return', async () => {
    const utils = render(<ChatTranscript items={messages} live={<div>streaming</div>} />)
    const log = screen.getByRole('log')
    const overflow = { scrollHeight: 600, clientHeight: 400 }
    const bottom = overflow.scrollHeight - overflow.clientHeight
    const writes: number[] = []
    let scrollTop = 0
    Object.defineProperty(log, 'scrollHeight', { configurable: true, get: () => overflow.scrollHeight })
    Object.defineProperty(log, 'clientHeight', { configurable: true, get: () => overflow.clientHeight })
    Object.defineProperty(log, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = Math.max(0, Math.min(value, bottom))
        writes.push(scrollTop)
      },
    })
    log.scrollTo = vi.fn()
    await vi.waitFor(() => expect(writes).toContain(bottom))
    fireEvent.scroll(log)

    fireEvent.wheel(log, { deltaY: -10 })
    scrollTop = 100
    fireEvent.scroll(log)
    utils.rerender(
      <ChatTranscript
        items={[...messages, { id: 'a2', role: 'assistant', content: 'missed reply', status: 'done' }]}
        live={<div>streaming</div>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Scroll to latest — 1 new messages' })).toBeInTheDocument()

    scrollTop = bottom
    fireEvent.scroll(log)
    expect(screen.queryByRole('button', { name: /new messages/ })).not.toBeInTheDocument()

    scrollTop = 100
    fireEvent.scroll(log)
    utils.rerender(
      <ChatTranscript
        items={[...messages, { id: 'a2', role: 'assistant', content: 'missed reply', status: 'done' }, { id: 'a3', role: 'assistant', content: 'another missed', status: 'done' }]}
        live={<div>streaming</div>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Scroll to latest — 1 new messages' })).toBeInTheDocument()
  })

  it('resets the unread count when the jump pill is clicked', () => {
    const utils = render(<ChatTranscript items={messages} />)
    const log = screen.getByRole('log')
    const overflow = { scrollHeight: 900, clientHeight: 300 }
    const bottom = overflow.scrollHeight - overflow.clientHeight
    let scrollTop = 0
    Object.defineProperty(log, 'scrollHeight', { configurable: true, get: () => overflow.scrollHeight })
    Object.defineProperty(log, 'clientHeight', { configurable: true, get: () => overflow.clientHeight })
    Object.defineProperty(log, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = Math.max(0, Math.min(value, bottom))
      },
    })
    log.scrollTo = vi.fn()
    fireEvent.wheel(log, { deltaY: -10 })
    utils.rerender(
      <ChatTranscript
        items={[...messages, { id: 'a2', role: 'assistant', content: 'missed', status: 'done' }]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Scroll to latest — 1 new messages' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Scroll to latest/ }))
    utils.rerender(
      <ChatTranscript
        items={[...messages, { id: 'a2', role: 'assistant', content: 'missed', status: 'done' }, { id: 'a3', role: 'assistant', content: 'another', status: 'done' }]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Scroll to latest — 1 new messages' })).toBeInTheDocument()
  })

  it('groups consecutive same-role messages with position hooks and tighter spacing', () => {
    const grouped: ChatMessageView[] = [
      { id: 'u1', role: 'user', content: 'q1', status: 'done' },
      { id: 'a1', role: 'assistant', content: 'r1', status: 'done' },
      { id: 'a2', role: 'assistant', content: 'r2', status: 'done' },
      { id: 'a3', role: 'assistant', content: 'r3', status: 'done' },
      { id: 'u2', role: 'user', content: 'q2', status: 'done' },
    ]
    const { container } = render(<ChatTranscript items={grouped} groupConsecutive />)
    const positions = Array.from(container.querySelectorAll('[data-group-pos]')).map(
      (row) => row.getAttribute('data-group-pos'),
    )
    expect(positions).toEqual(['single', 'start', 'mid', 'end', 'single'])
    const rows = container.querySelectorAll('[data-group-pos]')
    expect(rows[2]).toHaveClass('-mt-2')
    expect(rows[3]).toHaveClass('-mt-2')
    expect(rows[0]).not.toHaveClass('-mt-2')
  })

  it('hands the group position to a custom renderItem', () => {
    const seen: (string | undefined)[] = []
    render(
      <ChatTranscript
        items={[
          { id: 'a1', role: 'assistant', content: 'r1', status: 'done' },
          { id: 'a2', role: 'assistant', content: 'r2', status: 'done' },
        ]}
        groupConsecutive
        renderItem={(message, _index, groupPos) => {
          seen.push(groupPos)
          return <p key={message.id}>{message.content}</p>
        }}
      />,
    )
    expect(seen).toEqual(['start', 'end'])
  })

  it('renders the default renderer in the requested design', () => {
    const { container } = render(
      <ChatTranscript
        items={[{ id: 'a1', role: 'assistant', content: 'flat reply', status: 'done' }]}
        design="flat"
      />,
    )
    expect(container.querySelector('[data-as="chat-message"]')).toHaveAttribute('data-design', 'flat')
  })

  it('searches the conversation: field, match count, highlight and jump flash', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const searchable: ChatMessageView[] = [
      { id: 'u1', role: 'user', content: 'what is a limit?', status: 'done' },
      { id: 'a1', role: 'assistant', content: 'a limit is a value', status: 'done' },
      { id: 'u2', role: 'user', content: 'unrelated', status: 'done' },
      { id: 'a2', role: 'assistant', content: 'the limit exists', status: 'done' },
    ]
    function SearchHarness() {
      const [query, setQuery] = React.useState('')
      return <ChatTranscript items={searchable} search={{ query, onQueryChange: setQuery }} />
    }
    render(<SearchHarness />)
    const field = screen.getByRole('textbox', { name: 'Search conversation' })
    expect(screen.getByText('0')).toBeInTheDocument()
    await user.type(field, 'limit')
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(document.querySelectorAll('mark[data-as="chat-search-match"]').length).toBeGreaterThan(0)
    expect(row('u1')).toHaveAttribute('data-search-flash', 'true')

    await user.click(screen.getByRole('button', { name: 'Next match' }))
    expect(screen.getByText('2/3')).toBeInTheDocument()
    expect(row('a1')).toHaveAttribute('data-search-flash', 'true')

    await user.click(screen.getByRole('button', { name: 'Previous match' }))
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalled()

    function row(id: string) {
      return document.querySelector(`[data-message-id="${id}"]`)!
    }
  })

  it('hands the active query to a custom renderItem', () => {
    const seen: (string | undefined)[] = []
    render(
      <ChatTranscript
        items={[{ id: 'a1', role: 'assistant', content: 'hello limit', status: 'done' }]}
        search={{ query: 'limit', onQueryChange: () => {} }}
        renderItem={(message, _index, _groupPos, query) => {
          seen.push(query)
          return <p key={message.id}>{query ? `q:${query}` : message.content}</p>
        }}
      />,
    )
    expect(seen[0]).toBe('limit')
    expect(seen.every((entry) => entry === 'limit')).toBe(true)
    expect(screen.getByText('q:limit')).toBeInTheDocument()
  })

  it('clears the query from the field with Escape', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(
      <ChatTranscript
        items={[{ id: 'a1', role: 'assistant', content: 'needle here', status: 'done' }]}
        search={{ query: 'needle', onQueryChange }}
      />,
    )
    await user.type(screen.getByRole('textbox', { name: 'Search conversation' }), '{Escape}')
    expect(onQueryChange).toHaveBeenLastCalledWith('')
  })

  it('passes axe with the search field and marks', async () => {
    const { container } = render(
      <ChatTranscript
        items={[{ id: 'a1', role: 'assistant', content: 'needle here', status: 'done' }]}
        search={{ query: 'needle', onQueryChange: () => {} }}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('separates day groups with Today/Yesterday/date chips', () => {
    const now = Date.now()
    const day = 86_400_000
    const { container } = render(
      <ChatTranscript
        showDateSeparators
        items={[
          { id: 'u0', role: 'user', content: 'old', status: 'done', createdAt: new Date(now - 5 * day).toISOString() },
          { id: 'u1', role: 'user', content: 'yesterday question', status: 'done', createdAt: new Date(now - day).toISOString() },
          { id: 'a1', role: 'assistant', content: 'yesterday answer', status: 'done', createdAt: new Date(now - day).toISOString() },
          { id: 'u2', role: 'user', content: 'today question', status: 'done', createdAt: new Date(now).toISOString() },
        ]}
      />,
    )
    const separators = container.querySelectorAll('[data-as="chat-date-separator"]')
    expect(separators).toHaveLength(2)
    expect(separators[0]).toHaveAttribute('aria-label', 'Yesterday')
    expect(separators[1]).toHaveAttribute('aria-label', 'Today')
  })

  it('honors a custom date formatter for older days', () => {
    const { container } = render(
      <ChatTranscript
        showDateSeparators
        formatDate={(date) => `day ${date.getDate()}`}
        items={[
          { id: 'u0', role: 'user', content: 'old', status: 'done', createdAt: new Date(2026, 0, 2).toISOString() },
          { id: 'u1', role: 'user', content: 'older', status: 'done', createdAt: new Date(2026, 0, 1).toISOString() },
        ]}
      />,
    )
    const separators = container.querySelectorAll('[data-as="chat-date-separator"]')
    expect(separators).toHaveLength(1)
    expect(separators[0]).toHaveAttribute('aria-label', 'day 1')
  })

  it('scrolls to and flashes the focused message', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const { rerender } = render(
      <ChatTranscript
        items={[
          { id: 'u1', role: 'user', content: 'one', status: 'done' },
          { id: 'a1', role: 'assistant', content: 'two', status: 'done' },
        ]}
        focusMessageId={null}
      />,
    )
    rerender(
      <ChatTranscript
        items={[
          { id: 'u1', role: 'user', content: 'one', status: 'done' },
          { id: 'a1', role: 'assistant', content: 'two', status: 'done' },
        ]}
        focusMessageId="a1"
      />,
    )
    const row = document.querySelector('[data-message-id="a1"]')!
    expect(row).toHaveAttribute('data-search-flash', 'true')
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('shows a floating stop pill while streaming away from the bottom', async () => {
    const onStop = vi.fn()
    const utils = render(
      <ChatTranscript
        items={messages}
        live={<div>streaming</div>}
        onStop={onStop}
      />,
    )
    const log = screen.getByRole('log')
    const overflow = { scrollHeight: 900, clientHeight: 300 }
    const bottom = overflow.scrollHeight - overflow.clientHeight
    let scrollTop = 0
    Object.defineProperty(log, 'scrollHeight', { configurable: true, get: () => overflow.scrollHeight })
    Object.defineProperty(log, 'clientHeight', { configurable: true, get: () => overflow.clientHeight })
    Object.defineProperty(log, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = Math.max(0, Math.min(value, bottom))
      },
    })
    log.scrollTo = vi.fn()
    await vi.waitFor(() => expect(scrollTop).toBe(bottom))
    expect(screen.queryByRole('button', { name: 'Stop generating' })).not.toBeInTheDocument()

    fireEvent.wheel(log, { deltaY: -10 })
    const stopPill = screen.getByRole('button', { name: 'Stop generating' })
    expect(stopPill).toBeInTheDocument()
    fireEvent.click(stopPill)
    expect(onStop).toHaveBeenCalledTimes(1)
    void utils
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
})

type ScrollMock = {
  writes: number[]
  setScroll: (top: number) => void
}

function mockScroll(element: HTMLElement, scrollHeight: number, clientHeight: number): ScrollMock {
  let scrollTop = 0
  const writes: number[] = []
  Object.defineProperty(element, 'scrollHeight', { configurable: true, get: () => scrollHeight })
  Object.defineProperty(element, 'clientHeight', { configurable: true, get: () => clientHeight })
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = Math.max(0, Math.min(value, scrollHeight - clientHeight))
      writes.push(scrollTop)
    },
  })
  element.scrollTo = vi.fn()
  return { writes, setScroll: (top: number) => { scrollTop = top } }
}

describe('ChatTranscript stick-to-bottom', () => {
  const overflow = { scrollHeight: 600, clientHeight: 400 }
  const bottom = overflow.scrollHeight - overflow.clientHeight

  function setupPinned() {
    const utils = render(<ChatTranscript items={messages} live={<div>streaming</div>} />)
    const log = screen.getByRole('log')
    const mock = mockScroll(log, overflow.scrollHeight, overflow.clientHeight)
    return { ...utils, ...mock, log }
  }

  it('follows the stream while pinned to the bottom', async () => {
    const { writes, log } = setupPinned()
    await vi.waitFor(() => expect(writes).toContain(bottom))
    fireEvent.scroll(log)
    expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()
  })

  it('stops following on a partial upward scroll even inside the threshold', async () => {
    const { rerender, writes, log } = setupPinned()
    await vi.waitFor(() => expect(writes).toContain(bottom))
    fireEvent.scroll(log)

    log.scrollTop = bottom - 30
    fireEvent.scroll(log)
    expect(screen.getByRole('button', { name: 'Scroll to latest' })).toBeInTheDocument()

    const writesBefore = writes.length
    rerender(
      <ChatTranscript
        items={[...messages, { id: 'a2', role: 'assistant', content: 'more streamed text', status: 'done' }]}
        live={<div>streaming</div>}
      />,
    )
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 30)) })
    expect(writes.length).toBe(writesBefore)
  })

  it('cancels the follow on wheel-up before any scroll happens', async () => {
    const { rerender, writes, log } = setupPinned()
    await vi.waitFor(() => expect(writes).toContain(bottom))

    fireEvent.wheel(log, { deltaY: -10 })
    expect(screen.getByRole('button', { name: 'Scroll to latest' })).toBeInTheDocument()

    const writesBefore = writes.length
    rerender(<ChatTranscript items={messages} live={<div>streaming more</div>} />)
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 30)) })
    expect(writes.length).toBe(writesBefore)
  })

  it('cancels the follow on an upward touch drag', () => {
    const { log } = setupPinned()
    fireEvent.touchStart(log, { touches: [{ clientY: 120 }] })
    fireEvent.touchMove(log, { touches: [{ clientY: 160 }] })
    expect(screen.getByRole('button', { name: 'Scroll to latest' })).toBeInTheDocument()
  })

  it('cancels the follow on scroll-up keys', () => {
    const { log } = setupPinned()
    fireEvent.keyDown(log, { key: 'PageUp' })
    expect(screen.getByRole('button', { name: 'Scroll to latest' })).toBeInTheDocument()
  })

  it('re-arms the follow when the user scrolls back to the bottom', async () => {
    const { rerender, writes, log } = setupPinned()
    await vi.waitFor(() => expect(writes).toContain(bottom))

    fireEvent.wheel(log, { deltaY: -10 })
    expect(screen.getByRole('button', { name: 'Scroll to latest' })).toBeInTheDocument()

    log.scrollTop = bottom
    fireEvent.scroll(log)
    expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()

    rerender(<ChatTranscript items={messages} live={<div>streaming more</div>} />)
    await vi.waitFor(() => expect(writes.filter((top) => top === bottom).length).toBeGreaterThan(1))
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

const now = new Date()
const atLocalNoon = (daysAgo: number) => {
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(12, 0, 0, 0)
  return date
}
const sessions = [
  { id: 's1', title: 'Limits tutoring', updatedAt: now },
  { id: 's2', title: 'Derivatives practice', updatedAt: atLocalNoon(1) },
  { id: 's3', title: 'Old integrals chat', updatedAt: atLocalNoon(8) },
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

  it('keeps the empty state outside the list role and passes axe', async () => {
    const { container } = render(<ChatSessionList sessions={[]} onSelect={() => {}} />)
    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
    expect(container.querySelector('[role="list"]')).toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('keeps the no-matches state outside the list role and passes axe', async () => {
    const user = userEvent.setup()
    const { container } = render(<ChatSessionList sessions={sessions} onSelect={() => {}} />)
    await user.type(screen.getByRole('searchbox'), 'zzzz')
    expect(screen.getByText('No matches')).toBeInTheDocument()
    expect(container.querySelector('[role="list"]')).toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })
})
