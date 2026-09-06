import { describe, expect, it, vi, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  activePathSet,
  buildBranchTree,
  initialLiveTurnState,
  linearTree,
  liveTurnReducer,
  variantInfo,
  walkActivePath,
  useChatStream,
  type BranchNodeInput,
  type ChatStreamEvent,
  type ChatStreamTransport,
} from '../src/components/chat-core'

const at = 1_000

function reduce(events: ChatStreamEvent[], startFrom = liveTurnReducer(initialLiveTurnState, { type: 'send', at })) {
  return events.reduce((state, event) => liveTurnReducer(state, { type: 'event', event, at }), startFrom)
}

describe('liveTurnReducer', () => {
  it('walks the happy path: pending → streaming → done with text, reasoning, tools, nodes', () => {
    const state = reduce([
      { event: 'flow_started', flow: 'chat', run_id: 'run-1', steps: [{ id: 'agent' }] },
      { event: 'node_started', node: 'agent', label: 'Thinking' },
      { event: 'delta', text: 'Let me think…', kind: 'reasoning' },
      { event: 'delta', text: 'The answer is ' },
      { event: 'tool_call', id: 't1', name: 'search_jobs', status: 'running' },
      { event: 'tool_call', id: 't1', name: 'search_jobs', status: 'done', result: '12 jobs', durationMs: 40 },
      { event: 'node_finished', node: 'agent', outcome: 'done' },
      { event: 'delta', text: '**42**.' },
      { event: 'flow_finished', summary: 'done' },
    ])
    expect(state.status).toBe('done')
    expect(state.text).toBe('The answer is **42**.')
    expect(state.reasoning).toBe('Let me think…')
    expect(state.toolCalls).toEqual([
      { id: 't1', name: 'search_jobs', title: undefined, status: 'done', args: undefined, result: '12 jobs', durationMs: 40 },
    ])
    expect(state.nodes).toEqual([{ id: 'agent', label: 'Thinking', status: 'done' }])
    expect(state.runId).toBe('run-1')
    expect(state.finishedAt).toBe(at)
  })

  it('maps flow_failed onto an error with the retryable flag', () => {
    const state = reduce([{ event: 'delta', text: 'partial ' }, { event: 'flow_failed', code: 'rate_limit', message: 'slow down', retryable: true }])
    expect(state.status).toBe('error')
    expect(state.error).toEqual({ code: 'rate_limit', message: 'slow down', retryable: true })
    expect(state.text).toBe('partial ')
  })

  it('treats interrupt as a resumable pause that streams again on the next delta', () => {
    const state = reduce([
      { event: 'delta', text: 'before pause ' },
      { event: 'interrupt', payload: { question: 'Which drug?' } },
    ])
    expect(state.status).toBe('interrupted')
    expect(state.stopped).toBe(false)
    expect(state.interruptPayload).toEqual({ question: 'Which drug?' })
    const resumed = liveTurnReducer(state, { type: 'event', event: { event: 'delta', text: 'after resume' }, at })
    expect(resumed.status).toBe('streaming')
    expect(resumed.text).toBe('before pause after resume')
  })

  it('user stop keeps the partial text and blocks late events', () => {
    let state = reduce([{ event: 'delta', text: 'partial answer' }])
    state = liveTurnReducer(state, { type: 'stop', at })
    expect(state.status).toBe('interrupted')
    expect(state.stopped).toBe(true)
    expect(state.text).toBe('partial answer')
    state = liveTurnReducer(state, { type: 'event', event: { event: 'delta', text: ' LATE' }, at })
    state = liveTurnReducer(state, { type: 'event', event: { event: 'flow_finished' }, at })
    expect(state.text).toBe('partial answer')
    expect(state.status).toBe('interrupted')
  })

  it('ignores events for a different run_id once one is known', () => {
    const state = reduce([
      { event: 'flow_started', flow: 'chat', run_id: 'run-1' },
      { event: 'delta', text: 'good', run_id: 'run-1' },
      { event: 'delta', text: 'EVIL', run_id: 'run-2' },
      { event: 'flow_failed', code: 'x', message: 'EVIL', retryable: false, run_id: 'run-2' },
    ])
    expect(state.text).toBe('good')
    expect(state.status).toBe('streaming')
  })

  it('ignores events before any send and unknown event names', () => {
    expect(liveTurnReducer(initialLiveTurnState, { type: 'event', event: { event: 'delta', text: 'x' }, at })).toBe(initialLiveTurnState)
    const state = reduce([{ event: 'delta', text: 'ok' }])
    const ignored = liveTurnReducer(state, { type: 'event', event: { event: 'mystery' } as unknown as ChatStreamEvent, at })
    expect(ignored).toBe(state)
  })

  it('seeds planned steps from flow_started and activates them on node_started', () => {
    const state = reduce([
      { event: 'flow_started', flow: 'chat', run_id: 'r1', steps: [{ id: 'search', label: 'Searching the catalog' }, { id: 'write', label: 'Writing the reply' }] },
      { event: 'node_started', node: 'search', label: 'Searching the catalog' },
    ])
    expect(state.nodes).toEqual([
      { id: 'search', label: 'Searching the catalog', status: 'running' },
      { id: 'write', label: 'Writing the reply', status: 'pending' },
    ])
  })

  it('node_finished upserts labels and outcomes without duplicating rows', () => {
    const state = reduce([
      { event: 'node_started', node: 'tools', label: 'Using tools' },
      { event: 'node_finished', node: 'tools', outcome: 'failed' },
      { event: 'node_started', node: 'tools', label: 'Retry' },
    ])
    expect(state.nodes).toEqual([{ id: 'tools', label: 'Retry', status: 'running' }])
  })
})

