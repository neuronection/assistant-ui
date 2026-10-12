import { ChatWelcome } from '../src/components/chat-welcome/ChatWelcome'
import { ChatSuggestionCard } from '../src/components/chat-suggestion-card/ChatSuggestionCard'
import { CalendarRange, GraduationCap, Sparkles } from 'lucide-react'

export const Default = () => (
  <div style={{ height: 420, maxWidth: 460, border: '1px solid var(--as-border)', borderRadius: 'var(--as-radius-lg)' }}>
    <ChatWelcome
      title="Ask anything about your courses"
      subtitle="I can plan your revision, quiz you, and explain anything step by step."
      suggestions={
        <>
          <ChatSuggestionCard icon={CalendarRange} hint="plan">
            Plan my revision for the calculus test
          </ChatSuggestionCard>
          <ChatSuggestionCard icon={GraduationCap} hint="quiz">
            Quiz me on limits
          </ChatSuggestionCard>
          <ChatSuggestionCard icon={Sparkles}>
            Explain the formal definition with a graph
          </ChatSuggestionCard>
        </>
      }
    />
  </div>
)

export const BubbleVariant = () => (
  <div style={{ height: 300, maxWidth: 360, border: '1px solid var(--as-border)', borderRadius: 'var(--as-radius-lg)' }}>
    <ChatWelcome title="Need a hand?" subtitle="Ask about symptoms, meds or appointments." variant="bubble" />
  </div>
)
