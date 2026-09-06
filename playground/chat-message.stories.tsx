import { Brain } from 'lucide-react'

import { ChatMessage } from '../src/components/chat-message/ChatMessage'
import { MessageVariantSwitcher } from '../src/components/chat-message/MessageVariantSwitcher'
import { ChatMessageEditor } from '../src/components/chat-message/ChatMessageEditor'
import { ChatReasoning } from '../src/components/chat-reasoning/ChatReasoning'
import { ChatToolCard } from '../src/components/chat-tool-card/ChatToolCard'
import { MarkdownSurface } from '../src/components/chat-markdown/MarkdownSurface'

export const Assistant = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
    <ChatMessage
      role="user"
      content={<MarkdownSurface value="Explain limits with a diagram and an example." />}
    />
    <ChatMessage
      role="assistant"
      content={
        <MarkdownSurface
          value={
            'A **limit** describes where a function heads:\n\n$$\n\\lim_{x \\to 2} x^2 = 4\n$$\n\n```\nf(1.9) = 3.61\nf(1.99) = 3.9601\n```'
          }
        />
      }
      reasoning={<ChatReasoning text="The user wants intuition first, then formality. Start with the table, then the definition." streaming />}
      actions={{ onCopy: () => {}, onRegenerate: () => {} }}
      meta={<span>gemini-flash · 1.2 s · 214 tokens</span>}
    >
      <ChatToolCard
        name="plot_function"
        title="Plotting f(x) = x²"
        status="done"
        args={'{"from": 1.9, "to": 2.1}'}
        result="chart rendered"
        durationMs={340}
        defaultOpen
      />
    </ChatMessage>
  </div>
)

export const UserEditing = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
    <ChatMessage
      role="user"
      content="oroginal prompt with typo"
      actions={{ onEdit: () => {}, onCopy: () => {} }}
      editing={{
        value: 'original prompt, fixed',
        onValueChange: () => {},
        onSubmit: () => {},
        onCancel: () => {},
      }}
    />
  </div>
)

export const Variants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
    <ChatMessage
      role="user"
      content={<MarkdownSurface value="What is a derivative?" />}
      actions={{ onEdit: () => {} }}
    />
    <ChatMessage
      role="assistant"
      content={<MarkdownSurface value="The slope of the tangent line at a point." />}
      actions={{ onCopy: () => {}, onRegenerate: () => {} }}
      variants={{ index: 2, count: 3, siblingIds: ['v1', 'v2', 'v3'] }}
      onSelectVariant={() => {}}
    />
  </div>
)

export const Failed = () => (
  <div style={{ maxWidth: 520 }}>
    <ChatMessage
      role="assistant"
      content={<MarkdownSurface value="The derivative of…" />}
      status="error"
      error={{ code: 'rate_limit', message: 'Provider rate limit reached. Try again in a moment.', retryable: true }}
      actions={{ onRetry: () => {}, onCopy: () => {} }}
    />
  </div>
)

export const SwitcherStandalone = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <MessageVariantSwitcher variants={{ index: 1, count: 3, siblingIds: ['a', 'b', 'c'] }} onSelect={() => {}} />
    <MessageVariantSwitcher variants={{ index: 2, count: 3, siblingIds: ['a', 'b', 'c'] }} onSelect={() => {}} />
    <ChatReasoning text="Short reasoning trace shown expanded by default." icon={Brain} />
    <ChatMessageEditor value="edited prompt" onValueChange={() => {}} onSubmit={() => {}} onCancel={() => {}} />
  </div>
)

export const ToolResultViews = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
    <ChatToolCard
      name="QUIZ"
      title="Quiz me"
      status="done"
      args={'{"question": "What is the derivative of x²?"}'}
      result="correct"
      durationMs={210}
      defaultOpen
      renderResult={() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 600 }}>What is the derivative of x²?</div>
          <div
            style={{
              border: '1px solid var(--as-border)',
              borderRadius: 'var(--as-radius-sm)',
              padding: '4px 8px',
              color: 'var(--as-success)',
            }}
          >
            ✓ 2x — correct
          </div>
        </div>
      )}
    />
    <ChatToolCard
      name="STATE"
      title="Preferences"
      status="done"
      durationMs={12}
      defaultOpen
      renderResult={() => <div>Notepad preference saved: “compact mode”.</div>}
    />
    <ChatToolCard name="search" status="done" args="{}" result="12 hits" durationMs={1400} defaultOpen />
  </div>
)