describe('branch tree utilities', () => {
  const nodes: BranchNodeInput[] = [
    { id: 'u1', role: 'user', excerpt: 'explain limits', parentId: null, activeChildId: 'a1' },
    { id: 'a1', role: 'assistant', excerpt: 'first answer', parentId: 'u1', activeChildId: 'u2a' },
    { id: 'u2a', role: 'user', excerpt: 'v1 follow-up', parentId: 'a1', activeChildId: 'r1' },
    { id: 'r1', role: 'assistant', excerpt: 'v1 reply', parentId: 'u2a', activeChildId: null },
    { id: 'u2b', role: 'user', excerpt: 'v2 follow-up (edited)', parentId: 'a1', activeChildId: null },
  ]

  it('buildBranchTree computes child order and walks the active path via pointers', () => {
    const tree = buildBranchTree({ activeRootId: 'u1', nodes })
    expect(tree.nodes['a1']!.childIds).toEqual(['u2a', 'u2b'])
    expect(walkActivePath(tree)).toEqual(['u1', 'a1', 'u2a', 'r1'])
    expect(activePathSet(tree).has('u2b')).toBe(false)
  })

  it('falls back to the newest sibling when activeChildId is missing', () => {
    const tree = buildBranchTree({ activeRootId: 'u1', nodes: nodes.map((n) => (n.id === 'a1' ? { ...n, activeChildId: null } : n)) })
    expect(walkActivePath(tree)).toEqual(['u1', 'a1', 'u2b'])
  })

  it('falls back to the newest root when activeRootId is missing or unknown', () => {
    const tree = buildBranchTree({ nodes })
    expect(tree.activeRootId).toBe('u1')
    expect(walkActivePath(buildBranchTree({ activeRootId: 'nope', nodes }))).toEqual(['u1', 'a1', 'u2a', 'r1'])
  })

  it('variantInfo reports 1-based position among siblings (roots included)', () => {
    const tree = buildBranchTree({ activeRootId: 'u1', nodes })
    expect(variantInfo(tree, 'u2a')).toEqual({ index: 1, count: 2, siblingIds: ['u2a', 'u2b'] })
    expect(variantInfo(tree, 'u2b')).toEqual({ index: 2, count: 2, siblingIds: ['u2a', 'u2b'] })
    expect(variantInfo(tree, 'u1')).toEqual({ index: 1, count: 1, siblingIds: ['u1'] })
    expect(variantInfo(tree, 'missing')).toEqual({ index: 1, count: 1, siblingIds: ['missing'] })
  })

  it('linearTree chains a visible list into a degenerate tree', () => {
    const tree = linearTree([
      { id: 'm1', role: 'user', excerpt: 'hi' },
      { id: 'm2', role: 'assistant', excerpt: 'hello' },
      { id: 'm3', role: 'user', excerpt: 'bye' },
    ])
    expect(tree.activeRootId).toBe('m1')
    expect(walkActivePath(tree)).toEqual(['m1', 'm2', 'm3'])
    expect(variantInfo(tree, 'm2').count).toBe(1)
  })

  it('walkActivePath terminates on cycles', () => {
    const tree = buildBranchTree({
      nodes: [
        { id: 'a', role: 'user', parentId: null, activeChildId: 'b' },
        { id: 'b', role: 'assistant', parentId: 'a', activeChildId: 'a' },
      ],
    })
    expect(walkActivePath(tree)).toEqual(['a', 'b'])
  })
})

interface Probe {
  status: string
  text: string | null
  reasoning: string | null
  error: { code: string; message: string } | null
  stopped: boolean
  live: { status: string } | null
  send(text: string): Promise<boolean>
  stop(): Promise<void>
  reset(): void
}

