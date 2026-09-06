import { useCallback, useRef, useState } from 'react'
import { Button } from '../src/components/button'
import {
  useChatStream,
  walkActivePath,
  buildBranchTree,
  type ChatStreamEvent,
  type ChatStreamTransport,
} from '../src/components/chat-core'

const script: ChatStreamEvent[] = [
  { event: 'flow_started', flow: 'chat', run_id: 'r1', steps: [{ id: 'agent' }, { id: 'tools' }] },
  { event: 'node_started', node: 'agent', label: 'Thinking' },
  { event: 'delta', text: 'The user asked about limits. ', kind: 'reasoning' },
  { event: 'delta', text: 'Let me search the catalog.', kind: 'reasoning' },
  { event: 'node_started', node: 'tools', label: 'Using tools' },
  { event: 'tool_call', id: 't1', name: 'search_jobs', title: 'Job search', status: 'running' },
  { event: 'delta', text: 'A **limit** is the value a function ' },
  { event: 'tool_call', id: 't1', name: 'search_jobs', status: 'done', result: '12 hits', durationMs: 210 },
  { event: 'node_finished', node: 'tools', outcome: 'done' },
  { event: 'delta', text: 'approaches:\n\n$$\\lim_{x \\to a} f(x) = L$$\n\n' },
  { event: 'node_finished', node: 'agent', outcome: 'done' },
  { event: 'flow_finished', summary: 'answered' },
]

function makeTransport(): ChatStreamTransport {
  let timer: number | null = null
  return {
    send: async () => {
      timer = window.setInterval(() => {
        const next = script.shift()
        if (next === undefined) {
          if (timer !== null) window.clearInterval(timer)
          return
        }
        sinkRef.current?.(next)
      }, 140)
    },
    stop: async () => {
      if (timer !== null) window.clearInterval(timer)
    },
    subscribe: ({ onEvent }: { onEvent: (event: ChatStreamEvent) => void }) => {
      sinkRef.current = onEvent
      return () => {
        sinkRef.current = null
      }
    },
  }
}

const sinkRef: { current: ((event: ChatStreamEvent) => void) | null } = { current: null }

export function ChatCoreStory() {
  const transportRef = useRef(makeTransport())
  const stream = useChatStream({ transport: transportRef.current })
  const [sent, setSent] = useState(false)

  const tree = buildBranchTree({
    activeRootId: 'u1',
    nodes: [
      { id: 'u1', role: 'user', excerpt: 'explain limits', parentId: null, activeChildId: 'a1' },
      { id: 'a1', role: 'assistant', excerpt: 'a limit is…', parentId: 'u1', activeChildId: 'u2a' },
      { id: 'u2a', role: 'user', excerpt: 'v1 follow-up', parentId: 'a1', activeChildId: null },
      { id: 'u2b', role: 'user', excerpt: 'v2 follow-up (edited)', parentId: 'a1', activeChildId: null },
    ],
  })
  const path = walkActivePath(tree)

  const onSend = useCallback(async () => {
    script.push(...drainedScript)
    await stream.send('explain limits')
    setSent(true)
  }, [stream])

  return (
    <div className="flex flex-col gap-4 p-4" style={{ maxWidth: 560 }}>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide opacity-60">status</span>
        <span className="font-semibold">{stream.status}</span>
        {stream.live ? <Button size="sm" variant="outline" onClick={() => void stream.stop()}>Stop</Button> : null}
        <Button size="sm" variant="outline" onClick={() => stream.reset()}>Reset</Button>
      </div>
      {stream.reasoning !== null ? (
        <pre className="max-h-24 overflow-auto rounded border p-2 text-xs opacity-70">{stream.reasoning}</pre>
      ) : null}
      {stream.text !== null ? (
        <pre className="max-h-40 overflow-auto rounded border p-2 text-xs">{stream.text}</pre>
      ) : null}
      {stream.toolCalls.length > 0 ? (
        <ul className="text-xs">
          {stream.toolCalls.map((call) => (
            <li key={call.id}>
              {call.name}: {call.status}
              {call.result ? ` (${call.result})` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      {stream.error ? <p className="text-xs">error: {stream.error.code}</p> : null}
      <Button disabled={sent && stream.live !== null} onClick={() => void onSend()}>
        Send a scripted turn
      </Button>
      <div className="rounded border p-2 text-xs">
        <p className="mb-1 font-semibold">walkActivePath(tree)</p>
        <ol className="list-inside list-decimal">
          {path.map((id) => (
            <li key={id}>
              {id} — {tree.nodes[id]?.excerpt}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

const drainedScript: ChatStreamEvent[] = [
  { event: 'flow_started', flow: 'chat', run_id: 'r2' },
  { event: 'delta', text: 'Second turn answer.' },
  { event: 'flow_finished' },
]
