import { useState } from 'react'
import { Plus } from 'lucide-react'

import { ChatComposer } from '../src/components/chat-composer/ChatComposer'
import { Button } from '../src/components/button/Button'

function ComposerStory({
  sending,
  onStop,
  initialValue = 'Explain the limit definition, with a diagram',
}: {
  sending?: boolean
  onStop?: () => void
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <div style={{ maxWidth: 520 }}>
      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSubmit={() => {}}
        sending={sending}
        onStop={onStop}
        toolbarStart={
          <Button variant="ghost" size="sm" aria-label="Attach">
            <Plus className="size-4" />
          </Button>
        }
        suggestions={
          <div style={{ display: 'flex', gap: 6 }}>
            {['Summarize chapter 3', 'Quiz me on derivatives'].map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid var(--as-border)',
                  color: 'var(--as-muted-fg)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        }
      />
    </div>
  )
}

export const Default = () => <ComposerStory />
export const Sending = () => <ComposerStory sending onStop={() => {}} />
export const Multiline = () => (
  <ComposerStory initialValue={'Paste a long text here —\nthe row exposes data-multiline\nonce the textarea grows past one line.'} />
)

const commandItems = [
  { id: 'plan', label: 'Plan my revision', hint: 'calendar' },
  { id: 'quiz', label: 'Quiz me', hint: 'flashcards' },
  { id: 'summarize', label: 'Summarize notes', hint: 'markdown' },
  { id: 'search', label: 'Search the catalog', hint: 'courses' },
]

export const SlashCommands = () => {
  const [value, setValue] = useState('')
  const [sent, setSent] = useState<string[]>([])
  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ fontSize: 12, color: 'var(--as-muted-fg)', marginBottom: 8 }}>
        Type <code>/</code> to open the palette — Enter selects, Escape dismisses. Clear the draft and press ArrowUp to recall.
      </p>
      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSubmit={() => {
          setSent((entries) => [...entries, value])
          setValue('')
        }}
        commands={{
          trigger: '/',
          items: commandItems,
          onSelect: (id, token) =>
            setValue((draft) => `${draft.slice(0, token.start)}/${id} `),
        }}
        history={sent}
      />
    </div>
  )
}
