import { ChatTurnStatus } from '../src/components/chat-turn-status/ChatTurnStatus'

export const TurnStatusRow = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
    <ChatTurnStatus label="searching the catalog" startedAt={Date.now() - 812} />
    <ChatTurnStatus label="writing the reply" startedAt={Date.now() - 1540} />
    <ChatTurnStatus label="thinking" />
  </div>
)

export const TurnStatusCard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
    <ChatTurnStatus
      label="thinking"
      variant="card"
      startedAt={Date.now() - 640}
      labels={{ timer: 'Elapsed seconds shown beside the phase' }}
    />
    <ChatTurnStatus label="connecting" variant="card" />
  </div>
)
