import {
  ChatTraceTimeline,
  type ChatTraceTimelineEntry,
} from '../src/components/chat-trace-timeline/ChatTraceTimeline'

const entries: ChatTraceTimelineEntry[] = [
  { kind: 'phase', label: 'searching the catalog', startMs: 0, durationMs: 1200 },
  { kind: 'tool', label: 'search_jobs', detail: '{"query": "nurse"}', startMs: 60, durationMs: 45 },
  { kind: 'tool', label: 'get_posting', detail: '{"ref": "ABCD1234"}', startMs: 700, durationMs: 120 },
  { kind: 'phase', label: 'writing the reply', startMs: 1250, durationMs: 800 },
]

export const Default = () => (
  <div style={{ maxWidth: 460 }}>
    <ChatTraceTimeline
      trace={{ model: 'gpt-5.6', latencyMs: 2050, outputTokens: 210, thinking: 'I should search the catalog first.' }}
      entries={entries}
    />
  </div>
)

export const Open = () => (
  <div style={{ maxWidth: 460 }}>
    <ChatTraceTimeline
      trace={{ model: 'gpt-5.6', latencyMs: 2050, inputTokens: 900, outputTokens: 210, thinking: 'I should search the catalog first.' }}
      entries={entries}
      defaultOpen
    />
  </div>
)

export const Bare = () => (
  <div style={{ maxWidth: 460 }}>
    <ChatTraceTimeline trace={{ latencyMs: 640 }} entries={[]} />
  </div>
)

const observableEntries: ChatTraceTimelineEntry[] = [
  { kind: 'phase', label: 'thinking', startMs: 0, durationMs: 9000 },
  {
    kind: 'tool',
    label: 'notify',
    detail: '{"message": "ping"}',
    args: '{\n  "message": "ping",\n  "title": "Turn complete"\n}',
    response: 'Notification delivered to the system tray.',
    status: 'ok',
    startMs: 9000,
    durationMs: 45,
  },
  {
    kind: 'tool',
    label: 'failing_tool',
    response: 'Permission denied: root not granted for this session.',
    status: 'error',
    startMs: 9100,
    durationMs: 12,
  },
]

export const ToolObservability = () => (
  <div style={{ maxWidth: 520 }}>
    <ChatTraceTimeline
      trace={{ model: 'gpt-5.6', latencyMs: 9600, outputTokens: 180 }}
      entries={observableEntries}
      defaultOpen
    />
  </div>
)