function makeTransport() {
  let subscriber: { onEvent: (event: ChatStreamEvent) => void } | null = null
  const transport: ChatStreamTransport = {
    send: vi.fn(async () => undefined),
    subscribe: vi.fn((handlers) => {
      subscriber = handlers
      return () => {
        subscriber = null
      }
    }),
    stop: vi.fn(async () => undefined),
  }
  return { transport, emit: (event: ChatStreamEvent) => subscriber?.onEvent(event) }
}

function Probe({ transport, capture }: { transport: ChatStreamTransport; capture: { current: Probe | null } }) {
  const stream = useChatStream({ transport })
  capture.current = stream as unknown as Probe
  return (
    <div>
      <p data-status={stream.status}>{stream.status}</p>
      <p data-text={stream.text ?? ''} />
      <p data-reasoning={stream.reasoning ?? ''} />
      <p data-error-code={stream.error?.code ?? ''} />
      <button type="button" onClick={() => void stream.send('hello')}>
        Send
      </button>
      <button type="button" onClick={() => void stream.stop()}>
        Stop
      </button>
      <button type="button" onClick={stream.reset}>
        Reset
      </button>
    </div>
  )
}

function setup(transport: ChatStreamTransport) {
  const capture = { current: null as Probe | null }
  render(<Probe transport={transport} capture={capture} />)
  const click = (name: string) => {
    fireEvent.click(screen.getByRole('button', { name }))
  }
  return { capture, click }
}

describe('useChatStream', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('coalesces deltas into flushed text and completes on flow_finished', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    expect(capture.current?.live).toBeNull()
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('pending')
    emit({ event: 'delta', text: 'Hel' })
    emit({ event: 'delta', text: 'lo ' })
    emit({ event: 'delta', text: 'world', kind: 'reasoning' })
    await vi.advanceTimersByTimeAsync(33)
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('streaming')
    expect(capture.current?.text).toBe('Hello ')
    expect(capture.current?.reasoning).toBe('world')
    emit({ event: 'delta', text: 'world!' })
    emit({ event: 'flow_finished' })
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('done')
    expect(capture.current?.text).toBe('Hello world!')
  })

  it('rejects blank sends and double-sends while a turn is active', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    expect(await capture.current!.send('   ')).toBe(false)
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    emit({ event: 'delta', text: 'x' })
    await vi.advanceTimersByTimeAsync(33)
    expect(await capture.current!.send('again')).toBe(false)
    expect(transport.send).toHaveBeenCalledTimes(1)
  })

  it('surfaces a failed send as a retryable error', async () => {
    vi.useFakeTimers()
    const { transport } = makeTransport()
    transport.send = vi.fn(async () => {
      throw new Error('network down')
    })
    const { capture, click } = setup(transport)
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('error')
    expect(capture.current?.error).toEqual({ code: 'send_failed', message: 'network down', retryable: true })
  })

  it('times out a stuck turn with a retryable timeout error', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    emit({ event: 'delta', text: 'partial ' })
    await vi.advanceTimersByTimeAsync(33)
    await vi.advanceTimersByTimeAsync(90_000)
    expect(capture.current?.status).toBe('error')
    expect(capture.current?.error?.code).toBe('timeout')
    expect(capture.current?.text).toBe('partial ')
    emit({ event: 'delta', text: 'LATE' })
    await vi.advanceTimersByTimeAsync(33)
    expect(capture.current?.text).toBe('partial ')
  })

  it('stop flushes the partial text, marks user-stopped and calls the transport', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    emit({ event: 'delta', text: 'partial answer' })
    click('Stop')
    await vi.advanceTimersByTimeAsync(0)
    expect(transport.stop).toHaveBeenCalledTimes(1)
    expect(capture.current?.status).toBe('interrupted')
    expect(capture.current?.stopped).toBe(true)
    expect(capture.current?.text).toBe('partial answer')
  })

  it('reset returns to idle and a fresh turn streams normally afterwards', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    emit({ event: 'flow_finished' })
    await vi.advanceTimersByTimeAsync(0)
    click('Reset')
    expect(capture.current?.status).toBe('idle')
    expect(capture.current?.live).toBeNull()
    click('Send')
    await vi.advanceTimersByTimeAsync(0)
    emit({ event: 'delta', text: 'second turn' })
    await vi.advanceTimersByTimeAsync(33)
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.text).toBe('second turn')
  })

  it('send/stop/reset closures stay stable across renders', () => {
    const { transport } = makeTransport()
    const capture = { current: null as Probe | null }
    const { rerender } = render(<Probe transport={transport} capture={capture} />)
    const first = { ...capture.current! }
    rerender(<Probe transport={transport} capture={capture} />)
    expect(capture.current?.send).toBe(first.send)
    expect(capture.current?.stop).toBe(first.stop)
    expect(capture.current?.reset).toBe(first.reset)
  })
})
