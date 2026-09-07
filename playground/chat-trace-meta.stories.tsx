import { ChatTraceMeta } from '../src/components/chat-trace-meta/ChatTraceMeta'

export const Default = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
    <ChatTraceMeta model="gpt-5.6" durationMs={1930} toolCount={3} />
    <ChatTraceMeta model="claude-4.5" durationMs={640} toolCount={1} />
    <ChatTraceMeta durationMs={280} />
  </div>
)

export const Empty = () => (
  <div style={{ maxWidth: 420 }}>
    <ChatTraceMeta />
  </div>
)
