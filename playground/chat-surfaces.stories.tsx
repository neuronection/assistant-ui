import { useState } from 'react'
import { GitBranch } from 'lucide-react'

import { ChatTranscript } from '../src/components/chat-transcript/ChatTranscript'
import { ChatBranchTree } from '../src/components/chat-branch-tree/ChatBranchTree'
import { ChatSessionList } from '../src/components/chat-session-list/ChatSessionList'
import { ChatPanel } from '../src/components/chat-panel/ChatPanel'
import { ChatLauncher } from '../src/components/chat-launcher/ChatLauncher'
import { ChatDrawer } from '../src/components/chat-drawer/ChatDrawer'
import { ChatComposer } from '../src/components/chat-composer/ChatComposer'
import { ChatMessage } from '../src/components/chat-message/ChatMessage'
import { ChatReasoning } from '../src/components/chat-reasoning/ChatReasoning'
import { MarkdownSurface } from '../src/components/chat-markdown/MarkdownSurface'
import { buildBranchTree } from '../src/components/chat-core'
import type { ChatMessageView } from '../src/components/chat-core'

const messages: ChatMessageView[] = [
  { id: 'u1', role: 'user', content: 'Explain limits.', status: 'done' },
  {
    id: 'a1',
    role: 'assistant',
    content: 'A **limit** is the value a function approaches — formally $\\lim_{x \\to a} f(x) = L$.',
    status: 'done',
    reasoning: 'Start with intuition, then the formal definition.',
  },
  { id: 'u2', role: 'user', content: 'Show me an example with a table.', status: 'done' },
  {
    id: 'a2',
    role: 'assistant',
    content: '| x | f(x) |\n| --- | --- |\n| 1.9 | 3.61 |\n| 1.99 | 3.9601 |\n| 2.01 | 4.0401 |',
    status: 'done',
  },
]

const tree = buildBranchTree({
  activeRootId: 'u1',
  nodes: [
    { id: 'u1', role: 'user', excerpt: 'Explain limits.', parentId: null, activeChildId: 'a1' },
    { id: 'a1', role: 'assistant', excerpt: 'A limit is the value…', parentId: 'u1', activeChildId: 'u2a' },
    { id: 'u2a', role: 'user', excerpt: 'Show me an example with a table.', parentId: 'a1', activeChildId: null },
    { id: 'u2b', role: 'user', excerpt: 'Show a graph instead (edited)', parentId: 'a1', activeChildId: null },
    { id: 'a2', role: 'assistant', excerpt: 'tabular approach…', parentId: 'u2a', activeChildId: null },
  ],
})

const now = Date.now()
const sessions = [
  { id: 's1', title: 'Limits tutoring', updatedAt: new Date(now) },
  { id: 's2', title: 'Derivatives practice', updatedAt: new Date(now - 26 * 3600_000) },
  { id: 's3', title: 'Integrals — old chat', updatedAt: new Date(now - 8 * 24 * 3600_000) },
]

export function Transcript() {
  return (
    <div style={{ height: 420, maxWidth: 520, display: 'flex', flexDirection: 'column', border: '1px solid var(--as-border)', borderRadius: 'var(--as-radius-lg)' }}>
      <ChatTranscript
        items={messages}
        renderItem={(message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={<MarkdownSurface value={message.content} />}
            reasoning={message.reasoning ? <ChatReasoning text={message.reasoning} /> : null}
            variants={message.variants}
          />
        )}
        live={
          <ChatMessage
            role="assistant"
            status="streaming"
            content={<MarkdownSurface value="The table shows f(x) closing in on 4 as x approaches 2…▍" streaming />}
            reasoning={<ChatReasoning text="Tabular intuition first; the graph follows." streaming />}
          />
        }
      />
    </div>
  )
}

export function BranchTree() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div style={{ width: 360, border: '1px solid var(--as-border)', borderRadius: 'var(--as-radius-lg)', padding: 8 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 6, color: 'var(--as-muted-fg)' }}>
        <GitBranch className="size-3.5" aria-hidden /> selected: {selected ?? '—'}
      </p>
      <ChatBranchTree tree={tree} onSelect={setSelected} />
    </div>
  )
}

export function SessionList() {
  const [active, setActive] = useState('s1')
  return (
    <div style={{ width: 300, height: 420 }}>
      <ChatSessionList
        sessions={sessions}
        activeId={active}
        onSelect={setActive}
        onNew={() => {}}
        onRename={() => {}}
        onDelete={() => {}}
        onExport={() => {}}
      />
    </div>
  )
}

export function BubbleSurface() {
  return (
    <div style={{ position: 'relative', height: 480, border: '1px dashed var(--as-border)', borderRadius: 'var(--as-radius-lg)', overflow: 'hidden' }}>
      <p style={{ padding: 12, fontSize: 12, color: 'var(--as-muted-fg)' }}>app page behind the launcher…</p>
      <ChatLauncher
        defaultOpen
        panel={
          <ChatPanel
            variant="bubble"
            title="Assistant"
            transcript={<ChatTranscript items={messages.slice(0, 2)} />}
            composer={<ChatComposer value="" onValueChange={() => {}} onSubmit={() => {}} />}
            footer="AI can make mistakes"
          />
        }
      />
    </div>
  )
}


export function DrawerSurface() {
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(440)
  return (
    <div style={{ minHeight: 160 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ padding: '6px 12px', borderRadius: 'var(--as-radius)', border: '1px solid var(--as-border)' }}
      >
        {open ? 'Hide' : 'Show'} drawer
      </button>
      <ChatDrawer
        open={open}
        onOpenChange={setOpen}
        width={width}
        onWidthChange={setWidth}
        title="Study chat"
        panel={
          <ChatPanel
            variant="sidebar"
            title="Tutor"
            transcript={<ChatTranscript items={messages} />}
            composer={<ChatComposer value="" onValueChange={() => {}} onSubmit={() => {}} />}
          />
        }
      />
    </div>
  )
}

export function PageSurface() {
  return (
    <div style={{ height: 520, display: 'flex', border: '1px solid var(--as-border)', borderRadius: 'var(--as-radius-lg)', overflow: 'hidden' }}>
      <div style={{ width: 240, borderRight: '1px solid var(--as-border)', padding: 12, fontSize: 12, color: 'var(--as-muted-fg)' }}>
        app session-list aside…
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ChatPanel
          variant="page"
          title="Tutor"
          transcript={<ChatTranscript items={messages} renderItem={(message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={<MarkdownSurface value={message.content} />}
            />
          )} />}
          composer={<ChatComposer value="" onValueChange={() => {}} onSubmit={() => {}} />}
        />
      </div>
    </div>
  )
}
