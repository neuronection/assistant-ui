import { Clock } from 'lucide-react'

import { ChatHistoryButton } from '../src/components/chat-history-button/ChatHistoryButton'

export const Default = () => (
  <ChatHistoryButton>
    {(close) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 12 }}>Session list goes here (app glue).</p>
        <button
          type="button"
          onClick={close}
          style={{ fontSize: 12, textAlign: 'left', cursor: 'pointer' }}
        >
          Pick a session (closes)
        </button>
      </div>
    )}
  </ChatHistoryButton>
)

export const CustomIcon = () => (
  <ChatHistoryButton icon={Clock} panelClassName="h-64 w-64">
    {() => <p style={{ fontSize: 12 }}>Compact panel.</p>}
  </ChatHistoryButton>
)
