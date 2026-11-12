import { ChatPending } from '../src/components/chat-pending/ChatPending'

export const Default = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
    <ChatPending label="thinking" startedAt={Date.now() - 620} />
  </div>
)

export const PhaseAndLines = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
    <ChatPending label="searching the catalog" startedAt={Date.now() - 1830} lines={3} />
    <ChatPending label="waiting for the first token" />
  </div>
)
