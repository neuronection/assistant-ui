import { buildChatMarkdown, type ChatExportMessage } from '../src/components/chat-export/buildChatMarkdown'

const messages: ChatExportMessage[] = [
  { role: 'user', content: 'find nursing jobs' },
  {
    role: 'assistant',
    content: 'Here are **matches**:\n\n- NO-1210 Nurse (Oslo)',
  },
]

const markdown = buildChatMarkdown('Career chat', messages, {
  assistantLabel: 'Career Assistant',
  annotations: (message) =>
    message.role === 'assistant' ? ['jobs: NO-1210 · postings: REF-9'] : [],
})

export const BoldStyle = () => (
  <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', maxWidth: 480 }}>{markdown}</pre>
)

export const HeadingStyle = () => (
  <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', maxWidth: 480 }}>
    {buildChatMarkdown('Tutor session', messages, {
      roleStyle: 'heading',
      userLabel: '🙋 Question',
      assistantLabel: '🤖 Tutor',
    })}
  </pre>
)
